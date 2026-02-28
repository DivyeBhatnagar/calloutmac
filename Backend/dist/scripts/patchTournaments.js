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
const firebase_admin_1 = __importStar(require("../config/firebase.admin"));
/**
 * DYNAMIC TOURNAMENT PATCH
 *
 * Ensures all existing active tournaments have:
 * 1. supportedGames: Derived from the 'games' array if present, else ["BGMI"]
 * 2. allowedColleges: [] (default if missing)
 * 3. status: "active" (if missing)
 *
 * This ensures the frontend selection wizard is fully dynamic for all tournaments.
 */
function patchTournaments() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🚀 Starting dynamic tournament patch...');
        const snap = yield firebase_admin_1.db.collection('tournaments').get();
        console.log(`Found ${snap.size} tournaments total.`);
        const batch = firebase_admin_1.db.batch();
        let count = 0;
        for (const doc of snap.docs) {
            const data = doc.data();
            const update = {};
            let changed = false;
            // 1. supportedGames (Dynamic derivation to objects)
            const existingGames = data.games || []; // Array of { id, name, logoUrl }
            let targetGames = [];
            if (Array.isArray(existingGames) && existingGames.length > 0) {
                targetGames = existingGames.map((g) => ({
                    id: g.id || firebase_admin_1.default.firestore().collection('tmp').doc().id,
                    name: g.name,
                    logoUrl: g.logoUrl || ''
                }));
            }
            else if (Array.isArray(data.supportedGames) && data.supportedGames.length > 0) {
                // Convert legacy string array to objects
                targetGames = data.supportedGames.map((g) => {
                    if (typeof g === 'string')
                        return { id: firebase_admin_1.default.firestore().collection('tmp').doc().id, name: g, logoUrl: '' };
                    return g;
                });
            }
            if (targetGames.length === 0) {
                targetGames = [{ id: 'bgmi-default', name: 'BGMI', logoUrl: '' }];
            }
            // Compare targetGames with current supportedGames
            const currentGames = data.supportedGames || [];
            const isGameMismatch = JSON.stringify(currentGames) !== JSON.stringify(targetGames);
            if (isGameMismatch) {
                update.supportedGames = targetGames;
                changed = true;
            }
            // 2. allowedColleges (Objects {id, name, logoUrl})
            let targetColleges = [];
            if (Array.isArray(data.allowedColleges) && data.allowedColleges.length > 0) {
                targetColleges = data.allowedColleges.map((c) => {
                    if (typeof c === 'string')
                        return { id: firebase_admin_1.default.firestore().collection('tmp').doc().id, name: c, logoUrl: '' };
                    return c;
                });
            }
            const currentColleges = data.allowedColleges || [];
            if (JSON.stringify(currentColleges) !== JSON.stringify(targetColleges)) {
                update.allowedColleges = targetColleges;
                changed = true;
            }
            // 3. status
            if (data.status !== 'ACTIVE') {
                update.status = 'ACTIVE';
                changed = true;
            }
            if (changed) {
                update.updatedAt = firebase_admin_1.default.firestore.Timestamp.now();
                batch.update(doc.ref, update);
                count++;
                console.log(`[PATCH] Tournament: ${data.name || doc.id} -> games: ${JSON.stringify(targetGames)}`);
            }
        }
        if (count > 0) {
            yield batch.commit();
            console.log(`✅ Successfully patched ${count} tournaments.`);
        }
        else {
            console.log('✨ No tournaments needed patching.');
        }
    });
}
patchTournaments()
    .then(() => {
    console.log('🏁 Patch complete.');
    process.exit(0);
})
    .catch(err => {
    console.error('❌ Patch failed:', err);
    process.exit(1);
});
