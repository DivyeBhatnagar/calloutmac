import { Router } from 'express';
import { getDashboardStats, getUserTournaments, updateProfile, submitQuery, getUserQueries } from './user.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/tournaments', getUserTournaments);

// Queries
router.get('/queries', getUserQueries);
router.post('/query', submitQuery);

// Profile
router.put('/profile', updateProfile);

export default router;
