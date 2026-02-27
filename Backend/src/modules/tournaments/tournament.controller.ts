import { Request, Response, NextFunction } from 'express';
import { tournamentService } from './tournament.service';
import { sendSuccess } from '../../utils/response.util';

export const getTournaments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await tournamentService.getTournaments();
        sendSuccess(res, 200, 'Tournaments retrieved', data);
    } catch (error) {
        next(error);
    }
};

export const getTournamentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const data = await tournamentService.getTournamentById(id);
        sendSuccess(res, 200, 'Tournament retrieved', data);
    } catch (error) {
        next(error);
    }
};
