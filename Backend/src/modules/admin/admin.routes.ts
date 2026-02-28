import { Router } from 'express';
import {
    getAdminStats,
    getAllUsers,
    deleteUser,
    updateUserRole,
    getAdminRegistrations,
    verifyRegistrationPayment,
    exportRegistrationsCSV
} from './admin.controller';
import { authenticate, authorizeAdmin } from '../../middlewares/auth.middleware';

const router = Router();

// All admin routes are protected — requires valid JWT + ADMIN role
router.use(authenticate, authorizeAdmin);

// User management
router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/role', updateUserRole);

// STEP 10 — View all registrations with full team + payment details
router.get('/registrations', getAdminRegistrations);

// STEP 11 — Verify a registration payment manually
router.patch('/registrations/:id/verify', verifyRegistrationPayment);

// CSV Export — download all (or filtered) registrations as CSV
router.get('/registrations/export-csv', exportRegistrationsCSV);

export default router;
