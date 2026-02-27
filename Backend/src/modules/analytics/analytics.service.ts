import { db } from '../../config/firebase.admin';

export const analyticsService = {
    async getRevenueAnalytics() {
        const paymentsSnapshot = await db.collection('payments').where('status', '==', 'VERIFIED').get();

        const revenueByMonth: Record<string, number> = {};

        paymentsSnapshot.forEach(doc => {
            const data = doc.data();
            // Ensure 'createdAt' is a string before calling substring
            const createdAt = data.createdAt ? String(data.createdAt) : new Date().toISOString();
            const month = createdAt.substring(0, 7);

            if (!revenueByMonth[month]) {
                revenueByMonth[month] = 0;
            }
            revenueByMonth[month] += (data.amount || 0);
        });

        return Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue }));
    },

    async getUserAnalytics() {
        const usersSnapshot = await db.collection('users').get();

        const usersByMonth: Record<string, number> = {};

        usersSnapshot.forEach(doc => {
            const data = doc.data();
            const createdAt = data.createdAt ? String(data.createdAt) : new Date().toISOString();
            const month = createdAt.substring(0, 7);

            if (!usersByMonth[month]) {
                usersByMonth[month] = 0;
            }
            usersByMonth[month] += 1;
        });

        return Object.entries(usersByMonth).map(([month, count]) => ({ month, count }));
    },

    async getTournamentAnalytics() {
        const tsSnapshot = await db.collection('tournaments').get();
        const result = [];

        for (const doc of tsSnapshot.docs) {
            const data = doc.data();
            const regSnapshot = await db.collection('registrations').where('tournamentId', '==', doc.id).get();

            const currentRegistrations = regSnapshot.size;
            const maxSlots = data.maxSlots || 1; // avoid division by zero

            result.push({
                tournamentId: doc.id,
                name: data.name,
                status: data.status,
                maxSlots: data.maxSlots,
                currentRegistrations,
                fillPercentage: Math.round((currentRegistrations / maxSlots) * 100)
            });
        }

        return result;
    }
};
