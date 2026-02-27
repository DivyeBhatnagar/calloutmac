import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';
import { sendSuccess } from '../../utils/response.util';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await userService.getDashboardStats(req.user.id);
        sendSuccess(res, 200, 'Dashboard stats retrieved', data);
    } catch (error) {
        next(error);
    }
};

export const getUserTournaments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await userService.getUserTournaments(req.user.id);
        sendSuccess(res, 200, 'User tournaments retrieved', data);
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await userService.updateProfile(req.user.id, req.body);
        sendSuccess(res, 200, 'Profile updated', data);
    } catch (error) {
        next(error);
    }
};

export const submitQuery = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await userService.submitQuery(req.user.id, req.body);
        sendSuccess(res, 201, 'Query submitted', data);
    } catch (error) {
        next(error);
    }
};

export const getUserQueries = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await userService.getUserQueries(req.user.id);
        sendSuccess(res, 200, 'User queries retrieved', data);
    } catch (error) {
        next(error);
    }
};
