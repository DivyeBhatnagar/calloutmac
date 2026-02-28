"use strict";
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
exports.tournamentService = void 0;
const firebase_admin_1 = require("../../config/firebase.admin");
exports.tournamentService = {
    getTournaments() {
        return __awaiter(this, void 0, void 0, function* () {
            const snapshot = yield firebase_admin_1.db.collection('tournaments').orderBy('createdAt', 'desc').get();
            const tournaments = [];
            for (const doc of snapshot.docs) {
                const data = doc.data();
                const regSnapshot = yield firebase_admin_1.db.collection('registrations')
                    .where('tournamentId', '==', doc.id)
                    .get();
                const maxSlots = data.maxSlots || 0;
                const currentRegistrations = data.currentRegistrations || regSnapshot.size;
                tournaments.push(Object.assign(Object.assign({ id: doc.id }, data), { availableSlots: maxSlots > 0 ? Math.max(0, maxSlots - currentRegistrations) : null, _count: { registrations: regSnapshot.size } }));
            }
            return tournaments;
        });
    },
    // ============================================================
    // STEP 2 — TOURNAMENT VALIDATION
    // GET /api/tournaments/:id
    // Returns tournament with availableSlots, allowedColleges,
    // and supportedGames for frontend pre-flight checks.
    // ============================================================
    getTournamentById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield firebase_admin_1.db.collection('tournaments').doc(id).get();
            if (!doc.exists) {
                throw { statusCode: 404, message: 'Tournament not found' };
            }
            const data = doc.data();
            const maxSlots = data.maxSlots || 0;
            const currentRegistrations = data.currentRegistrations || 0;
            const availableSlots = maxSlots > 0
                ? Math.max(0, maxSlots - currentRegistrations)
                : null;
            return Object.assign(Object.assign({ id: doc.id }, data), { 
                // Computed fields for frontend pre-registration checks
                availableSlots, isFull: maxSlots > 0 && currentRegistrations >= maxSlots, allowedColleges: data.allowedColleges || [], supportedGames: data.supportedGames || [] });
        });
    }
};
