import { db } from '../../config/firebase.admin';

export const tournamentService = {
    async getTournaments() {
        const snapshot = await db.collection('tournaments').orderBy('createdAt', 'desc').get();

        const tournaments = [];
        for (const doc of snapshot.docs) {
            const data = doc.data();
            const regSnapshot = await db.collection('registrations').where('tournamentId', '==', doc.id).get();
            tournaments.push({
                id: doc.id,
                ...data,
                _count: { registrations: regSnapshot.size }
            });
        }

        return tournaments;
    },

    async getTournamentById(id: string) {
        const doc = await db.collection('tournaments').doc(id).get();

        if (!doc.exists) {
            throw { statusCode: 404, message: 'Tournament not found' };
        }

        const regSnapshot = await db.collection('registrations').where('tournamentId', '==', id).get();

        return {
            id: doc.id,
            ...doc.data(),
            _count: { registrations: regSnapshot.size }
        };
    }
};
