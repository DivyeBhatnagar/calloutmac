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

export const updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const { role } = req.body;
        const data = await adminService.updateUserRole(id, role);
        sendSuccess(res, 200, 'User role updated', data);
    } catch (error) {
        next(error);
    }
};

export const verifyRegistrationPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const registrationId = req.params.id as string;
        // admin id extracted from the verified authenticated token
        const adminId = req.user.id;

        const data = await adminService.verifyRegistrationPayment(adminId, registrationId);
        sendSuccess(res, 200, 'Registration payment formally verified', data);
    } catch (error) {
        next(error);
    }
};
