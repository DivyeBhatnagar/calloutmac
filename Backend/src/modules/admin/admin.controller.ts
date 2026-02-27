import { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service';
import { sendSuccess } from '../../utils/response.util';

export const getAdminStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await adminService.getAdminStats();
        sendSuccess(res, 200, 'Admin stats retrieved', data);
    } catch (error) {
        next(error);
    }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await adminService.getAllUsers();
        sendSuccess(res, 200, 'All users retrieved', data);
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const data = await adminService.deleteUser(id);
        sendSuccess(res, 200, 'User deleted', data);
    } catch (error) {
        next(error);
    }
};
