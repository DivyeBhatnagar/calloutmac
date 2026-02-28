import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

// Normally, you would use a service account key JSON file
// or configure it through environment variables.
// For example:
// const serviceAccount = require('../../path-to-serviceAccountKey.json');
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

// Fallback to default credentials if not specifically configured.
if (!admin.apps.length) {
    try {
        if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
            const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('ascii'));
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } else {
            // Trying to initialize without cert expects GOOGLE_APPLICATION_CREDENTIALS to be set.
            // If running locally, this will likely fail unless the user sets it up.
            // But verifyIdToken can work without a private key if we at least provide the projectId!
            admin.initializeApp({
                projectId: process.env.FIREBASE_PROJECT_ID || 'call-out-esports',
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_PROJECT_ID || 'call-out-esports'}.firebasestorage.app`
            });
        }
    } catch (error) {
        console.warn("Failed to initialize Firebase Admin with specific credentials. Ensure FIREBASE_SERVICE_ACCOUNT_BASE64 or GOOGLE_APPLICATION_CREDENTIALS is set.", error);
        // Best effort init
        try {
            admin.initializeApp({
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_PROJECT_ID || 'call-out-esports'}.firebasestorage.app`
            });
        } catch (e) { } // Ignore duplicate init or failure
    }
}

export const db = admin.firestore();
export const adminAuth = admin.auth();
export const storage = (() => {
    try {
        return admin.storage().bucket();
    } catch (e) {
        console.warn("Storage bucket not initialized. Some features may not work.");
        return null as any;
    }
})();
export default admin;
