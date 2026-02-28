"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const firebase_admin_1 = require("../../config/firebase.admin");
exports.paymentService = {
    createOrder(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const razorpay = new razorpay_1.default({
                key_id: process.env.RAZORPAY_KEY_ID || '',
                key_secret: process.env.RAZORPAY_KEY_SECRET || '',
            });
            const { registrationId } = data;
            const regDoc = yield firebase_admin_1.db.collection('registrations').doc(registrationId).get();
            if (!regDoc.exists || ((_a = regDoc.data()) === null || _a === void 0 ? void 0 : _a.userId) !== userId) {
                throw { statusCode: 404, message: 'Registration not found or unauthorized' };
            }
            const regData = regDoc.data();
            if (regData.paymentStatus === 'VERIFIED') {
                throw { statusCode: 400, message: 'Payment already verified' };
            }
            const tDoc = yield firebase_admin_1.db.collection('tournaments').doc(regData.tournamentId).get();
            const entryFee = ((_b = tDoc.data()) === null || _b === void 0 ? void 0 : _b.entryFee) || 0;
            const amount = entryFee * 100; // in paise
            const options = {
                amount,
                currency: "INR",
                receipt: `receipt_${registrationId}`,
            };
            const order = yield razorpay.orders.create(options);
            const newPaymentRef = firebase_admin_1.db.collection('payments').doc();
            const paymentData = {
                registrationId,
                amount: entryFee,
                orderId: order.id,
                status: 'PENDING',
                createdAt: new Date().toISOString()
            };
            yield newPaymentRef.set(paymentData);
            return order;
        });
    },
    verifyPayment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationId } = data;
            const body = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSignature = crypto_1.default
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || '')
                .update(body.toString())
                .digest("hex");
            if (expectedSignature !== razorpay_signature) {
                throw { statusCode: 400, message: 'Invalid payment signature' };
            }
            const pSnapshot = yield firebase_admin_1.db.collection('payments').where('orderId', '==', razorpay_order_id).get();
            const batch = firebase_admin_1.db.batch();
            if (!pSnapshot.empty) {
                const pDocRef = firebase_admin_1.db.collection('payments').doc(pSnapshot.docs[0].id);
                batch.update(pDocRef, {
                    paymentId: razorpay_payment_id,
                    signature: razorpay_signature,
                    status: 'VERIFIED'
                });
            }
            const rDocRef = firebase_admin_1.db.collection('registrations').doc(registrationId);
            batch.update(rDocRef, { paymentStatus: 'VERIFIED' });
            yield batch.commit();
            return { success: true };
        });
    },
    handleWebhook(body, signature) {
        return __awaiter(this, void 0, void 0, function* () {
            const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
            const expectedSignature = crypto_1.default
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
                const pSnapshot = yield firebase_admin_1.db.collection('payments').where('orderId', '==', orderId).get();
                if (!pSnapshot.empty) {
                    const pDoc = pSnapshot.docs[0];
                    const pData = pDoc.data();
                    if (pData.status !== 'VERIFIED') {
                        const batch = firebase_admin_1.db.batch();
                        batch.update(firebase_admin_1.db.collection('payments').doc(pDoc.id), { status: 'VERIFIED', paymentId: paymentEntity.id });
                        batch.update(firebase_admin_1.db.collection('registrations').doc(pData.registrationId), { paymentStatus: 'VERIFIED' });
                        yield batch.commit();
                    }
                }
            }
            return { received: true };
        });
    }
};
