import { db } from '../../config/firebase.admin';

export const userService = {
    async getDashboardStats(userId: string) {
        const registrationsSnapshot = await db.collection('registrations').where('userId', '==', userId).get();

        let activeRegistrations = 0;
        let completedTournaments = 0;
        const totalTournamentsJoined = registrationsSnapshot.size;

        for (const doc of registrationsSnapshot.docs) {
            const reg = doc.data();
            const tSnapshot = await db.collection('tournaments').doc(reg.tournamentId).get();
            if (tSnapshot.exists) {
                const tData = tSnapshot.data();
                if (tData?.status?.toLowerCase() === 'active') activeRegistrations++;
                if (tData?.status?.toLowerCase() === 'closed') completedTournaments++;
            }
        }

        const totalWinnings = 0;

        return {
            totalTournamentsJoined,
            activeRegistrations,
            completedTournaments,
            totalWinnings
        };
    },

    async getUserTournaments(userId: string) {
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

    async updateProfile(userId: string, data: any) {
        const { phoneNumber } = data;
        const updateData: any = {};
        if (phoneNumber) updateData.phoneNumber = phoneNumber;

        await db.collection('users').doc(userId).update(updateData);

        const userDoc = await db.collection('users').doc(userId).get();
        return { id: userDoc.id, ...userDoc.data() };
    },

    async submitQuery(userId: string, data: any) {
        const { subject, message, category } = data;

        const newQueryRef = db.collection('queries').doc();

        const queryData = {
            userId,
            subject,
            message,
            category,
            status: 'PENDING',
            adminResponse: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await newQueryRef.set(queryData);

        return { id: newQueryRef.id, ...queryData };
    },

    async getUserQueries(userId: string) {
        const snapshot = await db.collection('queries')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
};
