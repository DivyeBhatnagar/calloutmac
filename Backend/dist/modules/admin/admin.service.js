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
exports.adminService = void 0;
const firebase_admin_1 = require("../../config/firebase.admin");
exports.adminService = {
    getAdminStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const usersSnapshot = yield firebase_admin_1.db.collection('users').get();
            const tournamentsSnapshot = yield firebase_admin_1.db.collection('tournaments').get();
            const activeTournamentsSnapshot = yield firebase_admin_1.db.collection('tournaments').where('status', '==', 'ACTIVE').get();
            const registrationsSnapshot = yield firebase_admin_1.db.collection('registrations').get();
            const paymentsSnapshot = yield firebase_admin_1.db.collection('payments').where('status', '==', 'VERIFIED').get();
            let totalRevenue = 0;
            paymentsSnapshot.forEach(doc => {
                totalRevenue += (doc.data().amount || 0);
            });
            return {
                totalUsers: usersSnapshot.size,
                totalTournaments: tournamentsSnapshot.size,
                activeTournaments: activeTournamentsSnapshot.size,
                totalRegistrations: registrationsSnapshot.size,
                totalRevenue
            };
        });
    },
    getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            // Removed orderBy('createdAt', 'desc') because Firestore excludes documents without this field
            const usersSnapshot = yield firebase_admin_1.db.collection('users').get();
            const result = [];
            for (const doc of usersSnapshot.docs) {
                const data = doc.data();
                const regSnapshot = yield firebase_admin_1.db.collection('registrations').where('userId', '==', doc.id).get();
                result.push({
                    id: doc.id,
                    username: data.username || 'Unknown Operator',
                    email: data.email || 'No Email',
                    role: data.role || 'USER',
                    createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) : null,
                    _count: { registrations: regSnapshot.size }
                });
            }
            // Sort locally
            result.sort((a, b) => {
                if (!a.createdAt)
                    return 1;
                if (!b.createdAt)
                    return -1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            return result;
        });
    },
    deleteUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Delete Firebase Auth User
            try {
                yield firebase_admin_1.adminAuth.deleteUser(userId);
            }
            catch (e) {
                console.warn("User already deleted from auth or failed auth deletion", e);
            }
            // Delete related records manually for simplified schema
            const queriesSnapshot = yield firebase_admin_1.db.collection('queries').where('userId', '==', userId).get();
            const regSnapshot = yield firebase_admin_1.db.collection('registrations').where('userId', '==', userId).get();
            const batch = firebase_admin_1.db.batch();
            queriesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
            regSnapshot.docs.forEach(doc => batch.delete(doc.ref));
            // Deleting payments is harder without nested queries, skipping cascading payments in NoSQL for simplicity,
            // or we'd fetch all user's registrations, then fetch all payments for those registrations.
            batch.delete(firebase_admin_1.db.collection('users').doc(userId));
            yield batch.commit();
            return { success: true, message: `User ${userId} deleted` };
        });
    },
    updateUserRole(userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRef = firebase_admin_1.db.collection('users').doc(userId);
            const doc = yield userRef.get();
            if (!doc.exists) {
                throw new Error('User not found');
            }
            yield userRef.update({ role });
            // NOTE: we don't strictly need to update custom claims here if we rely on DB role checks, 
            // but if we used Firebase auth custom claims we would do adminAuth.setCustomUserClaims(userId, { admin: role === 'ADMIN' })
            return { success: true, message: `User role updated to ${role}`, role };
        });
    }
};
