/**
 * seedQRv2.ts — Full QR seeder: Firebase Storage upload + Firestore seed
 * ────────────────────────────────────────────────────────────────────────
 * Reads FIREBASE_SERVICE_ACCOUNT_BASE64 to derive project_id and bucket.
 * Uploads QR images from Media/PaymentQR to Firebase Storage.
 * Seeds qr_codes collection and system_settings/qr_rotation.
 *
 * Run:
 *   cd "CALLOUT NEW/Backend"
 *   npx ts-node src/scripts/seedQRv2.ts
 */

import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ── Bootstrap Firebase using FIREBASE_SERVICE_ACCOUNT_BASE64 ─────────────────
const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
if (!b64) {
    console.error('❌ FIREBASE_SERVICE_ACCOUNT_BASE64 is not set in .env');
    process.exit(1);
}

const serviceAccount = JSON.parse(Buffer.from(b64, 'base64').toString('ascii'));
const projectId: string = serviceAccount.project_id;

// Derive the default Storage bucket — Firebase default is <project>.appspot.com
// or <project>.firebasestorage.app depending on when the project was created.
// We try .appspot.com first (most common); if it fails we fall back to .firebasestorage.app.
const bucketName = `${projectId}.appspot.com`;

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: bucketName
    });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

const TOTAL_QRS = 5;

const run = async () => {
    console.log(`\n🚀 CallOut QR Seeder — project: ${projectId}, bucket: ${bucketName}\n`);

    // Locate images
    // process.cwd() = the Backend folder (where npm run / npx ts-node is invoked)
    // Media folder is one level up from Backend, inside CALLOUT NEW
    const imageDir = path.resolve(process.cwd(), '../Media/PaymentQR');
    if (!fs.existsSync(imageDir)) {
        console.error(`❌ QR directory not found: ${imageDir}`);
        process.exit(1);
    }

    const files = fs.readdirSync(imageDir)
        .filter(f => /\.(jpe?g|png)$/i.test(f))
        .sort();

    if (files.length === 0) {
        console.error('❌ No QR images found in PaymentQR directory.');
        process.exit(1);
    }

    console.log(`📁 Found ${files.length} image(s): ${files.join(', ')}\n`);

    const batch = db.batch();
    const now = admin.firestore.FieldValue.serverTimestamp();

    for (let i = 0; i < files.length && i < TOTAL_QRS; i++) {
        const fileName = files[i];
        const localPath = path.join(imageDir, fileName);
        const ext = fileName.split('.').pop()?.toLowerCase() || 'jpeg';
        const destPath = `payment_qrs/qr${i}.${ext}`;

        console.log(`⬆️  [${i + 1}/${files.length}] Uploading "${fileName}" → ${destPath} …`);

        let imageUrl = '';
        try {
            const [fileRef] = await bucket.upload(localPath, {
                destination: destPath,
                metadata: { contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}` }
            });

            // Make publicly readable
            await fileRef.makePublic();
            imageUrl = `https://storage.googleapis.com/${bucket.name}/${destPath}`;
            console.log(`   ✅ URL: ${imageUrl}`);
        } catch (err: any) {
            // If the bucket name is wrong, try the alternative Firebase Storage domain
            console.warn(`   ⚠️  Upload failed: ${err.message}`);
            console.warn('   Trying alternative bucket name (<project>.firebasestorage.app) …');
            try {
                const altBucket = admin.storage().bucket(`${projectId}.firebasestorage.app`);
                const [altFile] = await altBucket.upload(localPath, {
                    destination: destPath,
                    metadata: { contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}` }
                });
                await altFile.makePublic();
                imageUrl = `https://storage.googleapis.com/${projectId}.firebasestorage.app/${destPath}`;
                console.log(`   ✅ URL (alt): ${imageUrl}`);
            } catch (err2: any) {
                console.warn(`   ❌ Both bucket names failed. imageUrl will be empty: ${err2.message}`);
            }
        }

        const qrRef = db.collection('qr_codes').doc(String(i));
        batch.set(qrRef, {
            index: i,
            imageUrl,
            isActive: true,
            usageCount: 0,
            lastUsedAt: now
        }, { merge: true });
    }

    // system_settings/qr_rotation
    const sysRef = db.collection('system_settings').doc('qr_rotation');
    batch.set(sysRef, {
        currentIndex: 0,
        totalQRs: Math.min(files.length, TOTAL_QRS),
        lastUpdated: now
    }, { merge: true });

    await batch.commit();

    console.log('\n✅ Seeding complete!');
    console.log(`   • qr_codes/0 – qr_codes/${Math.min(files.length, TOTAL_QRS) - 1} written`);
    console.log(`   • system_settings/qr_rotation seeded\n`);
    process.exit(0);
};

run().catch(err => {
    console.error('\n❌ SEED FAILED:', err.message || err);
    process.exit(1);
});
