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

/**
 * STEP 1 — AUTHENTICATION CHECK
 * Verifies the Firebase JWT, loads the full user from Firestore,
 * and attaches req.user for downstream use.
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return sendError(res, 401, 'Authentication failed: No token provided');
        }

        const token = authHeader.split(' ')[1];

        // Verify Firebase ID token
        const decodedToken = await adminAuth.verifyIdToken(token);

        // Fetch full user doc from Firestore to get role and emailVerified status
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();

        if (!userDoc.exists) {
            return sendError(res, 401, 'Authentication failed: User not found in database');
        }

        req.user = {
            id: decodedToken.uid,
            emailVerified: decodedToken.email_verified ?? false,
            ...userDoc.data()
        };

        next();
    } catch (error) {
        return sendError(res, 401, 'Authentication failed: Invalid or expired token');
    }
};

/**
 * ADMIN AUTHORIZATION MIDDLEWARE
 * Must be used after authenticate.
 * Ensures the user has the ADMIN role.
 */
export const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.role?.toUpperCase() === 'ADMIN') {
        next();
    } else {
        sendError(res, 403, 'Authorization failed: Admin access required');
    }
};

/**
 * USER AUTHORIZATION MIDDLEWARE
 * Must be used after authenticate.
 * Blocks explicit ADMIN accounts from using user-only endpoints.
 * Does NOT require emailVerified — Firebase email/password users may not
 * have verified their email yet and should still be able to register.
 */
export const authorizeUser = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return sendError(res, 401, 'Authentication failed: No user attached');
    }

    // Block only explicit ADMIN role. Missing/null role is treated as USER.
    const role = (req.user.role || 'USER').toUpperCase();
    if (role === 'ADMIN') {
        return sendError(res, 403, 'Authorization failed: Admin accounts cannot use player registration routes');
    }

    next();
};
