"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.adminAuth = exports.db = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Normally, you would use a service account key JSON file
// or configure it through environment variables.
// For example:
// const serviceAccount = require('../../path-to-serviceAccountKey.json');
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
// Fallback to default credentials if not specifically configured.
if (!firebase_admin_1.default.apps.length) {
    try {
        if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
            const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('ascii'));
            firebase_admin_1.default.initializeApp({
                credential: firebase_admin_1.default.credential.cert(serviceAccount),
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`
            });
        }
        else {
            // Trying to initialize without cert expects GOOGLE_APPLICATION_CREDENTIALS to be set.
            // If running locally, this will likely fail unless the user sets it up.
            // But verifyIdToken can work without a private key if we at least provide the projectId!
            firebase_admin_1.default.initializeApp({
                projectId: process.env.FIREBASE_PROJECT_ID || 'call-out-esports',
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_PROJECT_ID || 'call-out-esports'}.appspot.com`
            });
        }
    }
    catch (error) {
        console.warn("Failed to initialize Firebase Admin with specific credentials. Ensure FIREBASE_SERVICE_ACCOUNT_BASE64 or GOOGLE_APPLICATION_CREDENTIALS is set.", error);
        // Best effort init
        try {
            firebase_admin_1.default.initializeApp({
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_PROJECT_ID || 'call-out-esports'}.appspot.com`
            });
        }
        catch (e) { } // Ignore duplicate init or failure
    }
}
exports.db = firebase_admin_1.default.firestore();
exports.adminAuth = firebase_admin_1.default.auth();
exports.storage = (() => {
    try {
        return firebase_admin_1.default.storage().bucket();
    }
    catch (e) {
        console.warn("Storage bucket not initialized. Some features may not work.");
        return null;
    }
})();
exports.default = firebase_admin_1.default;
