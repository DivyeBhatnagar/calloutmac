import { Router } from 'express';
import { supportController } from './support.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/create', supportController.createTicket);
router.get('/my-tickets', supportController.getUserTickets);
router.get('/:ticketId', supportController.getTicket);
router.post('/:ticketId/reply', supportController.replyToTicket);

export default router;
