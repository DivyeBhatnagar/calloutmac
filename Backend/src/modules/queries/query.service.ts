import { db } from '../../config/firebase.admin';

export const queryService = {
    async getAllQueries() {
        const snapshot = await db.collection('queries').orderBy('createdAt', 'desc').get();
        const result = [];

        for (const doc of snapshot.docs) {
            const data = doc.data();
            const uDoc = await db.collection('users').doc(data.userId).get();

            result.push({
                id: doc.id,
                ...data,
                user: uDoc.exists ? { username: uDoc.data()?.username, email: uDoc.data()?.email } : null
            });
        }

        return result;
    },

    async respondToQuery(queryId: string, adminResponse: string) {
        if (!adminResponse) {
            throw { statusCode: 400, message: 'Response message is required' };
        }

        const docRef = db.collection('queries').doc(queryId);

        await docRef.update({
            adminResponse,
            status: 'RESOLVED',
            updatedAt: new Date().toISOString()
        });

        const updated = await docRef.get();
        return { id: updated.id, ...updated.data() };
    }
};
