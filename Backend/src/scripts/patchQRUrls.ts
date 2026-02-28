/**
 * patchQRUrls.ts
 * Patches qr_codes Firestore docs with backend static file URLs.
 * Backend serves QR images at: http://localhost:5000/qr/qrN.jpeg
 *
 * Run AFTER the backend is running:
 *   cd "CALLOUT NEW/Backend"
 *   npx ts-node src/scripts/patchQRUrls.ts
 */

import * as admin from 'firebase-admin';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

if (!admin.apps.length) {
    const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (b64) {
        const serviceAccount = JSON.parse(Buffer.from(b64, 'base64').toString('ascii'));
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } else {
        admin.initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || 'call-out-esports' });
    }
}

const db = admin.firestore();

// ── CONFIG ────────────────────────────────────────────────────────────────────
// Use the backend public URL (change this if deployed — e.g. https://api.callout.gg)
const BACKEND_URL = process.env.BACKEND_PUBLIC_URL || 'http://localhost:5000';

// QR images in Media/PaymentQR are: qr1.jpeg, qr2.jpeg, … qr5.jpeg
// They are served at /qr/qr1.jpeg … /qr/qr5.jpeg by Express static
// qr_codes doc index 0 → qr1.jpeg, index 1 → qr2.jpeg, etc.
const QR_FILES = ['qr1.jpeg', 'qr2.jpeg', 'qr3.jpeg', 'qr4.jpeg', 'qr5.jpeg'];

const run = async () => {
    console.log(`\n🔗 Patching qr_codes imageUrls → ${BACKEND_URL}/qr/<file>\n`);

    const batch = db.batch();

    for (let i = 0; i < QR_FILES.length; i++) {
        const imageUrl = `${BACKEND_URL}/qr/${QR_FILES[i]}`;
        const ref = db.collection('qr_codes').doc(String(i));
        batch.update(ref, { imageUrl });
        console.log(`   qr_codes/${i} → ${imageUrl}`);
    }

    await batch.commit();

    console.log('\n✅ All qr_codes imageUrl fields updated!');
    console.log('   QR images will now load from the backend static server.\n');
    process.exit(0);
};

run().catch(err => {
    console.error('❌ Patch failed:', err.message || err);
    process.exit(1);
});
