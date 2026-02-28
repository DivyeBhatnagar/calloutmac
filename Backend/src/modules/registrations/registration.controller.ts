import { Request, Response, NextFunction } from 'express';
import { registrationService } from './registration.service';
import { sendSuccess } from '../../utils/response.util';

/**
 * STEP 5 — Create Registration
 * POST /api/registrations/create
 * Returns { registrationId } only (per spec)
 */
export const createRegistration = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await registrationService.createRegistration(req.user.id, req.body);
        sendSuccess(res, 201, 'Registration created successfully', data);
    } catch (error) {
        next(error);
    }
};

/**
 * STEP 9 — User Dashboard: Get My Registrations
 * GET /api/registrations/user
 * Returns registrations with statusLabel computed on backend
 */
export const getUserRegistrations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await registrationService.getUserRegistrations(req.user.id);
        sendSuccess(res, 200, 'User registrations retrieved', data);
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: Get All Registrations (used by registration.routes legacy path)
 * Delegates to registrationService.getAllRegistrations
 */
export const getAllRegistrations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await registrationService.getAllRegistrations();
        sendSuccess(res, 200, 'All registrations retrieved', data);
    } catch (error) {
        next(error);
    }
};

/**
 * STEP 8 (NEW FLOW) — Complete registration atomically with payment
 * POST /api/registrations/complete-with-payment
 * Creates registration + assigns QR + creates payment doc in ONE transaction.
 * Nothing is written to Firestore until the user submits payment proof.
 */
export const completeWithPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await registrationService.completeWithPayment(req.user.id, req.body);
        sendSuccess(res, 201, 'Registration complete — payment submitted and awaiting admin verification', data);
    } catch (error) {
        next(error);
    }
};
