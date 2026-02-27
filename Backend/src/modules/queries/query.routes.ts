import { Router } from 'express';
import { getAllQueries, respondToQuery } from './query.controller';
import { authenticate, authorizeAdmin } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticate, authorizeAdmin);

router.get('/admin', getAllQueries);
router.patch('/admin/:id/respond', respondToQuery);

export default router;
