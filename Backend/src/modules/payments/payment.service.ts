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
    }
};
