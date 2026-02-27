import { Request, Response, NextFunction } from 'express';
import { registrationService } from './registration.service';
import { sendSuccess } from '../../utils/response.util';

export const createRegistration = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await registrationService.createRegistration(req.user.id, req.body);
        sendSuccess(res, 201, 'Registration created', data);
    } catch (error) {
        next(error);
    }
};

export const getUserRegistrations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await registrationService.getUserRegistrations(req.user.id);
        sendSuccess(res, 200, 'User registrations retrieved', data);
    } catch (error) {
        next(error);
    }
};

export const getAllRegistrations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await registrationService.getAllRegistrations();
        sendSuccess(res, 200, 'All registrations retrieved', data);
    } catch (error) {
        next(error);
    }
};

export const verifyRegistration = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const data = await registrationService.verifyRegistration(id);
        sendSuccess(res, 200, 'Registration verified', data);
    } catch (error) {
        next(error);
    }
};
