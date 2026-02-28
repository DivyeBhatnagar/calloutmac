import { Router } from 'express';
import {
    getAdminStats,
    getAllUsers,
    deleteUser,
    updateUserRole,
    getAdminRegistrations,
    verifyRegistrationPayment,
    exportRegistrationsCSV,
    createTournament,
    updateTournament,
    uploadTournamentPoster,
    uploadGameLogo,
    uploadCollegeLogo
} from './admin.controller';
import { authenticate, authorizeAdmin } from '../../middlewares/auth.middleware';
import multer from 'multer';

const router = Router();

// Multer configuration for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

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

// Tournament Management
router.post('/tournaments', createTournament);
router.patch('/tournaments/:id', updateTournament);

// Image Uploads
router.post('/tournaments/:id/poster', upload.single('poster'), uploadTournamentPoster);
router.post('/tournaments/:id/games/:gameId/logo', upload.single('logo'), uploadGameLogo);
router.post('/tournaments/:id/colleges/:collegeId/logo', upload.single('logo'), uploadCollegeLogo);

export default router;
