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
exports.registrationService = void 0;
const firebase_admin_1 = __importStar(require("../../config/firebase.admin"));
// ============================================================
// HELPER — compute human-readable statusLabel from paymentStatus
// ============================================================
function getStatusLabel(paymentStatus) {
    switch ((paymentStatus || '').toUpperCase()) {
        case 'INITIATED': return 'Awaiting Payment';
        case 'PENDING': return 'Payment Under Review';
        case 'VERIFIED': return 'Confirmed';
        default: return 'Unknown';
    }
}
// ============================================================
// HELPER — validate Indian mobile number format
// ============================================================
function isValidPhone(phone) {
    return /^[6-9]\d{9}$/.test(phone);
}
exports.registrationService = {
    // ==========================================================
    // STEP 5 — TEAM FORM VALIDATION + REGISTRATION CREATE
    // POST /api/registrations/create
    // ==========================================================
    createRegistration(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tournamentId, teamName, iglName, iglContact, playerNames, playerIds, college, game } = data;
            // --- Field presence validation ---
            if (!tournamentId || !teamName || !iglName || !iglContact) {
                throw { statusCode: 400, message: 'Missing required fields: tournamentId, teamName, iglName, iglContact' };
            }
            if (!Array.isArray(playerNames) || playerNames.length < 4) {
                throw { statusCode: 400, message: 'playerNames must be an array with at least 4 players' };
            }
            // playerIds is optional — auto-fill empty strings if not provided by the frontend
            const resolvedPlayerIds = Array.isArray(playerIds) && playerIds.length === playerNames.length
                ? playerIds
                : playerNames.map(() => '');
            // --- Contact validation (phone or Discord handle — must not be empty) ---
            if (!iglContact || String(iglContact).trim().length < 3) {
                throw { statusCode: 400, message: 'iglContact must be a valid phone number or Discord handle (min 3 characters)' };
            }
            // --- STEP 2 — TOURNAMENT VALIDATION ---
            const tRef = firebase_admin_1.db.collection('tournaments').doc(tournamentId);
            const tDoc = yield tRef.get();
            if (!tDoc.exists) {
                throw { statusCode: 404, message: 'Tournament not found' };
            }
            const tournamentData = tDoc.data();
            if ((tournamentData.status || '').toUpperCase() !== 'ACTIVE') {
                throw { statusCode: 400, message: 'Tournament is not active' };
            }
            const maxSlots = tournamentData.maxSlots || 0;
            const currentRegistrations = tournamentData.currentRegistrations || 0;
            // Slot check (only enforced when maxSlots > 0)
            if (maxSlots > 0 && currentRegistrations >= maxSlots) {
                throw { statusCode: 400, message: 'Tournament is full — no slots available' };
            }
            // --- STEP 3 — COLLEGE VALIDATION ---
            if (tournamentData.collegesRestricted) {
                const allowedColleges = tournamentData.allowedColleges || [];
                if (allowedColleges.length > 0) {
                    if (!college) {
                        throw { statusCode: 400, message: 'This tournament requires a college selection' };
                    }
                    const isValid = allowedColleges.some((c) => c.name === college);
                    if (!isValid) {
                        throw { statusCode: 400, message: `College "${college}" is not allowed for this tournament` };
                    }
                }
            }
            // --- STEP 4 — GAME VALIDATION ---
            const supportedGames = tournamentData.supportedGames || [];
            let resolvedGame = game;
            if (supportedGames.length === 1) {
                // Single-game tournament — assign automatically
                resolvedGame = supportedGames[0].name;
            }
            else if (supportedGames.length > 1) {
                if (!game) {
                    throw { statusCode: 400, message: 'This tournament requires a game selection' };
                }
                const isValid = supportedGames.some((g) => g.name === game);
                if (!isValid) {
                    throw { statusCode: 400, message: `Game "${game}" is not supported by this tournament` };
                }
            }
            // --- Duplicate team name check ---
            const duplicateSnap = yield firebase_admin_1.db.collection('registrations')
                .where('tournamentId', '==', tournamentId)
                .where('teamName', '==', teamName)
                .get();
            if (!duplicateSnap.empty) {
                throw { statusCode: 400, message: 'Team name already exists in this tournament' };
            }
            // --- ATOMIC SLOT INCREMENT + REGISTRATION CREATE (Firestore Transaction) ---
            const newRegRef = firebase_admin_1.db.collection('registrations').doc();
            yield firebase_admin_1.db.runTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                // Re-read tournament inside the transaction to prevent race conditions
                const tSnap = yield transaction.get(tRef);
                if (!tSnap.exists) {
                    throw { statusCode: 404, message: 'Tournament not found inside transaction' };
                }
                const latestData = tSnap.data();
                const latestMax = latestData.maxSlots || 0;
                const latestCurrent = latestData.currentRegistrations || 0;
                if (latestMax > 0 && latestCurrent >= latestMax) {
                    throw { statusCode: 400, message: 'Tournament just became full — please try again' };
                }
                const regData = {
                    userId,
                    tournamentId,
                    teamName,
                    iglName,
                    iglContact,
                    playerNames,
                    playerIds: resolvedPlayerIds,
                    college: college || null,
                    game: resolvedGame || null,
                    qrIndex: null,
                    // Initial status per spec: INITIATED (not yet paid, no QR assigned)
                    paymentStatus: 'INITIATED',
                    createdAt: firebase_admin_1.default.firestore.Timestamp.now()
                };
                transaction.set(newRegRef, regData);
                transaction.update(tRef, {
                    currentRegistrations: firebase_admin_1.default.firestore.FieldValue.increment(1)
                });
            }));
            return { registrationId: newRegRef.id };
        });
    },
    // ==========================================================
    // STEP 9 — USER DASHBOARD STATUS
    // GET /api/registrations/user
    // Returns registrations with computed statusLabel
    // ==========================================================
    getUserRegistrations(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const snapshot = yield firebase_admin_1.db.collection('registrations')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();
            const result = [];
            for (const doc of snapshot.docs) {
                const regData = doc.data();
                // Join tournament details
                const tDoc = yield firebase_admin_1.db.collection('tournaments').doc(regData.tournamentId).get();
                // Join latest payment document
                const pSnap = yield firebase_admin_1.db.collection('payments')
                    .where('registrationId', '==', doc.id)
                    .orderBy('submittedAt', 'desc')
                    .limit(1)
                    .get();
                let payment = null;
                if (!pSnap.empty) {
                    payment = Object.assign({ id: pSnap.docs[0].id }, pSnap.docs[0].data());
                }
                result.push(Object.assign(Object.assign({ id: doc.id }, regData), { 
                    // Computed status label for UI display
                    statusLabel: getStatusLabel(regData.paymentStatus), tournament: tDoc.exists ? Object.assign({ id: tDoc.id }, tDoc.data()) : null, payment }));
            }
            return result;
        });
    },
    // ==========================================================
    // STEP 10 — ADMIN VIEW REGISTRATIONS
    // GET /api/admin/registrations
    // Returns full team + IGL + payment details for admin panel
    // ==========================================================
    getAllRegistrations() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            const snapshot = yield firebase_admin_1.db.collection('registrations')
                .orderBy('createdAt', 'desc')
                .get();
            const result = [];
            for (const doc of snapshot.docs) {
                const regData = doc.data();
                // Join user info
                const uDoc = yield firebase_admin_1.db.collection('users').doc(regData.userId).get();
                // Join tournament info
                const tDoc = yield firebase_admin_1.db.collection('tournaments').doc(regData.tournamentId).get();
                // Join payment document (most recent submission)
                const pSnap = yield firebase_admin_1.db.collection('payments')
                    .where('registrationId', '==', doc.id)
                    .orderBy('submittedAt', 'desc')
                    .limit(1)
                    .get();
                let paymentDetails = null;
                if (!pSnap.empty) {
                    const pd = pSnap.docs[0].data();
                    paymentDetails = {
                        paymentId: pSnap.docs[0].id,
                        transactionId: pd.transactionId,
                        upiId: pd.upiId,
                        bankName: pd.bankName,
                        paymentDate: pd.paymentDate,
                        paymentTime: pd.paymentTime,
                        qrIndex: pd.qrIndex,
                        status: pd.status,
                        submittedAt: pd.submittedAt
                    };
                }
                result.push({
                    id: doc.id,
                    // Team details
                    teamName: regData.teamName,
                    // IGL info
                    iglName: regData.iglName,
                    iglContact: regData.iglContact,
                    // Player details
                    playerNames: regData.playerNames,
                    playerIds: regData.playerIds,
                    // Game / College
                    game: regData.game,
                    college: regData.college,
                    // QR index used
                    qrIndex: regData.qrIndex,
                    // Payment status
                    paymentStatus: regData.paymentStatus,
                    statusLabel: getStatusLabel(regData.paymentStatus),
                    // Timestamps
                    createdAt: regData.createdAt,
                    verifiedAt: regData.verifiedAt || null,
                    verifiedBy: regData.verifiedBy || null,
                    // Joined data
                    user: uDoc.exists
                        ? { username: (_a = uDoc.data()) === null || _a === void 0 ? void 0 : _a.username, email: (_b = uDoc.data()) === null || _b === void 0 ? void 0 : _b.email }
                        : null,
                    tournament: tDoc.exists
                        ? { id: tDoc.id, name: (_c = tDoc.data()) === null || _c === void 0 ? void 0 : _c.name, entryFee: (_e = (_d = tDoc.data()) === null || _d === void 0 ? void 0 : _d.entryFee) !== null && _e !== void 0 ? _e : (_f = tDoc.data()) === null || _f === void 0 ? void 0 : _f.paymentAmount }
                        : null,
                    // Full payment info submitted by user
                    payment: paymentDetails
                });
            }
            return result;
        });
    },
    // ============================================================
    // COMBINED ATOMIC: Register + QR + Payment (NEW FLOW)
    // POST /api/registrations/complete-with-payment
    //
    // Called ONLY after the user scans the QR and fills in their
    // payment proof. Nothing is written to Firestore before this.
    // All three writes (registration, QR rotation, payment doc)
    // happen inside a single Firestore transaction.
    // ============================================================
    completeWithPayment(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const { tournamentId, teamName, iglName, iglContact, playerNames, playerIds, college, game, transactionId, upiId, bankName, paymentDate, paymentTime } = data;
            // ── Field validation ─────────────────────────────────────────
            if (!tournamentId || !teamName || !iglName || !iglContact) {
                throw { statusCode: 400, message: 'Missing required fields: tournamentId, teamName, iglName, iglContact' };
            }
            if (!Array.isArray(playerNames) || playerNames.length < 4) {
                throw { statusCode: 400, message: 'playerNames must be an array with at least 4 players' };
            }
            if (!transactionId || !paymentDate) {
                throw { statusCode: 400, message: 'Missing payment proof: transactionId and paymentDate are required' };
            }
            if (String(iglContact).trim().length < 3) {
                throw { statusCode: 400, message: 'iglContact must be a valid phone or Discord handle (min 3 chars)' };
            }
            const resolvedPlayerIds = Array.isArray(playerIds) && playerIds.length === playerNames.length
                ? playerIds
                : playerNames.map(() => '');
            // ── Pre-transaction read: tournament + college + game ───────────
            const tRef = firebase_admin_1.db.collection('tournaments').doc(tournamentId);
            const tDoc = yield tRef.get();
            if (!tDoc.exists)
                throw { statusCode: 404, message: 'Tournament not found' };
            const tData = tDoc.data();
            if ((tData.status || '').toUpperCase() !== 'ACTIVE') {
                throw { statusCode: 400, message: 'Tournament is not active' };
            }
            const maxSlots = tData.maxSlots || 0;
            const current = tData.currentRegistrations || 0;
            if (maxSlots > 0 && current >= maxSlots) {
                throw { statusCode: 400, message: 'Tournament is full — no slots available' };
            }
            // College restriction
            if (tData.collegesRestricted) {
                const allowedColleges = tData.allowedColleges || [];
                if (allowedColleges.length > 0) {
                    if (!college)
                        throw { statusCode: 400, message: 'This tournament requires a college selection' };
                    const isValid = allowedColleges.some((c) => c.name === college);
                    if (!isValid)
                        throw { statusCode: 400, message: `College "${college}" is not allowed` };
                }
            }
            // Game restriction
            const supportedGames = tData.supportedGames || [];
            let resolvedGame = game;
            if (supportedGames.length === 1) {
                resolvedGame = supportedGames[0].name;
            }
            else if (supportedGames.length > 1) {
                if (!game)
                    throw { statusCode: 400, message: 'This tournament requires a game selection' };
                const isValid = supportedGames.some((g) => g.name === game);
                if (!isValid)
                    throw { statusCode: 400, message: `Game "${game}" is not supported` };
            }
            // ── Duplicate team name ───────────────────────────────────
            const dupTeamSnap = yield firebase_admin_1.db.collection('registrations')
                .where('tournamentId', '==', tournamentId)
                .where('teamName', '==', teamName)
                .get();
            if (!dupTeamSnap.empty)
                throw { statusCode: 400, message: 'Team name already taken in this tournament' };
            // Prevent same user registering twice for the same tournament
            const dupUserSnap = yield firebase_admin_1.db.collection('registrations')
                .where('tournamentId', '==', tournamentId)
                .where('userId', '==', userId)
                .get();
            if (!dupUserSnap.empty)
                throw { statusCode: 400, message: 'You are already registered for this tournament' };
            // ── Duplicate transaction ID ──────────────────────────────
            const dupTxnSnap = yield firebase_admin_1.db.collection('payments')
                .where('transactionId', '==', transactionId)
                .limit(1).get();
            if (!dupTxnSnap.empty)
                throw { statusCode: 400, message: 'Duplicate transaction ID — already submitted' };
            const amount = (_b = (_a = tData.entryFee) !== null && _a !== void 0 ? _a : tData.paymentAmount) !== null && _b !== void 0 ? _b : 0;
            const submittedAt = firebase_admin_1.default.firestore.Timestamp.now();
            const newRegRef = firebase_admin_1.db.collection('registrations').doc();
            let assignedQrIndex = 0;
            // ── ATOMIC TRANSACTION: slot increment + QR rotation + single doc write ──
            yield firebase_admin_1.db.runTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c;
                const tSnap = yield transaction.get(tRef);
                const latest = tSnap.data();
                if ((latest.maxSlots || 0) > 0 && (latest.currentRegistrations || 0) >= (latest.maxSlots || 0)) {
                    throw { statusCode: 400, message: 'Tournament just became full — please try again' };
                }
                const sysRef = firebase_admin_1.db.collection('system_settings').doc('qr_rotation');
                const sysSnap = yield transaction.get(sysRef);
                if (!sysSnap.exists)
                    throw { statusCode: 500, message: 'QR rotation settings not found — contact admin' };
                const sysData = sysSnap.data();
                const currentIndex = (_a = sysData.currentIndex) !== null && _a !== void 0 ? _a : 0;
                const totalQRs = (_b = sysData.totalQRs) !== null && _b !== void 0 ? _b : 5;
                const nextIndex = (currentIndex + 1) >= totalQRs ? 0 : currentIndex + 1;
                const qrSnap = yield transaction.get(firebase_admin_1.db.collection('qr_codes').doc(String(currentIndex)));
                if (!qrSnap.exists || !((_c = qrSnap.data()) === null || _c === void 0 ? void 0 : _c.isActive)) {
                    throw { statusCode: 500, message: `QR at index ${currentIndex} is inactive — contact admin` };
                }
                assignedQrIndex = currentIndex;
                transaction.update(tRef, { currentRegistrations: firebase_admin_1.default.firestore.FieldValue.increment(1) });
                transaction.update(sysRef, { currentIndex: nextIndex, lastUpdated: firebase_admin_1.default.firestore.Timestamp.now() });
                transaction.update(firebase_admin_1.db.collection('qr_codes').doc(String(currentIndex)), {
                    usageCount: firebase_admin_1.default.firestore.FieldValue.increment(1),
                    lastUsedAt: firebase_admin_1.default.firestore.Timestamp.now()
                });
                // ── ONE registration document — contains all squad + payment data ──
                transaction.set(newRegRef, {
                    // Identity
                    userId,
                    tournamentId,
                    // Squad
                    teamName,
                    iglName,
                    iglContact,
                    playerNames,
                    playerIds: resolvedPlayerIds,
                    // Tournament extras
                    college: college || null,
                    game: resolvedGame || null,
                    // QR slot
                    qrIndex: assignedQrIndex,
                    // Payment status flags
                    paymentStatus: 'PENDING',
                    paymentVerified: false,
                    // Embedded payment proof — no separate payments collection
                    payment: {
                        transactionId,
                        upiId: upiId || null,
                        bankName: bankName || null,
                        paymentDate,
                        paymentTime: paymentTime || null,
                        amount,
                        submittedAt
                    },
                    // Timestamps
                    createdAt: submittedAt,
                    submittedAt,
                    verifiedAt: null,
                    verifiedBy: null
                });
            }));
            return {
                registrationId: newRegRef.id,
                qrIndex: assignedQrIndex,
                message: 'Registration complete — payment submitted and awaiting admin verification'
            };
        });
    }
};
