import { Router } from 'express';
import { getAdminStats, getAllUsers, deleteUser, updateUserRole, verifyRegistrationPayment } from './admin.controller';
import { authenticate, authorizeAdmin } from '../../middlewares/auth.middleware';

const router = Router();

// Fully protects routes limiting only to custom Admin claim/role verification
router.use(authenticate, authorizeAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/role', updateUserRole);

// Verify payments manually using the custom backend dynamic QR setup
router.patch('/registrations/:id/verify', verifyRegistrationPayment);

export default router;
