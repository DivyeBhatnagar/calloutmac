"use strict";
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
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!serviceAccountKey) {
    console.error('FIREBASE_SERVICE_ACCOUNT_KEY is not set in environment variables.');
    process.exit(1);
}
let serviceAccount;
try {
    serviceAccount = JSON.parse(serviceAccountKey);
}
catch (error) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Ensure it is a valid JSON string.');
    process.exit(1);
}
// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: serviceAccount.project_id + '.appspot.com'
    });
}
const db = admin.firestore();
const storage = admin.storage().bucket();
const seedQRData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Starting Dynamic QR seeding script...');
        const imageDir = path.resolve(__dirname, '../../../../Media/PaymentQR');
        if (!fs.existsSync(imageDir)) {
            console.error(`Local QR Directory not found at: ${imageDir}`);
            process.exit(1);
        }
        const files = fs.readdirSync(imageDir).filter(file => file.endsWith('.jpeg') || file.endsWith('.png') || file.endsWith('.jpg'));
        if (files.length === 0) {
            console.error('No QR code images found in the specified directory.');
            process.exit(1);
        }
        console.log(`Found ${files.length} QR images for dynamic round-robin rotation.`);
        const batch = db.batch();
        for (let i = 0; i < files.length; i++) {
            const fileName = files[i];
            const filePath = path.join(imageDir, fileName);
            console.log(`Uploading ${fileName} to Firebase Storage...`);
            // Upload to standard storage directory
            const destinationPath = `payment_qrs/${Date.now()}_${fileName}`;
            const [file, _] = yield storage.upload(filePath, {
                destination: destinationPath,
                metadata: {
                    contentType: `image/${fileName.split('.').pop()}`
                }
            });
            // Make public to get static URL
            yield file.makePublic();
            const imageUrl = `https://storage.googleapis.com/${storage.name}/${destinationPath}`;
            console.log(`Generated public URL: ${imageUrl}`);
            console.log(`Adding to Firestore qr_codes collection at index ${i}...`);
            // Seed `qr_codes` document by standard index
            const qrRef = db.collection('qr_codes').doc(i.toString());
            batch.set(qrRef, {
                id: i,
                imageUrl: imageUrl,
                isActive: true,
                usageCount: 0,
                lastUsedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        console.log(`Initializing system_settings...`);
        const systemRef = db.collection('system_settings').doc('qr_rotation');
        batch.set(systemRef, {
            currentIndex: 0,
            totalQRs: files.length,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });
        yield batch.commit();
        console.log('✅ Success! Firebase dynamically seeded and rotation logic is active.');
        process.exit(0);
    }
    catch (e) {
        console.error('CRITICAL INITIALIZATION ERROR:', e);
        process.exit(1);
    }
});
seedQRData();
