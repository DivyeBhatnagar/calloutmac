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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = void 0;
const firebase_admin_1 = require("../../config/firebase.admin");
const firebase_admin_2 = __importDefault(require("../../config/firebase.admin"));
exports.adminService = {
    // ============================================================
    // Admin stats — revenue now read from embedded payment.amount
    // inside registrations (no separate payments collection)
    // ============================================================
    getAdminStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const usersSnapshot = yield firebase_admin_1.db.collection('users').get();
            const tournamentsSnapshot = yield firebase_admin_1.db.collection('tournaments').get();
            const activeTournamentsSnapshot = yield firebase_admin_1.db.collection('tournaments').where('status', 'in', ['ACTIVE', 'active']).get();
            const registrationsSnapshot = yield firebase_admin_1.db.collection('registrations').get();
            let totalRevenue = 0;
            registrationsSnapshot.forEach(doc => {
                var _a;
                const d = doc.data();
                if (d.paymentStatus === 'VERIFIED' && ((_a = d.payment) === null || _a === void 0 ? void 0 : _a.amount)) {
                    totalRevenue += (d.payment.amount || 0);
                }
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
                    createdAt: data.createdAt
                        ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt)
                        : null,
                    _count: { registrations: regSnapshot.size }
                });
            }
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
            try {
                yield firebase_admin_1.adminAuth.deleteUser(userId);
            }
            catch (e) {
                console.warn('User already deleted from auth or failed auth deletion', e);
            }
            const queriesSnapshot = yield firebase_admin_1.db.collection('queries').where('userId', '==', userId).get();
            const regSnapshot = yield firebase_admin_1.db.collection('registrations').where('userId', '==', userId).get();
            const batch = firebase_admin_1.db.batch();
            queriesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
            regSnapshot.docs.forEach(doc => batch.delete(doc.ref));
            batch.delete(firebase_admin_1.db.collection('users').doc(userId));
            yield batch.commit();
            return { success: true, message: `User ${userId} deleted` };
        });
    },
    updateUserRole(userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRef = firebase_admin_1.db.collection('users').doc(userId);
            const doc = yield userRef.get();
            if (!doc.exists)
                throw { statusCode: 404, message: 'User not found' };
            yield userRef.update({ role });
            return { success: true, message: `User role updated to ${role}`, role };
        });
    },
    // ============================================================
    // ADMIN: GET ALL REGISTRATIONS
    // Reads payment details from embedded payment sub-object
    // inside each registration doc (no payments collection join).
    // ============================================================
    getAllRegistrations() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const snapshot = yield firebase_admin_1.db.collection('registrations')
                .orderBy('createdAt', 'desc')
                .get();
            const result = [];
            for (const doc of snapshot.docs) {
                const r = doc.data();
                const uDoc = yield firebase_admin_1.db.collection('users').doc(r.userId).get();
                const tDoc = yield firebase_admin_1.db.collection('tournaments').doc(r.tournamentId).get();
                result.push({
                    id: doc.id,
                    // Team
                    teamName: r.teamName,
                    iglName: r.iglName,
                    iglContact: r.iglContact,
                    // Players — arrays are parallel: playerNames[i] ↔ playerIds[i]
                    playerNames: r.playerNames || [],
                    playerIds: r.playerIds || [],
                    // Tournament
                    game: r.game,
                    college: r.college,
                    // QR
                    qrIndex: r.qrIndex,
                    // Status
                    paymentStatus: r.paymentStatus,
                    paymentVerified: r.paymentVerified || false,
                    // Timestamps
                    createdAt: r.createdAt,
                    verifiedAt: r.verifiedAt || null,
                    verifiedBy: r.verifiedBy || null,
                    // Embedded payment proof
                    payment: r.payment || null,
                    // Joined
                    user: uDoc.exists ? { username: (_a = uDoc.data()) === null || _a === void 0 ? void 0 : _a.username, email: (_b = uDoc.data()) === null || _b === void 0 ? void 0 : _b.email } : null,
                    tournament: tDoc.exists ? { id: tDoc.id, name: (_c = tDoc.data()) === null || _c === void 0 ? void 0 : _c.name } : null,
                });
            }
            return result;
        });
    },
    // ============================================================
    // ADMIN: VERIFY PAYMENT
    // Updates paymentStatus + paymentVerified on the registration doc.
    // No separate payments collection update needed.
    // ============================================================
    verifyRegistrationPayment(adminId, registrationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const regRef = firebase_admin_1.db.collection('registrations').doc(registrationId);
            const regDoc = yield regRef.get();
            if (!regDoc.exists)
                throw { statusCode: 404, message: 'Registration not found' };
            const regData = regDoc.data();
            if (regData.paymentStatus === 'VERIFIED') {
                throw { statusCode: 400, message: 'Payment is already verified — no double verification allowed' };
            }
            if (regData.paymentStatus !== 'PENDING') {
                throw {
                    statusCode: 400,
                    message: `Cannot verify: current status is "${regData.paymentStatus}". Must be PENDING.`
                };
            }
            const verifiedAt = new Date().toISOString();
            yield regRef.update({
                paymentStatus: 'VERIFIED',
                paymentVerified: true,
                verifiedAt,
                verifiedBy: adminId
            });
            const updatedDoc = yield regRef.get();
            return Object.assign({ id: updatedDoc.id }, updatedDoc.data());
        });
    },
    // ============================================================
    // ADMIN: EXPORT CSV
    // Full CSV with playerNames + playerIds side by side
    // ============================================================
    exportRegistrationsCSV(tournamentId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            let query = firebase_admin_1.db.collection('registrations');
            if (tournamentId) {
                query = query.where('tournamentId', '==', tournamentId);
            }
            const snapshot = yield query.orderBy('createdAt', 'desc').get();
            const rows = [];
            // Header
            rows.push([
                'RegistrationID', 'TournamentID', 'TeamName',
                'IGLName', 'IGLContact',
                'Player1Name', 'Player1ID',
                'Player2Name', 'Player2ID',
                'Player3Name', 'Player3ID',
                'Player4Name', 'Player4ID',
                'SubstituteName', 'SubstituteID',
                'College', 'Game',
                'QRIndex', 'PaymentStatus',
                'TransactionID', 'UpiID', 'BankName',
                'PaymentDate', 'PaymentTime', 'Amount',
                'VerifiedAt', 'VerifiedBy', 'CreatedAt'
            ].join(','));
            for (const doc of snapshot.docs) {
                const r = doc.data();
                const names = r.playerNames || [];
                const ids = r.playerIds || [];
                const pay = r.payment || {};
                const playerCols = [];
                for (let i = 0; i < 5; i++) {
                    playerCols.push(`"${(names[i] || '').replace(/"/g, '""')}"`);
                    playerCols.push(`"${(ids[i] || '').replace(/"/g, '""')}"`);
                }
                rows.push([
                    doc.id,
                    r.tournamentId,
                    `"${(r.teamName || '').replace(/"/g, '""')}"`,
                    `"${(r.iglName || '').replace(/"/g, '""')}"`,
                    `"${(r.iglContact || '').replace(/"/g, '""')}"`,
                    ...playerCols,
                    `"${(r.college || '').replace(/"/g, '""')}"`,
                    `"${(r.game || '').replace(/"/g, '""')}"`,
                    (_a = r.qrIndex) !== null && _a !== void 0 ? _a : '',
                    r.paymentStatus || '',
                    `"${(pay.transactionId || '').replace(/"/g, '""')}"`,
                    `"${(pay.upiId || '').replace(/"/g, '""')}"`,
                    `"${(pay.bankName || '').replace(/"/g, '""')}"`,
                    pay.paymentDate || '',
                    pay.paymentTime || '',
                    pay.amount || '',
                    r.verifiedAt || '',
                    r.verifiedBy || '',
                    ((_e = (_c = (_b = r.createdAt) === null || _b === void 0 ? void 0 : _b.toDate) === null || _c === void 0 ? void 0 : (_d = _c.call(_b)).toISOString) === null || _e === void 0 ? void 0 : _e.call(_d)) || r.createdAt || ''
                ].join(','));
            }
            return rows.join('\n');
        });
    },
    // ============================================================
    // TOURNAMENT MANAGEMENT (REFACTORED)
    // ============================================================
    /**
     * Internal validation for tournament activation
     */
    _validateActivation(data) {
        if (!data.posterUrl)
            throw { statusCode: 400, message: 'Activation requires a tournament poster' };
        if (!data.supportedGames || data.supportedGames.length === 0) {
            throw { statusCode: 400, message: 'Activation requires at least one supported game' };
        }
        if (!data.registrationDeadline)
            throw { statusCode: 400, message: 'Registration deadline is required for activation' };
    },
    /**
     * Basic metadata validation for any save/update
     */
    _validateBasicMetadata(data) {
        var _a, _b;
        if (!((_a = data.name) === null || _a === void 0 ? void 0 : _a.trim()))
            throw { statusCode: 400, message: 'Tournament name is required' };
        if (!((_b = data.description) === null || _b === void 0 ? void 0 : _b.trim()))
            throw { statusCode: 400, message: 'Tournament description is required' };
        if (data.paymentAmount < 0)
            throw { statusCode: 400, message: 'Payment amount cannot be negative' };
        if (data.maxSlots < 0)
            throw { statusCode: 400, message: 'Max slots cannot be negative' };
        if (data.collegesRestricted && (!data.allowedColleges || data.allowedColleges.length === 0)) {
            throw { statusCode: 400, message: 'Restriction is ON but no colleges were added' };
        }
    },
    createTournament(adminId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            this._validateBasicMetadata(data);
            // If trying to create as ACTIVE, check activation rules
            if (data.status === 'ACTIVE') {
                this._validateActivation(data);
            }
            const newDoc = firebase_admin_1.db.collection('tournaments').doc();
            const tournamentData = {
                name: data.name,
                description: data.description,
                posterUrl: data.posterUrl || '',
                posterThumbnailUrl: data.posterThumbnailUrl || '',
                supportedGames: data.supportedGames || [],
                allowedColleges: data.allowedColleges || [],
                collegesRestricted: !!data.collegesRestricted,
                paymentAmount: data.paymentAmount || 0,
                maxSlots: data.maxSlots || 0,
                currentRegistrations: 0,
                status: data.status || 'DRAFT',
                registrationDeadline: data.registrationDeadline ? firebase_admin_2.default.firestore.Timestamp.fromDate(new Date(data.registrationDeadline)) : null,
                createdBy: adminId,
                createdAt: firebase_admin_2.default.firestore.Timestamp.now(),
                updatedAt: firebase_admin_2.default.firestore.Timestamp.now()
            };
            yield newDoc.set(tournamentData);
            return Object.assign({ id: newDoc.id }, tournamentData);
        });
    },
    updateTournament(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const tRef = firebase_admin_1.db.collection('tournaments').doc(id);
            const tDoc = yield tRef.get();
            if (!tDoc.exists)
                throw { statusCode: 404, message: 'Tournament not found' };
            const currentData = tDoc.data();
            const mergedData = Object.assign(Object.assign({}, currentData), data);
            this._validateBasicMetadata(mergedData);
            // If status is changing to ACTIVE (or is already ACTIVE), validate
            if (mergedData.status === 'ACTIVE') {
                this._validateActivation(mergedData);
            }
            const updateData = Object.assign(Object.assign({}, data), { updatedAt: firebase_admin_2.default.firestore.Timestamp.now() });
            // Convert dates to Timestamps if provided
            if (data.registrationDeadline) {
                updateData.registrationDeadline = firebase_admin_2.default.firestore.Timestamp.fromDate(new Date(data.registrationDeadline));
            }
            // Remove legacy date fields explicitly if they were passed (cleanup)
            delete updateData.startDate;
            delete updateData.endDate;
            yield tRef.update(updateData);
            const updatedDoc = yield tRef.get();
            return Object.assign({ id: updatedDoc.id }, updatedDoc.data());
        });
    },
    deleteTournament(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const tRef = firebase_admin_1.db.collection('tournaments').doc(id);
            const tDoc = yield tRef.get();
            if (!tDoc.exists)
                throw { statusCode: 404, message: 'Tournament not found' };
            const data = tDoc.data();
            if (data.currentRegistrations > 0) {
                throw { statusCode: 400, message: 'Cannot delete tournament with existing registrations' };
            }
            yield tRef.delete();
            return { success: true, message: 'Tournament deleted successfully' };
        });
    },
    uploadTournamentPoster(id, file) {
        return __awaiter(this, void 0, void 0, function* () {
            const tRef = firebase_admin_1.db.collection('tournaments').doc(id);
            const tDoc = yield tRef.get();
            if (!tDoc.exists)
                throw { statusCode: 404, message: 'Tournament not found' };
            const { StorageService } = require('../shared/storage.service');
            console.log(`[AdminService] 🧩 Calling StorageService.uploadFile for poster`);
            const url = yield StorageService.uploadFile(file.buffer, 'posters', file.mimetype);
            yield tRef.update({
                posterUrl: url,
                posterThumbnailUrl: url, // For now using same, could resize later
                updatedAt: firebase_admin_2.default.firestore.Timestamp.now()
            });
            return { url };
        });
    },
    uploadGameLogo(id, gameId, file) {
        return __awaiter(this, void 0, void 0, function* () {
            const tRef = firebase_admin_1.db.collection('tournaments').doc(id);
            const tDoc = yield tRef.get();
            if (!tDoc.exists)
                throw { statusCode: 404, message: 'Tournament not found' };
            const data = tDoc.data();
            const games = data.supportedGames || [];
            const gameIndex = games.findIndex((g) => g.id === gameId);
            if (gameIndex === -1)
                throw { statusCode: 404, message: 'Game not found in this tournament' };
            const { StorageService } = require('../shared/storage.service');
            console.log(`[AdminService] 🧩 Calling StorageService.uploadFile for gameId: ${gameId}`);
            const url = yield StorageService.uploadFile(file.buffer, 'games', file.mimetype);
            games[gameIndex].logoUrl = url;
            yield tRef.update({
                supportedGames: games,
                updatedAt: firebase_admin_2.default.firestore.Timestamp.now()
            });
            return { url };
        });
    },
    uploadCollegeLogo(id, collegeId, file) {
        return __awaiter(this, void 0, void 0, function* () {
            const tRef = firebase_admin_1.db.collection('tournaments').doc(id);
            const tDoc = yield tRef.get();
            if (!tDoc.exists)
                throw { statusCode: 404, message: 'Tournament not found' };
            const data = tDoc.data();
            const colleges = data.allowedColleges || [];
            const collegeIndex = colleges.findIndex((c) => c.id === collegeId);
            if (collegeIndex === -1)
                throw { statusCode: 404, message: 'College not found in this tournament' };
            const { StorageService } = require('../shared/storage.service');
            const url = yield StorageService.uploadFile(file.buffer, 'colleges', file.mimetype);
            colleges[collegeIndex].logoUrl = url;
            yield tRef.update({
                allowedColleges: colleges,
                updatedAt: firebase_admin_2.default.firestore.Timestamp.now()
            });
            return { url };
        });
    }
};
