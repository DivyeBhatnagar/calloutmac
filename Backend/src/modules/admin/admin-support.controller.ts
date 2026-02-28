import { Request, Response } from 'express';
import { adminSupportService } from './admin-support.service';
import { sendSuccess, sendError } from '../../utils/response.util';

export const adminSupportController = {
    async getAllTickets(req: Request, res: Response) {
        try {
            const tickets = await adminSupportService.getAllTickets();
            return sendSuccess(res, 200, 'All tickets retrieved successfully', tickets);
        } catch (error: any) {
            return sendError(res, error.statusCode || 500, error.message || 'Error retrieving tickets');
        }
    },

    async getTicket(req: Request, res: Response) {
        try {
            const ticketId = req.params.ticketId as string;
            const data = await adminSupportService.getTicket(ticketId);

            if (!data) return sendError(res, 404, 'Ticket not found');

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

            await adminSupportService.replyToTicket(ticketId, req.user.id, message);
            return sendSuccess(res, 200, 'Reply sent successfully');
        } catch (error: any) {
            return sendError(res, error.statusCode || 500, error.message || 'Error sending reply');
        }
    },

    async resolveTicket(req: Request, res: Response) {
        try {
            const ticketId = req.params.ticketId as string;
            await adminSupportService.updateTicketStatus(ticketId, 'RESOLVED');
            return sendSuccess(res, 200, 'Ticket marked as resolved');
        } catch (error: any) {
            return sendError(res, error.statusCode || 500, error.message || 'Error resolving ticket');
        }
    },

    async closeTicket(req: Request, res: Response) {
        try {
            const ticketId = req.params.ticketId as string;
            await adminSupportService.updateTicketStatus(ticketId, 'CLOSED');
            return sendSuccess(res, 200, 'Ticket marked as closed');
        } catch (error: any) {
            return sendError(res, error.statusCode || 500, error.message || 'Error closing ticket');
        }
    },

    async deleteTicket(req: Request, res: Response) {
        try {
            const ticketId = req.params.ticketId as string;
            await adminSupportService.deleteTicket(ticketId);
            return sendSuccess(res, 200, 'Ticket deleted successfully');
        } catch (error: any) {
            return sendError(res, error.statusCode || 500, error.message || 'Error deleting ticket');
        }
    }
};
