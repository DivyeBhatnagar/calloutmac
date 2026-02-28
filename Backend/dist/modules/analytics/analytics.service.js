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
exports.analyticsService = void 0;
const firebase_admin_1 = require("../../config/firebase.admin");
exports.analyticsService = {
    getRevenueAnalytics() {
        return __awaiter(this, void 0, void 0, function* () {
            const paymentsSnapshot = yield firebase_admin_1.db.collection('payments').where('status', '==', 'VERIFIED').get();
            const revenueByMonth = {};
            paymentsSnapshot.forEach(doc => {
                const data = doc.data();
                // Ensure 'createdAt' is a string before calling substring
                const createdAt = data.createdAt ? String(data.createdAt) : new Date().toISOString();
                const month = createdAt.substring(0, 7);
                if (!revenueByMonth[month]) {
                    revenueByMonth[month] = 0;
                }
                revenueByMonth[month] += (data.amount || 0);
            });
            return Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue }));
        });
    },
    getUserAnalytics() {
        return __awaiter(this, void 0, void 0, function* () {
            const usersSnapshot = yield firebase_admin_1.db.collection('users').get();
            const usersByMonth = {};
            usersSnapshot.forEach(doc => {
                const data = doc.data();
                const createdAt = data.createdAt ? String(data.createdAt) : new Date().toISOString();
                const month = createdAt.substring(0, 7);
                if (!usersByMonth[month]) {
                    usersByMonth[month] = 0;
                }
                usersByMonth[month] += 1;
            });
            return Object.entries(usersByMonth).map(([month, count]) => ({ month, count }));
        });
    },
    getTournamentAnalytics() {
        return __awaiter(this, void 0, void 0, function* () {
            const tsSnapshot = yield firebase_admin_1.db.collection('tournaments').get();
            const result = [];
            for (const doc of tsSnapshot.docs) {
                const data = doc.data();
                const regSnapshot = yield firebase_admin_1.db.collection('registrations').where('tournamentId', '==', doc.id).get();
                const currentRegistrations = regSnapshot.size;
                const maxSlots = data.maxSlots || 1; // avoid division by zero
                result.push({
                    tournamentId: doc.id,
                    name: data.name,
                    status: data.status,
                    maxSlots: data.maxSlots,
                    currentRegistrations,
                    fillPercentage: Math.round((currentRegistrations / maxSlots) * 100)
                });
            }
            return result;
        });
    }
};
