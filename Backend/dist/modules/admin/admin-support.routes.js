"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_support_controller_1 = require("./admin-support.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Apply auth and admin check to all admin support routes
router.use(auth_middleware_1.authenticate, auth_middleware_1.authorizeAdmin);
router.get('/', admin_support_controller_1.adminSupportController.getAllTickets);
router.get('/:ticketId', admin_support_controller_1.adminSupportController.getTicket);
router.post('/:ticketId/reply', admin_support_controller_1.adminSupportController.replyToTicket);
router.patch('/:ticketId/resolve', admin_support_controller_1.adminSupportController.resolveTicket);
router.patch('/:ticketId/close', admin_support_controller_1.adminSupportController.closeTicket);
router.delete('/:ticketId', admin_support_controller_1.adminSupportController.deleteTicket);
exports.default = router;
