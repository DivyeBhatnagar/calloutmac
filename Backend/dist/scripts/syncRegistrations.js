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
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
if (!serviceAccountKey && !serviceAccountBase64) {
    console.error('Neither FIREBASE_SERVICE_ACCOUNT_KEY nor FIREBASE_SERVICE_ACCOUNT_BASE64 is set.');
    process.exit(1);
}
let serviceAccount;
if (serviceAccountBase64) {
    try {
        serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('ascii'));
    }
    catch (error) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64.');
        process.exit(1);
    }
}
else if (serviceAccountKey) {
    try {
        serviceAccount = JSON.parse(serviceAccountKey);
    }
    catch (error) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY.');
        process.exit(1);
    }
}
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();
const syncLegacyRegistrations = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('🔄 Starting sync of all legacy registrations...');
        const tournamentsSnapshot = yield db.collection('tournaments').get();
        console.log(`Found ${tournamentsSnapshot.size} tournaments.`);
        const batch = db.batch();
        let totalUpdated = 0;
        for (const tDoc of tournamentsSnapshot.docs) {
            const tournamentId = tDoc.id;
            // Count all registrations for this tournament
            const registrationsSnapshot = yield db.collection('registrations')
                .where('tournamentId', '==', tournamentId)
                .get();
            const actualCount = registrationsSnapshot.size;
            const currentCount = tDoc.data().currentRegistrations || 0;
            if (actualCount !== currentCount) {
                console.log(`Tournament ${tDoc.data().name} (${tournamentId}): Expected ${actualCount}, found ${currentCount}. Updating...`);
                batch.update(tDoc.ref, { currentRegistrations: actualCount });
                totalUpdated++;
            }
            else {
                console.log(`Tournament ${tDoc.data().name} (${tournamentId}): Correct count ${currentCount}. Skipping.`);
                // Even if it matches but the field doesn't explicitly exist, we should set it
                if (tDoc.data().currentRegistrations === undefined) {
                    batch.update(tDoc.ref, { currentRegistrations: actualCount });
                    totalUpdated++;
                }
            }
        }
        if (totalUpdated > 0) {
            yield batch.commit();
            console.log(`✅ Success! Synced ${totalUpdated} tournaments with their actual registration counts.`);
        }
        else {
            console.log(`✅ Success! All tournaments already have the correct registration counts.`);
        }
        process.exit(0);
    }
    catch (e) {
        console.error('CRITICAL ERROR DURING SYNC:', e);
        process.exit(1);
    }
});
syncLegacyRegistrations();
