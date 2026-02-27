import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.util';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    const status = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    sendError(res, status, message);
};
