import admin, { db } from '../../config/firebase.admin';

// ============================================================
// HELPER — compute human-readable statusLabel from paymentStatus
// ============================================================
function getStatusLabel(paymentStatus: string): string {
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
function isValidPhone(phone: string): boolean {
    return /^[6-9]\d{9}$/.test(phone);
}

export const registrationService = {

    // ==========================================================
    // STEP 5 — TEAM FORM VALIDATION + REGISTRATION CREATE
    // POST /api/registrations/create
    // ==========================================================
    async createRegistration(userId: string, data: any) {
        const {
            tournamentId,
            teamName,
            iglName,
            iglContact,
            playerNames,
            playerIds,
            college,
            game
        } = data;

        // --- Field presence validation ---
        if (!tournamentId || !teamName || !iglName || !iglContact) {
            throw { statusCode: 400, message: 'Missing required fields: tournamentId, teamName, iglName, iglContact' };
        }

        if (!Array.isArray(playerNames) || playerNames.length < 4) {
            throw { statusCode: 400, message: 'playerNames must be an array with at least 4 players' };
        }

        // playerIds is optional — auto-fill empty strings if not provided by the frontend
        const resolvedPlayerIds: string[] = Array.isArray(playerIds) && playerIds.length === playerNames.length
            ? playerIds
            : playerNames.map(() => '');

        // --- Contact validation (phone or Discord handle — must not be empty) ---
        if (!iglContact || String(iglContact).trim().length < 3) {
            throw { statusCode: 400, message: 'iglContact must be a valid phone number or Discord handle (min 3 characters)' };
        }

        // --- STEP 2 — TOURNAMENT VALIDATION ---
        const tRef = db.collection('tournaments').doc(tournamentId);
        const tDoc = await tRef.get();

        if (!tDoc.exists) {
            throw { statusCode: 404, message: 'Tournament not found' };
        }

        const tournamentData = tDoc.data()!;

        if ((tournamentData.status || '').toUpperCase() !== 'ACTIVE') {
            throw { statusCode: 400, message: 'Tournament is not active' };
        }

        const maxSlots: number = tournamentData.maxSlots || 0;
        const currentRegistrations: number = tournamentData.currentRegistrations || 0;

        // Slot check (only enforced when maxSlots > 0)
        if (maxSlots > 0 && currentRegistrations >= maxSlots) {
            throw { statusCode: 400, message: 'Tournament is full — no slots available' };
        }

        // --- STEP 3 — COLLEGE VALIDATION ---
        if (tournamentData.collegesRestricted) {
            const allowedColleges: any[] = tournamentData.allowedColleges || [];
            if (allowedColleges.length > 0) {
                if (!college) {
                    throw { statusCode: 400, message: 'This tournament requires a college selection' };
                }
                const isValid = allowedColleges.some((c: any) => c.name === college);
                if (!isValid) {
                    throw { statusCode: 400, message: `College "${college}" is not allowed for this tournament` };
                }
            }
        }

        // --- STEP 4 — GAME VALIDATION ---
        const supportedGames: any[] = tournamentData.supportedGames || [];
        let resolvedGame = game;

        if (supportedGames.length === 1) {
            // Single-game tournament — assign automatically
            resolvedGame = supportedGames[0].name;
        } else if (supportedGames.length > 1) {
            if (!game) {
                throw { statusCode: 400, message: 'This tournament requires a game selection' };
            }
            const isValid = supportedGames.some((g: any) => g.name === game);
            if (!isValid) {
                throw { statusCode: 400, message: `Game "${game}" is not supported by this tournament` };
            }
        }

        // --- Duplicate team name check ---
        const duplicateSnap = await db.collection('registrations')
            .where('tournamentId', '==', tournamentId)
            .where('teamName', '==', teamName)
            .get();

        if (!duplicateSnap.empty) {
            throw { statusCode: 400, message: 'Team name already exists in this tournament' };
        }

        // --- ATOMIC SLOT INCREMENT + REGISTRATION CREATE (Firestore Transaction) ---
        const newRegRef = db.collection('registrations').doc();

        await db.runTransaction(async (transaction) => {
            // Re-read tournament inside the transaction to prevent race conditions
            const tSnap = await transaction.get(tRef);
            if (!tSnap.exists) {
                throw { statusCode: 404, message: 'Tournament not found inside transaction' };
            }

            const latestData = tSnap.data()!;
            const latestMax: number = latestData.maxSlots || 0;
            const latestCurrent: number = latestData.currentRegistrations || 0;

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
                createdAt: admin.firestore.Timestamp.now()
            };

            transaction.set(newRegRef, regData);
            transaction.update(tRef, {
                currentRegistrations: admin.firestore.FieldValue.increment(1)
            });
        });

        return { registrationId: newRegRef.id };
    },

    // ==========================================================
    // STEP 9 — USER DASHBOARD STATUS
    // GET /api/registrations/user
    // Returns registrations with computed statusLabel
    // ==========================================================
    async getUserRegistrations(userId: string) {
        const snapshot = await db.collection('registrations')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        const result = [];

        for (const doc of snapshot.docs) {
            const regData = doc.data();

            // Join tournament details
            const tDoc = await db.collection('tournaments').doc(regData.tournamentId).get();

            // Join latest payment document
            const pSnap = await db.collection('payments')
                .where('registrationId', '==', doc.id)
                .orderBy('submittedAt', 'desc')
                .limit(1)
                .get();

            let payment = null;
            if (!pSnap.empty) {
                payment = { id: pSnap.docs[0].id, ...pSnap.docs[0].data() };
            }

            result.push({
                id: doc.id,
                ...regData,
                // Computed status label for UI display
                statusLabel: getStatusLabel(regData.paymentStatus),
                tournament: tDoc.exists ? { id: tDoc.id, ...tDoc.data() } : null,
                payment
            });
        }

        return result;
    },

    // ==========================================================
    // STEP 10 — ADMIN VIEW REGISTRATIONS
    // GET /api/admin/registrations
    // Returns full team + IGL + payment details for admin panel
    // ==========================================================
    async getAllRegistrations() {
        const snapshot = await db.collection('registrations')
            .orderBy('createdAt', 'desc')
            .get();

        const result = [];

        for (const doc of snapshot.docs) {
            const regData = doc.data();

            // Join user info
            const uDoc = await db.collection('users').doc(regData.userId).get();

            // Join tournament info
            const tDoc = await db.collection('tournaments').doc(regData.tournamentId).get();

            // Join payment document (most recent submission)
            const pSnap = await db.collection('payments')
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
                    ? { username: uDoc.data()?.username, email: uDoc.data()?.email }
                    : null,
                tournament: tDoc.exists
                    ? { id: tDoc.id, name: tDoc.data()?.name, entryFee: tDoc.data()?.entryFee ?? tDoc.data()?.paymentAmount }
                    : null,
                // Full payment info submitted by user
                payment: paymentDetails
            });
        }

        return result;
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
    async completeWithPayment(userId: string, data: any) {
        const {
            tournamentId, teamName, iglName, iglContact,
            playerNames, playerIds, college, game,
            transactionId, upiId, bankName, paymentDate, paymentTime
        } = data;

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

        const resolvedPlayerIds: string[] =
            Array.isArray(playerIds) && playerIds.length === playerNames.length
                ? playerIds
                : playerNames.map(() => '');

        // ── Pre-transaction read: tournament + college + game ───────────
        const tRef = db.collection('tournaments').doc(tournamentId);
        const tDoc = await tRef.get();
        if (!tDoc.exists) throw { statusCode: 404, message: 'Tournament not found' };

        const tData = tDoc.data()!;
        if ((tData.status || '').toUpperCase() !== 'ACTIVE') {
            throw { statusCode: 400, message: 'Tournament is not active' };
        }

        const maxSlots: number = tData.maxSlots || 0;
        const current: number = tData.currentRegistrations || 0;
        if (maxSlots > 0 && current >= maxSlots) {
            throw { statusCode: 400, message: 'Tournament is full — no slots available' };
        }

        // College restriction
        if (tData.collegesRestricted) {
            const allowedColleges: any[] = tData.allowedColleges || [];
            if (allowedColleges.length > 0) {
                if (!college) throw { statusCode: 400, message: 'This tournament requires a college selection' };
                const isValid = allowedColleges.some((c: any) => c.name === college);
                if (!isValid) throw { statusCode: 400, message: `College "${college}" is not allowed` };
            }
        }

        // Game restriction
        const supportedGames: any[] = tData.supportedGames || [];
        let resolvedGame = game;
        if (supportedGames.length === 1) {
            resolvedGame = supportedGames[0].name;
        } else if (supportedGames.length > 1) {
            if (!game) throw { statusCode: 400, message: 'This tournament requires a game selection' };
            const isValid = supportedGames.some((g: any) => g.name === game);
            if (!isValid) throw { statusCode: 400, message: `Game "${game}" is not supported` };
        }

        // ── Duplicate team name ───────────────────────────────────
        const dupTeamSnap = await db.collection('registrations')
            .where('tournamentId', '==', tournamentId)
            .where('teamName', '==', teamName)
            .get();
        if (!dupTeamSnap.empty) throw { statusCode: 400, message: 'Team name already taken in this tournament' };

        // Prevent same user registering twice for the same tournament
        const dupUserSnap = await db.collection('registrations')
            .where('tournamentId', '==', tournamentId)
            .where('userId', '==', userId)
            .get();
        if (!dupUserSnap.empty) throw { statusCode: 400, message: 'You are already registered for this tournament' };

        // ── Duplicate transaction ID ──────────────────────────────
        const dupTxnSnap = await db.collection('payments')
            .where('transactionId', '==', transactionId)
            .limit(1).get();
        if (!dupTxnSnap.empty) throw { statusCode: 400, message: 'Duplicate transaction ID — already submitted' };

        const amount: number = tData.entryFee ?? tData.paymentAmount ?? 0;
        const submittedAt = admin.firestore.Timestamp.now();
        const newRegRef = db.collection('registrations').doc();
        let assignedQrIndex = 0;

        // ── ATOMIC TRANSACTION: slot increment + QR rotation + single doc write ──
        await db.runTransaction(async (transaction) => {
            const tSnap = await transaction.get(tRef);
            const latest = tSnap.data()!;
            if ((latest.maxSlots || 0) > 0 && (latest.currentRegistrations || 0) >= (latest.maxSlots || 0)) {
                throw { statusCode: 400, message: 'Tournament just became full — please try again' };
            }

            const sysRef = db.collection('system_settings').doc('qr_rotation');
            const sysSnap = await transaction.get(sysRef);
            if (!sysSnap.exists) throw { statusCode: 500, message: 'QR rotation settings not found — contact admin' };

            const sysData = sysSnap.data()!;
            const currentIndex = sysData.currentIndex as number ?? 0;
            const totalQRs = sysData.totalQRs as number ?? 5;
            const nextIndex = (currentIndex + 1) >= totalQRs ? 0 : currentIndex + 1;

            const qrSnap = await transaction.get(db.collection('qr_codes').doc(String(currentIndex)));
            if (!qrSnap.exists || !qrSnap.data()?.isActive) {
                throw { statusCode: 500, message: `QR at index ${currentIndex} is inactive — contact admin` };
            }

            assignedQrIndex = currentIndex;

            transaction.update(tRef, { currentRegistrations: admin.firestore.FieldValue.increment(1) });
            transaction.update(sysRef, { currentIndex: nextIndex, lastUpdated: admin.firestore.Timestamp.now() });
            transaction.update(db.collection('qr_codes').doc(String(currentIndex)), {
                usageCount: admin.firestore.FieldValue.increment(1),
                lastUsedAt: admin.firestore.Timestamp.now()
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
        });

        return {
            registrationId: newRegRef.id,
            qrIndex: assignedQrIndex,
            message: 'Registration complete — payment submitted and awaiting admin verification'
        };
    }
};
