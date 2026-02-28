import { Router } from 'express';
import { adminSupportController } from './admin-support.controller';
import { authenticate, authorizeAdmin } from '../../middlewares/auth.middleware';

const router = Router();

// Apply auth and admin check to all admin support routes
router.use(authenticate, authorizeAdmin);

router.get('/', adminSupportController.getAllTickets);
router.get('/:ticketId', adminSupportController.getTicket);
router.post('/:ticketId/reply', adminSupportController.replyToTicket);
router.patch('/:ticketId/resolve', adminSupportController.resolveTicket);
router.patch('/:ticketId/close', adminSupportController.closeTicket);
router.delete('/:ticketId', adminSupportController.deleteTicket);

export default router;
