import { Request, Response, NextFunction } from 'express';
import { adminAuth, db } from '../config/firebase.admin';
import { sendError } from '../utils/response.util';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return sendError(res, 401, 'Authentication failed: No token provided');
        }

        const token = authHeader.split(' ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);

        // Fetch full user doc from Firestore to get role
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();

        if (!userDoc.exists) {
            return sendError(res, 401, 'Authentication failed: User not found in database');
        }

        req.user = {
            id: decodedToken.uid,
            ...userDoc.data()
        };

        next();
    } catch (error) {
        return sendError(res, 401, 'Authentication failed: Invalid or expired token');
    }
};

export const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.role?.toUpperCase() === 'ADMIN') {
        next();
    } else {
        sendError(res, 403, 'Authorization failed: Admin access required');
    }
};
