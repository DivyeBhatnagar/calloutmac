import { Router } from 'express';
import { createOrder, verifyPayment, webhook } from './payment.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/webhook', webhook);

router.use(authenticate);
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);

export default router;
