import admin, { db } from '../../config/firebase.admin';
import Razorpay from 'razorpay';
import crypto from 'crypto';

export const paymentService = {

    // ============================================================
    // LEGACY RAZORPAY FLOW (preserved, not part of QR system)
    // ============================================================

    async createOrder(userId: string, data: any) {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || '',
            key_secret: process.env.RAZORPAY_KEY_SECRET || '',
        });

        const { registrationId } = data;

        const regDoc = await db.collection('registrations').doc(registrationId).get();
        if (!regDoc.exists || regDoc.data()?.userId !== userId) {
            throw { statusCode: 404, message: 'Registration not found or unauthorized' };
        }

        const regData = regDoc.data()!;
        if (regData.paymentStatus === 'VERIFIED') {
            throw { statusCode: 400, message: 'Payment already verified' };
        }

        const tDoc = await db.collection('tournaments').doc(regData.tournamentId).get();
        const entryFee = tDoc.data()?.entryFee ?? tDoc.data()?.paymentAmount ?? 0;
        const amount = entryFee * 100; // paise

        const options = {
            amount,
            currency: 'INR',
            receipt: `receipt_${registrationId}`,
        };

        const order = await razorpay.orders.create(options);

        const newPaymentRef = db.collection('payments').doc();
        await newPaymentRef.set({
            registrationId,
            amount: entryFee,
            orderId: order.id,
            status: 'PENDING',
            createdAt: admin.firestore.Timestamp.now()
        });

        return order;
    },

    async verifyPayment(data: any) {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationId } = data;

        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            throw { statusCode: 400, message: 'Invalid payment signature' };
        }

        const pSnapshot = await db.collection('payments').where('orderId', '==', razorpay_order_id).get();
        const batch = db.batch();

        if (!pSnapshot.empty) {
            batch.update(db.collection('payments').doc(pSnapshot.docs[0].id), {
                paymentId: razorpay_payment_id,
                signature: razorpay_signature,
                status: 'VERIFIED'
            });
        }

        batch.update(db.collection('registrations').doc(registrationId), {
            paymentStatus: 'VERIFIED'
        });

        await batch.commit();
        return { success: true };
    },

    async handleWebhook(body: any, signature: string) {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(body))
            .digest('hex');

        if (expectedSignature !== signature) {
            throw { statusCode: 400, message: 'Invalid webhook signature' };
        }

        if (body.event === 'payment.captured') {
            const paymentEntity = body.payload.payment.entity;
            const orderId = paymentEntity.order_id;

            const pSnapshot = await db.collection('payments').where('orderId', '==', orderId).get();
            if (!pSnapshot.empty) {
                const pDoc = pSnapshot.docs[0];
                const pData = pDoc.data();
                if (pData.status !== 'VERIFIED') {
                    const batch = db.batch();
                    batch.update(db.collection('payments').doc(pDoc.id), {
                        status: 'VERIFIED',
                        paymentId: paymentEntity.id
                    });
                    batch.update(db.collection('registrations').doc(pData.registrationId), {
                        paymentStatus: 'VERIFIED'
                    });
                    await batch.commit();
                }
            }
        }

        return { received: true };
    },

    // ============================================================
    // STEP 6 — DYNAMIC QR ASSIGNMENT (ROUND-ROBIN)
    // POST /api/payments/assign-qr
    // Used by the OLD two-step flow (kept for backward compatibility).
    // New flow: use GET /api/payments/preview-qr + POST /api/registrations/complete-with-payment
    // ============================================================
    async assignQr(userId: string, data: any) {
        const { registrationId } = data;

        if (!registrationId) {
            throw { statusCode: 400, message: 'registrationId is required' };
        }

        const regDoc = await db.collection('registrations').doc(registrationId).get();
        if (!regDoc.exists || regDoc.data()?.userId !== userId) {
            throw { statusCode: 404, message: 'Registration not found or unauthorized' };
        }

        const regData = regDoc.data()!;

        if (regData.paymentStatus !== 'INITIATED') {
            if (regData.paymentStatus === 'PENDING') {
                throw { statusCode: 400, message: 'Payment already submitted — awaiting admin verification' };
            }
            if (regData.paymentStatus === 'VERIFIED') {
                throw { statusCode: 400, message: 'Payment already verified' };
            }
            throw { statusCode: 400, message: `Cannot assign QR: current status is ${regData.paymentStatus}` };
        }

        const tDoc = await db.collection('tournaments').doc(regData.tournamentId).get();
        if (!tDoc.exists) {
            throw { statusCode: 404, message: 'Tournament not found' };
        }

        const tData = tDoc.data()!;
        const amount: number = tData.entryFee ?? tData.paymentAmount ?? 0;

        if (amount === 0) {
            throw { statusCode: 400, message: 'This tournament is free — no QR assignment needed' };
        }

        let assignedQr: any = null;
        let qrIndexAssigned: number = 0;

        await db.runTransaction(async (transaction) => {
            const systemRef = db.collection('system_settings').doc('qr_rotation');
            const sysDoc = await transaction.get(systemRef);

            if (!sysDoc.exists) {
                throw { statusCode: 500, message: 'QR rotation system settings not found — contact admin' };
            }

            const sysData = sysDoc.data()!;
            const currentIndex: number = sysData.currentIndex ?? 0;
            const totalQRs: number = sysData.totalQRs ?? 5;

            const qrSnap = await transaction.get(db.collection('qr_codes').doc(String(currentIndex)));

            if (!qrSnap.exists || !qrSnap.data()?.isActive) {
                throw { statusCode: 500, message: `No active QR code found at index ${currentIndex} — contact admin` };
            }

            assignedQr = { id: qrSnap.id, ...qrSnap.data() };
            qrIndexAssigned = currentIndex;

            const nextIndex = (currentIndex + 1) >= totalQRs ? 0 : currentIndex + 1;

            transaction.update(systemRef, {
                currentIndex: nextIndex,
                lastUpdated: admin.firestore.Timestamp.now()
            });
            transaction.update(db.collection('qr_codes').doc(qrSnap.id), {
                usageCount: admin.firestore.FieldValue.increment(1),
                lastUsedAt: admin.firestore.Timestamp.now()
            });
            transaction.update(db.collection('registrations').doc(registrationId), {
                qrIndex: qrIndexAssigned
            });
        });

        return {
            qrIndex: qrIndexAssigned,
            qrImageUrl: assignedQr?.imageUrl,
            amount
        };
    },

    // ============================================================
    // STEP 8 — PAYMENT SUBMISSION (OLD TWO-STEP FLOW)
    // POST /api/payments/submit
    // Kept for backward compatibility. New flow uses completeWithPayment.
    // ============================================================
    async submitPayment(userId: string, data: any) {
        const { registrationId, transactionId, upiId, bankName, paymentDate, paymentTime } = data;

        if (!registrationId || !transactionId || !paymentDate) {
            throw { statusCode: 400, message: 'Missing required fields: registrationId, transactionId, paymentDate' };
        }

        const regRef = db.collection('registrations').doc(registrationId);
        const regDoc = await regRef.get();

        if (!regDoc.exists || regDoc.data()?.userId !== userId) {
            throw { statusCode: 404, message: 'Registration not found or unauthorized' };
        }

        const regData = regDoc.data()!;

        if (regData.paymentStatus !== 'INITIATED') {
            if (regData.paymentStatus === 'PENDING') {
                throw { statusCode: 400, message: 'Payment already submitted — awaiting admin verification' };
            }
            if (regData.paymentStatus === 'VERIFIED') {
                throw { statusCode: 400, message: 'Payment already verified — no resubmission allowed' };
            }
            throw { statusCode: 400, message: `Cannot submit payment: current status is ${regData.paymentStatus}` };
        }

        const dupSnap = await db.collection('payments')
            .where('transactionId', '==', transactionId)
            .limit(1)
            .get();

        if (!dupSnap.empty) {
            throw { statusCode: 400, message: 'Duplicate transaction ID — this payment has already been submitted' };
        }

        const qrIndex = regData.qrIndex ?? null;
        const submittedAt = admin.firestore.Timestamp.now();

        const newPaymentRef = db.collection('payments').doc();
        const batch = db.batch();

        batch.set(newPaymentRef, {
            registrationId,
            userId,
            transactionId,
            upiId: upiId || null,
            bankName: bankName || null,
            paymentDate,
            paymentTime: paymentTime || null,
            qrIndex,
            status: 'PENDING',
            submittedAt
        });

        batch.update(regRef, {
            paymentStatus: 'PENDING',
            submittedAt
        });

        await batch.commit();

        return {
            success: true,
            message: 'Payment submitted successfully — awaiting admin verification'
        };
    },

    // ============================================================
    // QR PREVIEW (READ-ONLY) — New deferred-registration flow
    // GET /api/payments/preview-qr?tournamentId=xxx
    //
    // Returns the current round-robin QR WITHOUT creating any
    // registration or incrementing the counter. The counter only
    // advances when the user submits payment via completeWithPayment.
    // ============================================================
    async previewQr(tournamentId: string) {
        if (!tournamentId) {
            throw { statusCode: 400, message: 'tournamentId is required' };
        }

        const tDoc = await db.collection('tournaments').doc(tournamentId).get();
        if (!tDoc.exists) {
            throw { statusCode: 404, message: 'Tournament not found' };
        }
        const tData = tDoc.data()!;
        const amount: number = tData.entryFee ?? tData.paymentAmount ?? 0;

        const sysDoc = await db.collection('system_settings').doc('qr_rotation').get();
        if (!sysDoc.exists) {
            throw { statusCode: 500, message: 'QR rotation system settings not found — contact admin' };
        }
        const sysData = sysDoc.data()!;
        const currentIndex: number = sysData.currentIndex ?? 0;

        const qrDoc = await db.collection('qr_codes').doc(String(currentIndex)).get();
        if (!qrDoc.exists || !qrDoc.data()?.isActive) {
            throw { statusCode: 500, message: `No active QR at index ${currentIndex} — contact admin` };
        }

        return {
            qrIndex: currentIndex,
            qrImageUrl: qrDoc.data()!.imageUrl,
            amount
        };
    }
};
