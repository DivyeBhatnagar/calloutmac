import admin, { db } from '../../config/firebase.admin';

export const registrationService = {
    async createRegistration(userId: string, data: any) {
        const { tournamentId, teamName, iglName, iglContact, playerNames, playerIds } = data;

        const tDoc = await db.collection('tournaments').doc(tournamentId).get();

        if (!tDoc.exists) {
            throw { statusCode: 404, message: 'Tournament not found' };
        }

        const tournamentData = tDoc.data();

        const status = (tournamentData?.status || '').toLowerCase();
        if (status !== 'active') {
            throw { statusCode: 400, message: 'Tournament is not active' };
        }

        const regCountSnapshot = await db.collection('registrations').where('tournamentId', '==', tournamentId).get();
        const maxSlots = tournamentData?.maxSlots || 0;

        // Only enforce limit if maxSlots is greater than 0
        if (maxSlots > 0 && regCountSnapshot.size >= maxSlots) {
            throw { statusCode: 400, message: 'Tournament is full' };
        }

        const duplicateSnapshot = await db.collection('registrations')
            .where('tournamentId', '==', tournamentId)
            .where('teamName', '==', teamName)
            .get();

        if (!duplicateSnapshot.empty) {
            throw { statusCode: 400, message: 'Team name already exists in this tournament' };
        }

        const newRegRef = db.collection('registrations').doc();
        const regData = {
            userId,
            tournamentId,
            teamName,
            iglName,
            iglContact,
            playerNames: playerNames || [],
            playerIds: playerIds || [],
            paymentStatus: 'PENDING',
            createdAt: new Date().toISOString()
        };

        const batch = db.batch();
        batch.set(newRegRef, regData);
        batch.update(tDoc.ref, { currentRegistrations: admin.firestore.FieldValue.increment(1) });
        await batch.commit();

        return { id: newRegRef.id, ...regData };
    },

    async getUserRegistrations(userId: string) {
        const snapshot = await db.collection('registrations').where('userId', '==', userId).get();
        const result = [];

        for (const doc of snapshot.docs) {
            const regData = doc.data();
            const tDoc = await db.collection('tournaments').doc(regData.tournamentId).get();
            const pSnapshot = await db.collection('payments').where('registrationId', '==', doc.id).get();

            let payment = null;
            if (!pSnapshot.empty) {
                payment = { id: pSnapshot.docs[0].id, ...pSnapshot.docs[0].data() };
            }

            result.push({
                id: doc.id,
                ...regData,
                tournament: tDoc.exists ? { id: tDoc.id, ...tDoc.data() } : null,
                payment
            });
        }

        return result;
    },

    async getAllRegistrations() {
        const snapshot = await db.collection('registrations').orderBy('createdAt', 'desc').get();
        const result = [];

        for (const doc of snapshot.docs) {
            const regData = doc.data();
            const uDoc = await db.collection('users').doc(regData.userId).get();
            const tDoc = await db.collection('tournaments').doc(regData.tournamentId).get();

            result.push({
                id: doc.id,
                ...regData,
                user: uDoc.exists ? { username: uDoc.data()?.username, email: uDoc.data()?.email } : null,
                tournament: tDoc.exists ? { name: tDoc.data()?.name } : null
            });
        }

        return result;
    },

    async verifyRegistration(registrationId: string) {
        await db.collection('registrations').doc(registrationId).update({ paymentStatus: 'VERIFIED' });
        const updated = await db.collection('registrations').doc(registrationId).get();
        return { id: updated.id, ...updated.data() };
    }
};
