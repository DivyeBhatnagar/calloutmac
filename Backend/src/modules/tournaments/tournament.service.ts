import { db } from '../../config/firebase.admin';

export const tournamentService = {

    async getTournaments() {
        const snapshot = await db.collection('tournaments').orderBy('createdAt', 'desc').get();

        const tournaments = [];
        for (const doc of snapshot.docs) {
            const data = doc.data();
            const regSnapshot = await db.collection('registrations')
                .where('tournamentId', '==', doc.id)
                .get();

            const maxSlots: number = data.maxSlots || 0;
            const currentRegistrations: number = data.currentRegistrations || regSnapshot.size;

            tournaments.push({
                id: doc.id,
                ...data,
                availableSlots: maxSlots > 0 ? Math.max(0, maxSlots - currentRegistrations) : null,
                _count: { registrations: regSnapshot.size }
            });
        }

        return tournaments;
    },

    // ============================================================
    // STEP 2 — TOURNAMENT VALIDATION
    // GET /api/tournaments/:id
    // Returns tournament with availableSlots, allowedColleges,
    // and supportedGames for frontend pre-flight checks.
    // ============================================================
    async getTournamentById(id: string) {
        const doc = await db.collection('tournaments').doc(id).get();

        if (!doc.exists) {
            throw { statusCode: 404, message: 'Tournament not found' };
        }

        const data = doc.data()!;
        const maxSlots: number = data.maxSlots || 0;
        const currentRegistrations: number = data.currentRegistrations || 0;
        const availableSlots: number | null = maxSlots > 0
            ? Math.max(0, maxSlots - currentRegistrations)
            : null;

        return {
            id: doc.id,
            ...data,
            // Computed fields for frontend pre-registration checks
            availableSlots,
            isFull: maxSlots > 0 && currentRegistrations >= maxSlots,
            allowedColleges: data.allowedColleges || [],
            supportedGames: data.supportedGames || []
        };
    }
};
