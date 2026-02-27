import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { sendSuccess } from '../../utils/response.util';

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await authService.register(req.body);
        sendSuccess(res, 201, 'User registered successfully', data);
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await authService.login(req.body);
        sendSuccess(res, 200, 'User logged in successfully', data);
    } catch (error) {
        next(error);
    }
};

export const googleLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await authService.googleLogin(req.body);
        sendSuccess(res, 200, 'User authenticated with Google successfully', data);
    } catch (error) {
        next(error);
    }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id;
        const user = await authService.verifyUser(userId);
        sendSuccess(res, 200, 'User details retrieved', user);
    } catch (error) {
        next(error);
    }
};
