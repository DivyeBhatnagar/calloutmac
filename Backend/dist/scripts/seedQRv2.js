"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const admin = __importStar(require("firebase-admin"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
// ── Bootstrap Firebase using FIREBASE_SERVICE_ACCOUNT_BASE64 ─────────────────
const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
if (!b64) {
    console.error('❌ FIREBASE_SERVICE_ACCOUNT_BASE64 is not set in .env');
    process.exit(1);
}
const serviceAccount = JSON.parse(Buffer.from(b64, 'base64').toString('ascii'));
const projectId = serviceAccount.project_id;
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
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
        const ext = ((_a = fileName.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || 'jpeg';
        const destPath = `payment_qrs/qr${i}.${ext}`;
        console.log(`⬆️  [${i + 1}/${files.length}] Uploading "${fileName}" → ${destPath} …`);
        let imageUrl = '';
        try {
            const [fileRef] = yield bucket.upload(localPath, {
                destination: destPath,
                metadata: { contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}` }
            });
            // Make publicly readable
            yield fileRef.makePublic();
            imageUrl = `https://storage.googleapis.com/${bucket.name}/${destPath}`;
            console.log(`   ✅ URL: ${imageUrl}`);
        }
        catch (err) {
            // If the bucket name is wrong, try the alternative Firebase Storage domain
            console.warn(`   ⚠️  Upload failed: ${err.message}`);
            console.warn('   Trying alternative bucket name (<project>.firebasestorage.app) …');
            try {
                const altBucket = admin.storage().bucket(`${projectId}.firebasestorage.app`);
                const [altFile] = yield altBucket.upload(localPath, {
                    destination: destPath,
                    metadata: { contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}` }
                });
                yield altFile.makePublic();
                imageUrl = `https://storage.googleapis.com/${projectId}.firebasestorage.app/${destPath}`;
                console.log(`   ✅ URL (alt): ${imageUrl}`);
            }
            catch (err2) {
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
    yield batch.commit();
    console.log('\n✅ Seeding complete!');
    console.log(`   • qr_codes/0 – qr_codes/${Math.min(files.length, TOTAL_QRS) - 1} written`);
    console.log(`   • system_settings/qr_rotation seeded\n`);
    process.exit(0);
});
run().catch(err => {
    console.error('\n❌ SEED FAILED:', err.message || err);
    process.exit(1);
});
