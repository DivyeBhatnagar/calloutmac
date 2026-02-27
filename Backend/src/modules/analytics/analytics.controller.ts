import { Request, Response, NextFunction } from 'express';
import { analyticsService } from './analytics.service';
import { sendSuccess } from '../../utils/response.util';

export const getRevenueAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await analyticsService.getRevenueAnalytics();
        sendSuccess(res, 200, 'Revenue analytics retrieved', data);
    } catch (error) {
        next(error);
    }
};

export const getUserAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await analyticsService.getUserAnalytics();
        sendSuccess(res, 200, 'User analytics retrieved', data);
    } catch (error) {
        next(error);
    }
};

export const getTournamentAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await analyticsService.getTournamentAnalytics();
        sendSuccess(res, 200, 'Tournament analytics retrieved', data);
    } catch (error) {
        next(error);
    }
};
