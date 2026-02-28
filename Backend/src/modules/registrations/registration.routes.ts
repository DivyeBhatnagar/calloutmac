import { Router } from 'express';
import { createRegistration, getUserRegistrations, getAllRegistrations, completeWithPayment } from './registration.controller';
import { authenticate, authorizeUser, authorizeAdmin } from '../../middlewares/auth.middleware';

const router = Router();

// All registration routes require authentication
router.use(authenticate);

// OLD FLOW: Create registration only (user then calls /payments/assign-qr + /payments/submit separately)
router.post('/create', authorizeUser, createRegistration);

// NEW FLOW: Atomically create registration + assign QR + submit payment in one call
// Nothing is written to Firestore before this endpoint is called.
router.post('/complete-with-payment', authorizeUser, completeWithPayment);

// STEP 9: Get user's own registrations with statusLabel — USER only
router.get('/user', authorizeUser, getUserRegistrations);

// Legacy admin sub-route (also accessible via /api/admin/registrations)
router.get('/admin', authorizeAdmin, getAllRegistrations);

export default router;
