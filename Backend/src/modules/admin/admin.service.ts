import { db, adminAuth } from '../../config/firebase.admin';
import admin from '../../config/firebase.admin';

export const adminService = {

    // ============================================================
    // Admin stats — revenue now read from embedded payment.amount
    // inside registrations (no separate payments collection)
    // ============================================================
    async getAdminStats() {
        const usersSnapshot = await db.collection('users').get();
        const tournamentsSnapshot = await db.collection('tournaments').get();
        const activeTournamentsSnapshot = await db.collection('tournaments').where('status', '==', 'active').get();
        const registrationsSnapshot = await db.collection('registrations').get();

        let totalRevenue = 0;
        registrationsSnapshot.forEach(doc => {
            const d = doc.data();
            if (d.paymentStatus === 'VERIFIED' && d.payment?.amount) {
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
    },

    async getAllUsers() {
        const usersSnapshot = await db.collection('users').get();
        const result = [];

        for (const doc of usersSnapshot.docs) {
            const data = doc.data();
            const regSnapshot = await db.collection('registrations').where('userId', '==', doc.id).get();

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
            if (!a.createdAt) return 1;
            if (!b.createdAt) return -1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        return result;
    },

    async deleteUser(userId: string) {
        try {
            await adminAuth.deleteUser(userId);
        } catch (e) {
            console.warn('User already deleted from auth or failed auth deletion', e);
        }

        const queriesSnapshot = await db.collection('queries').where('userId', '==', userId).get();
        const regSnapshot = await db.collection('registrations').where('userId', '==', userId).get();

        const batch = db.batch();
        queriesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
        regSnapshot.docs.forEach(doc => batch.delete(doc.ref));
        batch.delete(db.collection('users').doc(userId));
        await batch.commit();

        return { success: true, message: `User ${userId} deleted` };
    },

    async updateUserRole(userId: string, role: string) {
        const userRef = db.collection('users').doc(userId);
        const doc = await userRef.get();
        if (!doc.exists) throw { statusCode: 404, message: 'User not found' };
        await userRef.update({ role });
        return { success: true, message: `User role updated to ${role}`, role };
    },

    // ============================================================
    // ADMIN: GET ALL REGISTRATIONS
    // Reads payment details from embedded payment sub-object
    // inside each registration doc (no payments collection join).
    // ============================================================
    async getAllRegistrations() {
        const snapshot = await db.collection('registrations')
            .orderBy('createdAt', 'desc')
            .get();

        const result = [];

        for (const doc of snapshot.docs) {
            const r = doc.data();

            const uDoc = await db.collection('users').doc(r.userId).get();
            const tDoc = await db.collection('tournaments').doc(r.tournamentId).get();

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
                user: uDoc.exists ? { username: uDoc.data()?.username, email: uDoc.data()?.email } : null,
                tournament: tDoc.exists ? { id: tDoc.id, name: tDoc.data()?.name } : null,
            });
        }

        return result;
    },

    // ============================================================
    // ADMIN: VERIFY PAYMENT
    // Updates paymentStatus + paymentVerified on the registration doc.
    // No separate payments collection update needed.
    // ============================================================
    async verifyRegistrationPayment(adminId: string, registrationId: string) {
        const regRef = db.collection('registrations').doc(registrationId);
        const regDoc = await regRef.get();

        if (!regDoc.exists) throw { statusCode: 404, message: 'Registration not found' };

        const regData = regDoc.data()!;

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

        await regRef.update({
            paymentStatus: 'VERIFIED',
            paymentVerified: true,
            verifiedAt,
            verifiedBy: adminId
        });

        const updatedDoc = await regRef.get();
        return { id: updatedDoc.id, ...updatedDoc.data() };
    },

    // ============================================================
    // ADMIN: EXPORT CSV
    // Full CSV with playerNames + playerIds side by side
    // ============================================================
    async exportRegistrationsCSV(tournamentId?: string) {
        let query: FirebaseFirestore.Query = db.collection('registrations');
        if (tournamentId) {
            query = query.where('tournamentId', '==', tournamentId);
        }

        const snapshot = await query.orderBy('createdAt', 'desc').get();
        const rows: string[] = [];

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
                r.qrIndex ?? '',
                r.paymentStatus || '',
                `"${(pay.transactionId || '').replace(/"/g, '""')}"`,
                `"${(pay.upiId || '').replace(/"/g, '""')}"`,
                `"${(pay.bankName || '').replace(/"/g, '""')}"`,
                pay.paymentDate || '',
                pay.paymentTime || '',
                pay.amount || '',
                r.verifiedAt || '',
                r.verifiedBy || '',
                r.createdAt?.toDate?.().toISOString?.() || r.createdAt || ''
            ].join(','));
        }

        return rows.join('\n');
    },

    // ============================================================
    // TOURNAMENT MANAGEMENT (REFACTORED)
    // ============================================================

    /**
     * Internal validation for tournament activation
     */
    _validateActivation(data: any) {
        if (!data.posterUrl) throw { statusCode: 400, message: 'Activation requires a tournament poster' };
        if (!data.supportedGames || data.supportedGames.length === 0) {
            throw { statusCode: 400, message: 'Activation requires at least one supported game' };
        }
        if (!data.registrationDeadline) throw { statusCode: 400, message: 'Registration deadline is required' };
        if (!data.startDate) throw { statusCode: 400, message: 'Start date is required' };

        const deadline = new Date(data.registrationDeadline).getTime();
        const start = new Date(data.startDate).getTime();

        if (start <= deadline) {
            throw { statusCode: 400, message: 'Tournament start date must be after the registration deadline' };
        }
    },

    /**
     * Basic metadata validation for any save/update
     */
    _validateBasicMetadata(data: any) {
        if (!data.name?.trim()) throw { statusCode: 400, message: 'Tournament name is required' };
        if (!data.description?.trim()) throw { statusCode: 400, message: 'Tournament description is required' };

        if (data.paymentAmount < 0) throw { statusCode: 400, message: 'Payment amount cannot be negative' };
        if (data.maxSlots < 0) throw { statusCode: 400, message: 'Max slots cannot be negative' };

        if (data.collegesRestricted && (!data.allowedColleges || data.allowedColleges.length === 0)) {
            throw { statusCode: 400, message: 'Restriction is ON but no colleges were added' };
        }

        if (data.startDate && data.endDate) {
            if (new Date(data.endDate).getTime() <= new Date(data.startDate).getTime()) {
                throw { statusCode: 400, message: 'End date must be after start date' };
            }
        }
    },

    async createTournament(adminId: string, data: any) {
        this._validateBasicMetadata(data);

        // If trying to create as ACTIVE, check activation rules
        if (data.status === 'ACTIVE') {
            this._validateActivation(data);
        }

        const newDoc = db.collection('tournaments').doc();
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
            registrationDeadline: data.registrationDeadline ? admin.firestore.Timestamp.fromDate(new Date(data.registrationDeadline)) : null,
            startDate: data.startDate ? admin.firestore.Timestamp.fromDate(new Date(data.startDate)) : null,
            endDate: data.endDate ? admin.firestore.Timestamp.fromDate(new Date(data.endDate)) : null,
            createdBy: adminId,
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now()
        };

        await newDoc.set(tournamentData);
        return { id: newDoc.id, ...tournamentData };
    },

    async updateTournament(id: string, data: any) {
        const tRef = db.collection('tournaments').doc(id);
        const tDoc = await tRef.get();
        if (!tDoc.exists) throw { statusCode: 404, message: 'Tournament not found' };

        const currentData = tDoc.data()!;
        const mergedData = { ...currentData, ...data };

        this._validateBasicMetadata(mergedData);

        // If status is changing to ACTIVE (or is already ACTIVE), validate
        if (mergedData.status === 'ACTIVE') {
            this._validateActivation(mergedData);
        }

        const updateData: any = {
            ...data,
            updatedAt: admin.firestore.Timestamp.now()
        };

        // Convert dates to Timestamps if provided
        if (data.registrationDeadline) updateData.registrationDeadline = admin.firestore.Timestamp.fromDate(new Date(data.registrationDeadline));
        if (data.startDate) updateData.startDate = admin.firestore.Timestamp.fromDate(new Date(data.startDate));
        if (data.endDate) updateData.endDate = admin.firestore.Timestamp.fromDate(new Date(data.endDate));

        await tRef.update(updateData);
        const updatedDoc = await tRef.get();
        return { id: updatedDoc.id, ...updatedDoc.data() };
    },

    async uploadTournamentPoster(id: string, file: any) {
        const tRef = db.collection('tournaments').doc(id);
        const tDoc = await tRef.get();
        if (!tDoc.exists) throw { statusCode: 404, message: 'Tournament not found' };

        const { StorageService } = require('../shared/storage.service');
        const url = await StorageService.uploadFile(file.buffer, 'posters', file.mimetype);

        await tRef.update({
            posterUrl: url,
            posterThumbnailUrl: url, // For now using same, could resize later
            updatedAt: admin.firestore.Timestamp.now()
        });

        return { url };
    },

    async uploadGameLogo(id: string, gameId: string, file: any) {
        const tRef = db.collection('tournaments').doc(id);
        const tDoc = await tRef.get();
        if (!tDoc.exists) throw { statusCode: 404, message: 'Tournament not found' };

        const data = tDoc.data()!;
        const games = data.supportedGames || [];
        const gameIndex = games.findIndex((g: any) => g.id === gameId);
        if (gameIndex === -1) throw { statusCode: 404, message: 'Game not found in this tournament' };

        const { StorageService } = require('../shared/storage.service');
        const url = await StorageService.uploadFile(file.buffer, 'games', file.mimetype);

        games[gameIndex].logoUrl = url;
        await tRef.update({
            supportedGames: games,
            updatedAt: admin.firestore.Timestamp.now()
        });

        return { url };
    },

    async uploadCollegeLogo(id: string, collegeId: string, file: any) {
        const tRef = db.collection('tournaments').doc(id);
        const tDoc = await tRef.get();
        if (!tDoc.exists) throw { statusCode: 404, message: 'Tournament not found' };

        const data = tDoc.data()!;
        const colleges = data.allowedColleges || [];
        const collegeIndex = colleges.findIndex((c: any) => c.id === collegeId);
        if (collegeIndex === -1) throw { statusCode: 404, message: 'College not found in this tournament' };

        const { StorageService } = require('../shared/storage.service');
        const url = await StorageService.uploadFile(file.buffer, 'colleges', file.mimetype);

        colleges[collegeIndex].logoUrl = url;
        await tRef.update({
            allowedColleges: colleges,
            updatedAt: admin.firestore.Timestamp.now()
        });

        return { url };
    }
};
