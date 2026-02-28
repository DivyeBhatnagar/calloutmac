"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const firebase_admin_1 = __importStar(require("../../config/firebase.admin"));
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
exports.paymentService = {
    // ============================================================
    // LEGACY RAZORPAY FLOW (preserved, not part of QR system)
    // ============================================================
    createOrder(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
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
            const entryFee = (_e = (_c = (_b = tDoc.data()) === null || _b === void 0 ? void 0 : _b.entryFee) !== null && _c !== void 0 ? _c : (_d = tDoc.data()) === null || _d === void 0 ? void 0 : _d.paymentAmount) !== null && _e !== void 0 ? _e : 0;
            const amount = entryFee * 100; // paise
            const options = {
                amount,
                currency: 'INR',
                receipt: `receipt_${registrationId}`,
            };
            const order = yield razorpay.orders.create(options);
            const newPaymentRef = firebase_admin_1.db.collection('payments').doc();
            yield newPaymentRef.set({
                registrationId,
                amount: entryFee,
                orderId: order.id,
                status: 'PENDING',
                createdAt: firebase_admin_1.default.firestore.Timestamp.now()
            });
            return order;
        });
    },
    verifyPayment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationId } = data;
            const body = razorpay_order_id + '|' + razorpay_payment_id;
            const expectedSignature = crypto_1.default
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
                .update(body)
                .digest('hex');
            if (expectedSignature !== razorpay_signature) {
                throw { statusCode: 400, message: 'Invalid payment signature' };
            }
            const pSnapshot = yield firebase_admin_1.db.collection('payments').where('orderId', '==', razorpay_order_id).get();
            const batch = firebase_admin_1.db.batch();
            if (!pSnapshot.empty) {
                batch.update(firebase_admin_1.db.collection('payments').doc(pSnapshot.docs[0].id), {
                    paymentId: razorpay_payment_id,
                    signature: razorpay_signature,
                    status: 'VERIFIED'
                });
            }
            batch.update(firebase_admin_1.db.collection('registrations').doc(registrationId), {
                paymentStatus: 'VERIFIED'
            });
            yield batch.commit();
            return { success: true };
        });
    },
    handleWebhook(body, signature) {
        return __awaiter(this, void 0, void 0, function* () {
            const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
            const expectedSignature = crypto_1.default
                .createHmac('sha256', secret)
                .update(JSON.stringify(body))
                .digest('hex');
            if (expectedSignature !== signature) {
                throw { statusCode: 400, message: 'Invalid webhook signature' };
            }
            if (body.event === 'payment.captured') {
                const paymentEntity = body.payload.payment.entity;
                const orderId = paymentEntity.order_id;
                const pSnapshot = yield firebase_admin_1.db.collection('payments').where('orderId', '==', orderId).get();
                if (!pSnapshot.empty) {
                    const pDoc = pSnapshot.docs[0];
                    const pData = pDoc.data();
                    if (pData.status !== 'VERIFIED') {
                        const batch = firebase_admin_1.db.batch();
                        batch.update(firebase_admin_1.db.collection('payments').doc(pDoc.id), {
                            status: 'VERIFIED',
                            paymentId: paymentEntity.id
                        });
                        batch.update(firebase_admin_1.db.collection('registrations').doc(pData.registrationId), {
                            paymentStatus: 'VERIFIED'
                        });
                        yield batch.commit();
                    }
                }
            }
            return { received: true };
        });
    },
    // ============================================================
    // STEP 6 — DYNAMIC QR ASSIGNMENT (ROUND-ROBIN)
    // POST /api/payments/assign-qr
    // Used by the OLD two-step flow (kept for backward compatibility).
    // New flow: use GET /api/payments/preview-qr + POST /api/registrations/complete-with-payment
    // ============================================================
    assignQr(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const { registrationId } = data;
            if (!registrationId) {
                throw { statusCode: 400, message: 'registrationId is required' };
            }
            const regDoc = yield firebase_admin_1.db.collection('registrations').doc(registrationId).get();
            if (!regDoc.exists || ((_a = regDoc.data()) === null || _a === void 0 ? void 0 : _a.userId) !== userId) {
                throw { statusCode: 404, message: 'Registration not found or unauthorized' };
            }
            const regData = regDoc.data();
            if (regData.paymentStatus !== 'INITIATED') {
                if (regData.paymentStatus === 'PENDING') {
                    throw { statusCode: 400, message: 'Payment already submitted — awaiting admin verification' };
                }
                if (regData.paymentStatus === 'VERIFIED') {
                    throw { statusCode: 400, message: 'Payment already verified' };
                }
                throw { statusCode: 400, message: `Cannot assign QR: current status is ${regData.paymentStatus}` };
            }
            const tDoc = yield firebase_admin_1.db.collection('tournaments').doc(regData.tournamentId).get();
            if (!tDoc.exists) {
                throw { statusCode: 404, message: 'Tournament not found' };
            }
            const tData = tDoc.data();
            const amount = (_c = (_b = tData.entryFee) !== null && _b !== void 0 ? _b : tData.paymentAmount) !== null && _c !== void 0 ? _c : 0;
            if (amount === 0) {
                throw { statusCode: 400, message: 'This tournament is free — no QR assignment needed' };
            }
            let assignedQr = null;
            let qrIndexAssigned = 0;
            yield firebase_admin_1.db.runTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c;
                const systemRef = firebase_admin_1.db.collection('system_settings').doc('qr_rotation');
                const sysDoc = yield transaction.get(systemRef);
                if (!sysDoc.exists) {
                    throw { statusCode: 500, message: 'QR rotation system settings not found — contact admin' };
                }
                const sysData = sysDoc.data();
                const currentIndex = (_a = sysData.currentIndex) !== null && _a !== void 0 ? _a : 0;
                const totalQRs = (_b = sysData.totalQRs) !== null && _b !== void 0 ? _b : 5;
                const qrSnap = yield transaction.get(firebase_admin_1.db.collection('qr_codes').doc(String(currentIndex)));
                if (!qrSnap.exists || !((_c = qrSnap.data()) === null || _c === void 0 ? void 0 : _c.isActive)) {
                    throw { statusCode: 500, message: `No active QR code found at index ${currentIndex} — contact admin` };
                }
                assignedQr = Object.assign({ id: qrSnap.id }, qrSnap.data());
                qrIndexAssigned = currentIndex;
                const nextIndex = (currentIndex + 1) >= totalQRs ? 0 : currentIndex + 1;
                transaction.update(systemRef, {
                    currentIndex: nextIndex,
                    lastUpdated: firebase_admin_1.default.firestore.Timestamp.now()
                });
                transaction.update(firebase_admin_1.db.collection('qr_codes').doc(qrSnap.id), {
                    usageCount: firebase_admin_1.default.firestore.FieldValue.increment(1),
                    lastUsedAt: firebase_admin_1.default.firestore.Timestamp.now()
                });
                transaction.update(firebase_admin_1.db.collection('registrations').doc(registrationId), {
                    qrIndex: qrIndexAssigned
                });
            }));
            return {
                qrIndex: qrIndexAssigned,
                qrImageUrl: assignedQr === null || assignedQr === void 0 ? void 0 : assignedQr.imageUrl,
                amount
            };
        });
    },
    // ============================================================
    // STEP 8 — PAYMENT SUBMISSION (OLD TWO-STEP FLOW)
    // POST /api/payments/submit
    // Kept for backward compatibility. New flow uses completeWithPayment.
    // ============================================================
    submitPayment(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const { registrationId, transactionId, upiId, bankName, paymentDate, paymentTime } = data;
            if (!registrationId || !transactionId || !paymentDate) {
                throw { statusCode: 400, message: 'Missing required fields: registrationId, transactionId, paymentDate' };
            }
            const regRef = firebase_admin_1.db.collection('registrations').doc(registrationId);
            const regDoc = yield regRef.get();
            if (!regDoc.exists || ((_a = regDoc.data()) === null || _a === void 0 ? void 0 : _a.userId) !== userId) {
                throw { statusCode: 404, message: 'Registration not found or unauthorized' };
            }
            const regData = regDoc.data();
            if (regData.paymentStatus !== 'INITIATED') {
                if (regData.paymentStatus === 'PENDING') {
                    throw { statusCode: 400, message: 'Payment already submitted — awaiting admin verification' };
                }
                if (regData.paymentStatus === 'VERIFIED') {
                    throw { statusCode: 400, message: 'Payment already verified — no resubmission allowed' };
                }
                throw { statusCode: 400, message: `Cannot submit payment: current status is ${regData.paymentStatus}` };
            }
            const dupSnap = yield firebase_admin_1.db.collection('payments')
                .where('transactionId', '==', transactionId)
                .limit(1)
                .get();
            if (!dupSnap.empty) {
                throw { statusCode: 400, message: 'Duplicate transaction ID — this payment has already been submitted' };
            }
            const qrIndex = (_b = regData.qrIndex) !== null && _b !== void 0 ? _b : null;
            const submittedAt = firebase_admin_1.default.firestore.Timestamp.now();
            const newPaymentRef = firebase_admin_1.db.collection('payments').doc();
            const batch = firebase_admin_1.db.batch();
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
            yield batch.commit();
            return {
                success: true,
                message: 'Payment submitted successfully — awaiting admin verification'
            };
        });
    },
    // ============================================================
    // QR PREVIEW (READ-ONLY) — New deferred-registration flow
    // GET /api/payments/preview-qr?tournamentId=xxx
    //
    // Returns the current round-robin QR WITHOUT creating any
    // registration or incrementing the counter. The counter only
    // advances when the user submits payment via completeWithPayment.
    // ============================================================
    previewQr(tournamentId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            if (!tournamentId) {
                throw { statusCode: 400, message: 'tournamentId is required' };
            }
            const tDoc = yield firebase_admin_1.db.collection('tournaments').doc(tournamentId).get();
            if (!tDoc.exists) {
                throw { statusCode: 404, message: 'Tournament not found' };
            }
            const tData = tDoc.data();
            const amount = (_b = (_a = tData.entryFee) !== null && _a !== void 0 ? _a : tData.paymentAmount) !== null && _b !== void 0 ? _b : 0;
            const sysDoc = yield firebase_admin_1.db.collection('system_settings').doc('qr_rotation').get();
            if (!sysDoc.exists) {
                throw { statusCode: 500, message: 'QR rotation system settings not found — contact admin' };
            }
            const sysData = sysDoc.data();
            const currentIndex = (_c = sysData.currentIndex) !== null && _c !== void 0 ? _c : 0;
            const qrDoc = yield firebase_admin_1.db.collection('qr_codes').doc(String(currentIndex)).get();
            if (!qrDoc.exists || !((_d = qrDoc.data()) === null || _d === void 0 ? void 0 : _d.isActive)) {
                throw { statusCode: 500, message: `No active QR at index ${currentIndex} — contact admin` };
            }
            return {
                qrIndex: currentIndex,
                qrImageUrl: qrDoc.data().imageUrl,
                amount
            };
        });
    }
};
