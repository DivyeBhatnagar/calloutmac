import { Router } from 'express';
import { getRevenueAnalytics, getUserAnalytics, getTournamentAnalytics } from './analytics.controller';
import { authenticate, authorizeAdmin } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticate, authorizeAdmin);

router.get('/revenue', getRevenueAnalytics);
router.get('/users', getUserAnalytics);
router.get('/tournaments', getTournamentAnalytics);

export default router;
