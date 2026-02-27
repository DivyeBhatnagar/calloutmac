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
            admin.initializeApp();
        }
    } catch (error) {
        console.warn("Failed to initialize Firebase Admin with specific credentials. Ensure FIREBASE_SERVICE_ACCOUNT_BASE64 or GOOGLE_APPLICATION_CREDENTIALS is set.", error);
        // Best effort init
        try {
            admin.initializeApp();
        } catch (e) { } // Ignore duplicate init or failure
    }
}

export const db = admin.firestore();
export const adminAuth = admin.auth();
export default admin;
