
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const b = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
if (!b) {
    console.error('FIREBASE_SERVICE_ACCOUNT_BASE64 not set');
    process.exit(1);
}

const sa = JSON.parse(Buffer.from(b, 'base64').toString('ascii'));
admin.initializeApp({
    credential: admin.credential.cert(sa),
    projectId: sa.project_id
});

const db = admin.firestore();

async function run() {
    console.log('--- DIAGNOSTIC DUMP ---');
    console.log('Project ID:', sa.project_id);

    try {
        const qr = await db.collection('system_settings').doc('qr_rotation').get();
        console.log('QR Rotation setting:', qr.exists ? JSON.stringify(qr.data(), null, 2) : 'NOT FOUND');

        const qrs = await db.collection('qr_codes').limit(1).get();
        if (!qrs.empty) {
            console.log('Sample QR code data:', JSON.stringify(qrs.docs[0].data(), null, 2));
        } else {
            console.log('No QR codes found.');
        }

        const ts = await db.collection('tournaments').where('posterUrl', '!=', '').limit(1).get();
        if (!ts.empty) {
            console.log('Sample tournament poster URL:', ts.docs[0].data().posterUrl);
        } else {
            console.log('No tournament posters found.');
        }
    } catch (e: any) {
        console.error('Error reading Firestore:', e.message);
    }
    process.exit(0);
}

run();
