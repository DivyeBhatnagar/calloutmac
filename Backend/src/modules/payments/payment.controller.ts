import { Request, Response, NextFunction } from 'express';
import { paymentService } from './payment.service';
import { sendSuccess } from '../../utils/response.util';

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await paymentService.createOrder(req.user.id, req.body);
        sendSuccess(res, 201, 'Order created', data);
    } catch (error) {
        next(error);
    }
};

export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await paymentService.verifyPayment(req.body);
        sendSuccess(res, 200, 'Payment verified', data);
    } catch (error) {
        next(error);
    }
};

export const webhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const signature = req.headers['x-razorpay-signature'] as string;
        await paymentService.handleWebhook(req.body, signature);
        res.status(200).send('Webhook received');
    } catch (error) {
        next(error);
    }
};

// --- DYNAMIC QR PAYMENT ENDPOINTS ---

export const assignQr = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await paymentService.assignQr(req.user.id, req.body);
        sendSuccess(res, 200, 'QR successfully assigned', data);
    } catch (error) {
        next(error);
    }
};

export const submitPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await paymentService.submitPayment(req.user.id, req.body);
        sendSuccess(res, 200, 'Payment submitted successfully', data);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/payments/preview-qr?tournamentId=xxx
 * Read-only: returns current QR image URL + amount WITHOUT creating any doc
 * or advancing the rotation counter.
 */
export const previewQr = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tournamentId = req.query.tournamentId as string;
        const data = await paymentService.previewQr(tournamentId);
        sendSuccess(res, 200, 'QR preview loaded', data);
    } catch (error) {
        next(error);
    }
};
