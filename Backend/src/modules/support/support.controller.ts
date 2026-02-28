import { Request, Response } from 'express';
import { supportService } from './support.service';
import { sendSuccess, sendError } from '../../utils/response.util';

export const supportController = {
    async createTicket(req: Request, res: Response) {
        try {
            const { subject, category, message } = req.body;
            const user = req.user;

            if (!subject || !category || !message) {
                return sendError(res, 400, 'Subject, category, and message are required');
            }

            if (message.length > 1000) {
                return sendError(res, 400, 'Message cannot exceed 1000 characters');
            }

            const ticket = await supportService.createTicket({
                userId: user.id,
                username: user.username,
                email: user.email,
                subject,
                category,
                message
            });

            return sendSuccess(res, 201, 'Ticket created successfully', ticket);
        } catch (error: any) {
            return sendError(res, error.statusCode || 500, error.message || 'Error creating ticket');
        }
    },

    async getUserTickets(req: Request, res: Response) {
        try {
            const tickets = await supportService.getUserTickets(req.user.id);
            return sendSuccess(res, 200, 'Tickets retrieved successfully', tickets);
        } catch (error: any) {
            return sendError(res, error.statusCode || 500, error.message || 'Error retrieving tickets');
        }
    },

    async getTicket(req: Request, res: Response) {
        try {
            const ticketId = req.params.ticketId as string;
            const data = await supportService.getTicket(ticketId, req.user.id);

            if (!data) return sendError(res, 404, 'Ticket not found or unauthorized');

            return sendSuccess(res, 200, 'Ticket retrieved successfully', data);
        } catch (error: any) {
            return sendError(res, error.statusCode || 500, error.message || 'Error retrieving ticket');
        }
    },

    async replyToTicket(req: Request, res: Response) {
        try {
            const ticketId = req.params.ticketId as string;
            const { message } = req.body;

            if (!message || message.trim() === '') {
                return sendError(res, 400, 'Message cannot be empty');
            }
            if (message.length > 1000) {
                return sendError(res, 400, 'Message cannot exceed 1000 characters');
            }

            await supportService.replyToTicket(ticketId, req.user.id, message);
            return sendSuccess(res, 200, 'Reply sent successfully');
        } catch (error: any) {
            return sendError(res, error.statusCode || 500, error.message || 'Error sending reply');
        }
    }
};
