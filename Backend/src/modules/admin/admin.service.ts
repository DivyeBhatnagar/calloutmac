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
    }
};
