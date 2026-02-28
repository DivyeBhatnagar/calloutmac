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
exports.registrationService = void 0;
const firebase_admin_1 = require("../../config/firebase.admin");
exports.registrationService = {
    createRegistration(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tournamentId, teamName, iglName, iglContact, playerNames, playerIds } = data;
            const tDoc = yield firebase_admin_1.db.collection('tournaments').doc(tournamentId).get();
            if (!tDoc.exists) {
                throw { statusCode: 404, message: 'Tournament not found' };
            }
            const tournamentData = tDoc.data();
            if ((tournamentData === null || tournamentData === void 0 ? void 0 : tournamentData.status) !== 'ACTIVE') {
                throw { statusCode: 400, message: 'Tournament is not active' };
            }
            const regCountSnapshot = yield firebase_admin_1.db.collection('registrations').where('tournamentId', '==', tournamentId).get();
            if (regCountSnapshot.size >= ((tournamentData === null || tournamentData === void 0 ? void 0 : tournamentData.maxSlots) || 0)) {
                throw { statusCode: 400, message: 'Tournament is full' };
            }
            const duplicateSnapshot = yield firebase_admin_1.db.collection('registrations')
                .where('tournamentId', '==', tournamentId)
                .where('teamName', '==', teamName)
                .get();
            if (!duplicateSnapshot.empty) {
                throw { statusCode: 400, message: 'Team name already exists in this tournament' };
            }
            const newRegRef = firebase_admin_1.db.collection('registrations').doc();
            const regData = {
                userId,
                tournamentId,
                teamName,
                iglName,
                iglContact,
                playerNames: playerNames || [],
                playerIds: playerIds || [],
                paymentStatus: 'PENDING',
                createdAt: new Date().toISOString()
            };
            yield newRegRef.set(regData);
            return Object.assign({ id: newRegRef.id }, regData);
        });
    },
    getUserRegistrations(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const snapshot = yield firebase_admin_1.db.collection('registrations').where('userId', '==', userId).get();
            const result = [];
            for (const doc of snapshot.docs) {
                const regData = doc.data();
                const tDoc = yield firebase_admin_1.db.collection('tournaments').doc(regData.tournamentId).get();
                const pSnapshot = yield firebase_admin_1.db.collection('payments').where('registrationId', '==', doc.id).get();
                let payment = null;
                if (!pSnapshot.empty) {
                    payment = Object.assign({ id: pSnapshot.docs[0].id }, pSnapshot.docs[0].data());
                }
                result.push(Object.assign(Object.assign({ id: doc.id }, regData), { tournament: tDoc.exists ? Object.assign({ id: tDoc.id }, tDoc.data()) : null, payment }));
            }
            return result;
        });
    },
    getAllRegistrations() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const snapshot = yield firebase_admin_1.db.collection('registrations').orderBy('createdAt', 'desc').get();
            const result = [];
            for (const doc of snapshot.docs) {
                const regData = doc.data();
                const uDoc = yield firebase_admin_1.db.collection('users').doc(regData.userId).get();
                const tDoc = yield firebase_admin_1.db.collection('tournaments').doc(regData.tournamentId).get();
                result.push(Object.assign(Object.assign({ id: doc.id }, regData), { user: uDoc.exists ? { username: (_a = uDoc.data()) === null || _a === void 0 ? void 0 : _a.username, email: (_b = uDoc.data()) === null || _b === void 0 ? void 0 : _b.email } : null, tournament: tDoc.exists ? { name: (_c = tDoc.data()) === null || _c === void 0 ? void 0 : _c.name } : null }));
            }
            return result;
        });
    },
    verifyRegistration(registrationId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield firebase_admin_1.db.collection('registrations').doc(registrationId).update({ paymentStatus: 'VERIFIED' });
            const updated = yield firebase_admin_1.db.collection('registrations').doc(registrationId).get();
            return Object.assign({ id: updated.id }, updated.data());
        });
    }
};
