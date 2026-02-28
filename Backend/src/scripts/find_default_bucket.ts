
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const b = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
if (!b) {
    process.exit(1);
}

const sa = JSON.parse(Buffer.from(b, 'base64').toString('ascii'));
admin.initializeApp({
    credential: admin.credential.cert(sa)
});

async function run() {
    try {
        const bucket = admin.storage().bucket();
        console.log('DEFAULT_BUCKET_NAME:', bucket.name);
    } catch (e: any) {
        console.error('ERROR_GETTING_DEFAULT_BUCKET:', e.message);
    }
    process.exit(0);
}

run();
