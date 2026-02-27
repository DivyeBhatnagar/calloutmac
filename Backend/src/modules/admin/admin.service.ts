import { db, adminAuth } from '../../config/firebase.admin';

export const adminService = {
    async getAdminStats() {
        const usersSnapshot = await db.collection('users').get();
        const tournamentsSnapshot = await db.collection('tournaments').get();
        const activeTournamentsSnapshot = await db.collection('tournaments').where('status', '==', 'ACTIVE').get();
        const registrationsSnapshot = await db.collection('registrations').get();

        const paymentsSnapshot = await db.collection('payments').where('status', '==', 'VERIFIED').get();

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
    },

    async getAllUsers() {
        const usersSnapshot = await db.collection('users').orderBy('createdAt', 'desc').get();
        const result = [];

        for (const doc of usersSnapshot.docs) {
            const data = doc.data();
            const regSnapshot = await db.collection('registrations').where('userId', '==', doc.id).get();

            result.push({
                id: doc.id,
                username: data.username,
                email: data.email,
                role: data.role,
                createdAt: data.createdAt,
                _count: { registrations: regSnapshot.size }
            });
        }

        return result;
    },

    async deleteUser(userId: string) {
        // Delete Firebase Auth User
        try {
            await adminAuth.deleteUser(userId);
        } catch (e) {
            console.warn("User already deleted from auth or failed auth deletion", e);
        }

        // Delete related records manually for simplified schema
        const queriesSnapshot = await db.collection('queries').where('userId', '==', userId).get();
        const regSnapshot = await db.collection('registrations').where('userId', '==', userId).get();

        const batch = db.batch();

        queriesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
        regSnapshot.docs.forEach(doc => batch.delete(doc.ref));

        // Deleting payments is harder without nested queries, skipping cascading payments in NoSQL for simplicity,
        // or we'd fetch all user's registrations, then fetch all payments for those registrations.

        batch.delete(db.collection('users').doc(userId));

        await batch.commit();

        return { success: true, message: `User ${userId} deleted` };
    }
};
