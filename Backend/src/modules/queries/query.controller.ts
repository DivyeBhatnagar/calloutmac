import { Request, Response, NextFunction } from 'express';
import { queryService } from './query.service';
import { sendSuccess } from '../../utils/response.util';

export const getAllQueries = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await queryService.getAllQueries();
        sendSuccess(res, 200, 'All queries retrieved', data);
    } catch (error) {
        next(error);
    }
};

export const respondToQuery = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const { adminResponse } = req.body;
        const data = await queryService.respondToQuery(id, adminResponse);
        sendSuccess(res, 200, 'Query responded to', data);
    } catch (error) {
        next(error);
    }
};
