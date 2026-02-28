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
exports.supportController = void 0;
const support_service_1 = require("./support.service");
const response_util_1 = require("../../utils/response.util");
exports.supportController = {
    createTicket(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { subject, category, message } = req.body;
                const user = req.user;
                if (!subject || !category || !message) {
                    return (0, response_util_1.sendError)(res, 400, 'Subject, category, and message are required');
                }
                if (message.length > 1000) {
                    return (0, response_util_1.sendError)(res, 400, 'Message cannot exceed 1000 characters');
                }
                const ticket = yield support_service_1.supportService.createTicket({
                    userId: user.id,
                    username: user.username,
                    email: user.email,
                    subject,
                    category,
                    message
                });
                return (0, response_util_1.sendSuccess)(res, 201, 'Ticket created successfully', ticket);
            }
            catch (error) {
                return (0, response_util_1.sendError)(res, error.statusCode || 500, error.message || 'Error creating ticket');
            }
        });
    },
    getUserTickets(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tickets = yield support_service_1.supportService.getUserTickets(req.user.id);
                return (0, response_util_1.sendSuccess)(res, 200, 'Tickets retrieved successfully', tickets);
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
                const data = yield support_service_1.supportService.getTicket(ticketId, req.user.id);
                if (!data)
                    return (0, response_util_1.sendError)(res, 404, 'Ticket not found or unauthorized');
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
                if (message.length > 1000) {
                    return (0, response_util_1.sendError)(res, 400, 'Message cannot exceed 1000 characters');
                }
                yield support_service_1.supportService.replyToTicket(ticketId, req.user.id, message);
                return (0, response_util_1.sendSuccess)(res, 200, 'Reply sent successfully');
            }
            catch (error) {
                return (0, response_util_1.sendError)(res, error.statusCode || 500, error.message || 'Error sending reply');
            }
        });
    }
};
