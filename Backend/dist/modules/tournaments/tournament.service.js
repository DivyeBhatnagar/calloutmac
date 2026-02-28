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
                const regSnapshot = yield firebase_admin_1.db.collection('registrations').where('tournamentId', '==', doc.id).get();
                tournaments.push(Object.assign(Object.assign({ id: doc.id }, data), { _count: { registrations: regSnapshot.size } }));
            }
            return tournaments;
        });
    },
    getTournamentById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield firebase_admin_1.db.collection('tournaments').doc(id).get();
            if (!doc.exists) {
                throw { statusCode: 404, message: 'Tournament not found' };
            }
            const regSnapshot = yield firebase_admin_1.db.collection('registrations').where('tournamentId', '==', id).get();
            return Object.assign(Object.assign({ id: doc.id }, doc.data()), { _count: { registrations: regSnapshot.size } });
        });
    }
};
