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
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
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
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('--- DIAGNOSTIC DUMP ---');
        console.log('Project ID:', sa.project_id);
        try {
            const qr = yield db.collection('system_settings').doc('qr_rotation').get();
            console.log('QR Rotation setting:', qr.exists ? JSON.stringify(qr.data(), null, 2) : 'NOT FOUND');
            const qrs = yield db.collection('qr_codes').limit(1).get();
            if (!qrs.empty) {
                console.log('Sample QR code data:', JSON.stringify(qrs.docs[0].data(), null, 2));
            }
            else {
                console.log('No QR codes found.');
            }
            const ts = yield db.collection('tournaments').where('posterUrl', '!=', '').limit(1).get();
            if (!ts.empty) {
                console.log('Sample tournament poster URL:', ts.docs[0].data().posterUrl);
            }
            else {
                console.log('No tournament posters found.');
            }
        }
        catch (e) {
            console.error('Error reading Firestore:', e.message);
        }
        process.exit(0);
    });
}
run();
