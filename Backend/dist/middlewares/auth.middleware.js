"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeUser = exports.authorizeAdmin = exports.authenticate = void 0;
const firebase_admin_1 = require("../config/firebase.admin");
const response_util_1 = require("../utils/response.util");
/**
 * STEP 1 — AUTHENTICATION CHECK
 * Verifies the Firebase JWT, loads the full user from Firestore,
 * and attaches req.user for downstream use.
 */
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return (0, response_util_1.sendError)(res, 401, 'Authentication failed: No token provided');
        }
        const token = authHeader.split(' ')[1];
        // Verify Firebase ID token
        const decodedToken = yield firebase_admin_1.adminAuth.verifyIdToken(token);
        // Fetch full user doc from Firestore to get role and emailVerified status
        const userDoc = yield firebase_admin_1.db.collection('users').doc(decodedToken.uid).get();
        if (!userDoc.exists) {
            return (0, response_util_1.sendError)(res, 401, 'Authentication failed: User not found in database');
        }
        req.user = Object.assign({ id: decodedToken.uid, emailVerified: (_a = decodedToken.email_verified) !== null && _a !== void 0 ? _a : false }, userDoc.data());
        next();
    }
    catch (error) {
        return (0, response_util_1.sendError)(res, 401, 'Authentication failed: Invalid or expired token');
    }
});
exports.authenticate = authenticate;
/**
 * ADMIN AUTHORIZATION MIDDLEWARE
 * Must be used after authenticate.
 * Ensures the user has the ADMIN role.
 */
const authorizeAdmin = (req, res, next) => {
    var _a;
    if (req.user && ((_a = req.user.role) === null || _a === void 0 ? void 0 : _a.toUpperCase()) === 'ADMIN') {
        next();
    }
    else {
        (0, response_util_1.sendError)(res, 403, 'Authorization failed: Admin access required');
    }
};
exports.authorizeAdmin = authorizeAdmin;
/**
 * USER AUTHORIZATION MIDDLEWARE
 * Must be used after authenticate.
 * Blocks explicit ADMIN accounts from using user-only endpoints.
 * Does NOT require emailVerified — Firebase email/password users may not
 * have verified their email yet and should still be able to register.
 */
const authorizeUser = (req, res, next) => {
    if (!req.user) {
        return (0, response_util_1.sendError)(res, 401, 'Authentication failed: No user attached');
    }
    // Block only explicit ADMIN role. Missing/null role is treated as USER.
    const role = (req.user.role || 'USER').toUpperCase();
    if (role === 'ADMIN') {
        return (0, response_util_1.sendError)(res, 403, 'Authorization failed: Admin accounts cannot use player registration routes');
    }
    next();
};
exports.authorizeUser = authorizeUser;
