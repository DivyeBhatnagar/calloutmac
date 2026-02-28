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
exports.userService = void 0;
const firebase_admin_1 = require("../../config/firebase.admin");
exports.userService = {
    getDashboardStats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const registrationsSnapshot = yield firebase_admin_1.db.collection('registrations').where('userId', '==', userId).get();
            let activeRegistrations = 0;
            let completedTournaments = 0;
            const totalTournamentsJoined = registrationsSnapshot.size;
            for (const doc of registrationsSnapshot.docs) {
                const reg = doc.data();
                const tSnapshot = yield firebase_admin_1.db.collection('tournaments').doc(reg.tournamentId).get();
                if (tSnapshot.exists) {
                    const tData = tSnapshot.data();
                    if (((_a = tData === null || tData === void 0 ? void 0 : tData.status) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'active')
                        activeRegistrations++;
                    if (((_b = tData === null || tData === void 0 ? void 0 : tData.status) === null || _b === void 0 ? void 0 : _b.toLowerCase()) === 'closed')
                        completedTournaments++;
                }
            }
            const totalWinnings = 0;
            return {
                totalTournamentsJoined,
                activeRegistrations,
                completedTournaments,
                totalWinnings
            };
        });
    },
    getUserTournaments(userId) {
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
    updateProfile(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { phoneNumber } = data;
            const updateData = {};
            if (phoneNumber)
                updateData.phoneNumber = phoneNumber;
            yield firebase_admin_1.db.collection('users').doc(userId).update(updateData);
            const userDoc = yield firebase_admin_1.db.collection('users').doc(userId).get();
            return Object.assign({ id: userDoc.id }, userDoc.data());
        });
    },
    submitQuery(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { subject, message, category } = data;
            const newQueryRef = firebase_admin_1.db.collection('queries').doc();
            const queryData = {
                userId,
                subject,
                message,
                category,
                status: 'PENDING',
                adminResponse: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            yield newQueryRef.set(queryData);
            return Object.assign({ id: newQueryRef.id }, queryData);
        });
    },
    getUserQueries(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const snapshot = yield firebase_admin_1.db.collection('queries')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();
            return snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        });
    }
};
