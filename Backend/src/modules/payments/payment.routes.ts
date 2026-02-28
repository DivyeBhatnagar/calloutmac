import { Router } from 'express';
import { createOrder, verifyPayment, webhook, assignQr, submitPayment } from './payment.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/webhook', webhook);

router.use(authenticate);

// Legacy Razorpay Flow
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);

// Dynamic Round-Robin QR Flow
router.post('/assign-qr', assignQr);
router.post('/submit', submitPayment);

export default router;
