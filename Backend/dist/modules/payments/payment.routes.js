"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("./payment.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post('/webhook', payment_controller_1.webhook);
router.use(auth_middleware_1.authenticate);
// Legacy Razorpay Flow
router.post('/create-order', payment_controller_1.createOrder);
router.post('/verify', payment_controller_1.verifyPayment);
// Dynamic Round-Robin QR Flow (OLD two-step)
router.post('/assign-qr', payment_controller_1.assignQr);
router.post('/submit', payment_controller_1.submitPayment);
// NEW deferred-registration flow — read-only QR preview (no Firestore writes)
router.get('/preview-qr', payment_controller_1.previewQr);
exports.default = router;
