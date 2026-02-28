"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminSupportController = void 0;
const admin_support_service_1 = require("./admin-support.service");
const response_util_1 = require("../../utils/response.util");
exports.adminSupportController = {
    getAllTickets(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tickets = yield admin_support_service_1.adminSupportService.getAllTickets();
                return (0, response_util_1.sendSuccess)(res, 200, 'All tickets retrieved successfully', tickets);
            }
            catch (error) {
                return (0, response_util_1.sendError)(res, error.statusCode || 500, error.message || 'Error retrieving tickets');
            }
        });
    },
    getTicket(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ticketId = req.params.ticketId;
                const data = yield admin_support_service_1.adminSupportService.getTicket(ticketId);
                if (!data)
                    return (0, response_util_1.sendError)(res, 404, 'Ticket not found');
                return (0, response_util_1.sendSuccess)(res, 200, 'Ticket retrieved successfully', data);
            }
            catch (error) {
                return (0, response_util_1.sendError)(res, error.statusCode || 500, error.message || 'Error retrieving ticket');
            }
        });
    },
    replyToTicket(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ticketId = req.params.ticketId;
                const { message } = req.body;
                if (!message || message.trim() === '') {
                    return (0, response_util_1.sendError)(res, 400, 'Message cannot be empty');
                }
                yield admin_support_service_1.adminSupportService.replyToTicket(ticketId, req.user.id, message);
                return (0, response_util_1.sendSuccess)(res, 200, 'Reply sent successfully');
            }
            catch (error) {
                return (0, response_util_1.sendError)(res, error.statusCode || 500, error.message || 'Error sending reply');
            }
        });
    },
    resolveTicket(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ticketId = req.params.ticketId;
                yield admin_support_service_1.adminSupportService.updateTicketStatus(ticketId, 'RESOLVED');
                return (0, response_util_1.sendSuccess)(res, 200, 'Ticket marked as resolved');
            }
            catch (error) {
                return (0, response_util_1.sendError)(res, error.statusCode || 500, error.message || 'Error resolving ticket');
            }
        });
    },
    closeTicket(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ticketId = req.params.ticketId;
                yield admin_support_service_1.adminSupportService.updateTicketStatus(ticketId, 'CLOSED');
                return (0, response_util_1.sendSuccess)(res, 200, 'Ticket marked as closed');
            }
            catch (error) {
                return (0, response_util_1.sendError)(res, error.statusCode || 500, error.message || 'Error closing ticket');
            }
        });
    },
    deleteTicket(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ticketId = req.params.ticketId;
                yield admin_support_service_1.adminSupportService.deleteTicket(ticketId);
                return (0, response_util_1.sendSuccess)(res, 200, 'Ticket deleted successfully');
            }
            catch (error) {
                return (0, response_util_1.sendError)(res, error.statusCode || 500, error.message || 'Error deleting ticket');
            }
        });
    }
};
