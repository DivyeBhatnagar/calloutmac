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

/**
 * STEP 10 — Admin: Get All Registrations
 * Returns full team + IGL + player + payment details
 * GET /api/admin/registrations
 */
export const getAdminRegistrations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await adminService.getAllRegistrations();
        sendSuccess(res, 200, 'All registrations retrieved', data);
    } catch (error) {
        next(error);
    }
};

/**
 * STEP 11 — Admin: Verify Payment
 * PATCH /api/admin/registrations/:id/verify
 */
export const verifyRegistrationPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const registrationId = req.params.id as string;
        const adminId = req.user.id;
        const data = await adminService.verifyRegistrationPayment(adminId, registrationId);
        sendSuccess(res, 200, 'Registration payment verified', data);
    } catch (error) {
        next(error);
    }
};

/**
 * CSV EXPORT — Admin: Export Registrations as CSV
 * GET /api/admin/registrations/export-csv?tournamentId=xxx  (tournamentId optional)
 */
export const exportRegistrationsCSV = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tournamentId = req.query.tournamentId as string | undefined;
        const csv = await adminService.exportRegistrationsCSV(tournamentId);
        const filename = tournamentId
            ? `registrations_${tournamentId}_${Date.now()}.csv`
            : `registrations_all_${Date.now()}.csv`;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csv);
    } catch (error) {
        next(error);
    }
};

/**
 * ADMIN: Create Tournament
 * POST /api/admin/tournaments
 */
export const createTournament = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const adminId = req.user.id;
        const data = await adminService.createTournament(adminId, req.body);
        sendSuccess(res, 201, 'Tournament created', data);
    } catch (error) {
        next(error);
    }
};

/**
 * ADMIN: Update Tournament
 * PATCH /api/admin/tournaments/:id
 */
export const updateTournament = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const data = await adminService.updateTournament(id, req.body);
        sendSuccess(res, 200, 'Tournament updated', data);
    } catch (error) {
        next(error);
    }
};

export const uploadTournamentPoster = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) throw { statusCode: 400, message: 'No file uploaded' };
        const id = req.params.id as string;
        const data = await adminService.uploadTournamentPoster(id, req.file);
        sendSuccess(res, 200, 'Poster uploaded successfully', data);
    } catch (error) {
        next(error);
    }
};

export const uploadGameLogo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) throw { statusCode: 400, message: 'No file uploaded' };
        const id = req.params.id as string;
        const gameId = req.params.gameId as string;
        const data = await adminService.uploadGameLogo(id, gameId, req.file);
        sendSuccess(res, 200, 'Game logo uploaded successfully', data);
    } catch (error) {
        next(error);
    }
};

export const uploadCollegeLogo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) throw { statusCode: 400, message: 'No file uploaded' };
        const id = req.params.id as string;
        const collegeId = req.params.collegeId as string;
        const data = await adminService.uploadCollegeLogo(id, collegeId, req.file);
        sendSuccess(res, 200, 'College logo uploaded successfully', data);
    } catch (error) {
        next(error);
    }
};
