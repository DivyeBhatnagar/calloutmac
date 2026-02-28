import { Router } from 'express';
import { createOrder, verifyPayment, webhook, assignQr, submitPayment, previewQr } from './payment.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/webhook', webhook);

router.use(authenticate);

// Legacy Razorpay Flow
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);

// Dynamic Round-Robin QR Flow (OLD two-step)
router.post('/assign-qr', assignQr);
router.post('/submit', submitPayment);

// NEW deferred-registration flow — read-only QR preview (no Firestore writes)
router.get('/preview-qr', previewQr);

export default router;
