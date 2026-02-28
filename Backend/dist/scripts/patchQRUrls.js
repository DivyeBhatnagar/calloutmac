"use strict";
/**
 * patchQRUrls.ts
 * Patches qr_codes Firestore docs with backend static file URLs.
 * Backend serves QR images at: http://localhost:5000/qr/qrN.jpeg
 *
 * Run AFTER the backend is running:
 *   cd "CALLOUT NEW/Backend"
 *   npx ts-node src/scripts/patchQRUrls.ts
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
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
if (!admin.apps.length) {
    const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (b64) {
        const serviceAccount = JSON.parse(Buffer.from(b64, 'base64').toString('ascii'));
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    }
    else {
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
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`\n🔗 Patching qr_codes imageUrls → ${BACKEND_URL}/qr/<file>\n`);
    const batch = db.batch();
    for (let i = 0; i < QR_FILES.length; i++) {
        const imageUrl = `${BACKEND_URL}/qr/${QR_FILES[i]}`;
        const ref = db.collection('qr_codes').doc(String(i));
        batch.update(ref, { imageUrl });
        console.log(`   qr_codes/${i} → ${imageUrl}`);
    }
    yield batch.commit();
    console.log('\n✅ All qr_codes imageUrl fields updated!');
    console.log('   QR images will now load from the backend static server.\n');
    process.exit(0);
});
run().catch(err => {
    console.error('❌ Patch failed:', err.message || err);
    process.exit(1);
});
