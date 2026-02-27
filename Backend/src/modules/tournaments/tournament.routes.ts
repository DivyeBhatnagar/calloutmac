import { Router } from 'express';
import { getTournaments, getTournamentById } from './tournament.controller';

const router = Router();

router.get('/', getTournaments);
router.get('/:id', getTournamentById);

export default router;
