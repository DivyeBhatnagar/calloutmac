import { Router } from 'express';
import { createRegistration, getUserRegistrations, getAllRegistrations, verifyRegistration } from './registration.controller';
import { authenticate, authorizeAdmin } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// User routes
router.post('/', createRegistration);
router.get('/user', getUserRegistrations);

// Admin routes
router.get('/admin', authorizeAdmin, getAllRegistrations);
router.patch('/admin/:id/verify', authorizeAdmin, verifyRegistration);

export default router;
