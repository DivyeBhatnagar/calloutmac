import Razorpay from 'razorpay';
import crypto from 'crypto';
import { db } from '../../config/firebase.admin';

export const paymentService = {
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
        const entryFee = tDoc.data()?.entryFee || 0;

        const amount = entryFee * 100; // in paise

        const options = {
            amount,
            currency: "INR",
            receipt: `receipt_${registrationId}`,
        };

        const order = await razorpay.orders.create(options);

        const newPaymentRef = db.collection('payments').doc();
        const paymentData = {
            registrationId,
            amount: entryFee,
            orderId: order.id,
            status: 'PENDING',
            createdAt: new Date().toISOString()
        };

        await newPaymentRef.set(paymentData);

        return order;
    },

    async verifyPayment(data: any) {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationId } = data;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || '')
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            throw { statusCode: 400, message: 'Invalid payment signature' };
        }

        const pSnapshot = await db.collection('payments').where('orderId', '==', razorpay_order_id).get();

        const batch = db.batch();

        if (!pSnapshot.empty) {
            const pDocRef = db.collection('payments').doc(pSnapshot.docs[0].id);
            batch.update(pDocRef, {
                paymentId: razorpay_payment_id,
                signature: razorpay_signature,
                status: 'VERIFIED'
            });
        }

        const rDocRef = db.collection('registrations').doc(registrationId);
        batch.update(rDocRef, { paymentStatus: 'VERIFIED' });

        await batch.commit();

        return { success: true };
    },

    async handleWebhook(body: any, signature: string) {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(JSON.stringify(body))
            .digest("hex");

        if (expectedSignature !== signature) {
            throw { statusCode: 400, message: 'Invalid webhook signature' };
        }

        const event = body.event;

        if (event === 'payment.captured') {
            const paymentEntity = body.payload.payment.entity;
            const orderId = paymentEntity.order_id;

            const pSnapshot = await db.collection('payments').where('orderId', '==', orderId).get();
            if (!pSnapshot.empty) {
                const pDoc = pSnapshot.docs[0];
                const pData = pDoc.data();
                if (pData.status !== 'VERIFIED') {
                    const batch = db.batch();

                    batch.update(db.collection('payments').doc(pDoc.id), { status: 'VERIFIED', paymentId: paymentEntity.id });
                    batch.update(db.collection('registrations').doc(pData.registrationId), { paymentStatus: 'VERIFIED' });

                    await batch.commit();
                }
            }
        }

        return { received: true };
    },

    // ==========================================
    // DYNAMIC QR ROUND-ROBIN IMPLEMENTATION
    // ==========================================

    async assignQr(userId: string, data: any) {
        const { registrationId } = data;

        // 1. Validate registration
        const regDoc = await db.collection('registrations').doc(registrationId).get();
        if (!regDoc.exists || regDoc.data()?.userId !== userId) {
            throw { statusCode: 404, message: 'Registration not found or unauthorized' };
        }

        const regData = regDoc.data()!;
        if (regData.paymentStatus === 'VERIFIED') {
            throw { statusCode: 400, message: 'Payment already verified' };
        }

        const tDoc = await db.collection('tournaments').doc(regData.tournamentId).get();
        if (!tDoc.exists) {
            throw { statusCode: 404, message: 'Tournament not found' };
        }

        const amount = tDoc.data()?.paymentAmount || 0; // fallback to paymentAmount field instead of entryFee for consistency

        if (amount === 0) {
            throw { statusCode: 400, message: 'This tournament is free, no QR assignment needed' };
        }

        let assignedQr: any = null;
        let qrIndexToAssign: number = 0;

        // 2. Perform Atomic Transaction for Round-Robin QR Assignment
        await db.runTransaction(async (transaction) => {
            const systemRef = db.collection('system_settings').doc('qr_rotation');
            const sysDoc = await transaction.get(systemRef);

            if (!sysDoc.exists) {
                throw { statusCode: 500, message: 'System settings for QR rotation not found' };
            }

            const sysData = sysDoc.data()!;
            let currentIndex = sysData.currentIndex || 0;
            const totalQRs = sysData.totalQRs || 5;

            // Fetch the specific QR code matching the currentIndex
            const qrSnapshot = await transaction.get(db.collection('qr_codes').doc(currentIndex.toString()));
            if (!qrSnapshot.exists || !qrSnapshot.data()?.isActive) {
                // Failsafe: if QR is missing or inactive, we gracefully fail so admin can fix DB.
                throw { statusCode: 500, message: `Active QR Code with ID ${currentIndex} not found.` };
            }

            assignedQr = { id: qrSnapshot.id, ...qrSnapshot.data() };
            qrIndexToAssign = currentIndex;

            // Increment Current Index (Round-Robin logic)
            let nextIndex = currentIndex + 1;
            if (nextIndex >= totalQRs) {
                nextIndex = 0; // Reset
            }

            // Write operations
            transaction.update(systemRef, {
                currentIndex: nextIndex,
                lastUpdated: new Date()
            });

            transaction.update(db.collection('qr_codes').doc(qrSnapshot.id), {
                usageCount: (assignedQr.usageCount || 0) + 1,
                lastUsedAt: new Date()
            });

            transaction.update(db.collection('registrations').doc(registrationId), {
                assignedQrIndex: qrIndexToAssign
            });
        });

        // 3. Return securely to frontend
        return {
            qrIndex: qrIndexToAssign,
            qrImageUrl: assignedQr?.imageUrl,
            amount: amount,
            expiresInMinutes: 15
        };
    },

    async submitPayment(userId: string, data: any) {
        const { registrationId, transactionId, upiId, paymentDate, paymentTime } = data;

        if (!registrationId || !transactionId || !paymentDate) {
            throw { statusCode: 400, message: 'Missing required payment submission fields' };
        }

        // 1. Verify Registration Structure
        const regRef = db.collection('registrations').doc(registrationId);
        const regDoc = await regRef.get();

        if (!regDoc.exists || regDoc.data()?.userId !== userId) {
            throw { statusCode: 404, message: 'Registration not found or unauthorized' };
        }

        const regData = regDoc.data()!;

        if (regData.paymentStatus === 'VERIFIED') {
            throw { statusCode: 400, message: 'Payment is already verified' };
        }

        if (regData.paymentStatus === 'PENDING' && regData.paymentDetails?.transactionId === transactionId) {
            throw { statusCode: 400, message: 'This exact transaction ID was already submitted' };
        }

        const qrCodeUsed = regData.assignedQrIndex?.toString() || 'Unknown';

        // 2. Atomic Batch Update
        const batch = db.batch();

        batch.update(regRef, {
            paymentStatus: 'PENDING',
            paymentDetails: {
                transactionId,
                upiId: upiId || null,
                paymentDate,
                paymentTime: paymentTime || null,
                qrCodeUsed,
                submittedAt: new Date().toISOString()
            }
        });

        const newPaymentRef = db.collection('payments').doc();
        batch.set(newPaymentRef, {
            registrationId,
            userId,
            transactionId,
            qrCodeUsed,
            upiId: upiId || null,
            status: 'PENDING',
            createdAt: new Date()
        });

        await batch.commit();

        return { success: true, message: 'Payment successfully submitted for verification' };
    }
};
