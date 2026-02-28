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
        // Removed orderBy('createdAt', 'desc') because Firestore excludes documents without this field
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
                createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) : null,
                _count: { registrations: regSnapshot.size }
            });
        }

        // Sort locally
        result.sort((a, b) => {
            if (!a.createdAt) return 1;
            if (!b.createdAt) return -1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

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
    },

    async updateUserRole(userId: string, role: string) {
        const userRef = db.collection('users').doc(userId);
        const doc = await userRef.get();
        if (!doc.exists) {
            throw new Error('User not found');
        }
        await userRef.update({ role });
        // NOTE: we don't strictly need to update custom claims here if we rely on DB role checks, 
        // but if we used Firebase auth custom claims we would do adminAuth.setCustomUserClaims(userId, { admin: role === 'ADMIN' })
        return { success: true, message: `User role updated to ${role}`, role };
    },

    async verifyRegistrationPayment(adminId: string, registrationId: string) {
        const regRef = db.collection('registrations').doc(registrationId);
        const regDoc = await regRef.get();

        if (!regDoc.exists) {
            throw { statusCode: 404, message: 'Registration not found' };
        }

        const regData = regDoc.data()!;
        if (regData.paymentStatus === 'VERIFIED') {
            throw { statusCode: 400, message: 'Payment is already verified' };
        }

        const batch = db.batch();

        batch.update(regRef, {
            paymentStatus: 'VERIFIED',
            paymentVerified: true,
            verifiedAt: new Date().toISOString(),
            verifiedByAdminId: adminId
        });

        // Also update the linked payments collection if it exists
        const paymentSnapshot = await db.collection('payments').where('registrationId', '==', registrationId).where('status', '==', 'PENDING').get();
        paymentSnapshot.forEach(doc => {
            batch.update(doc.ref, {
                status: 'VERIFIED',
                verifiedAt: new Date().toISOString(),
                verifiedByAdminId: adminId
            });
        });

        await batch.commit();

        return { success: true, message: `Registration ${registrationId} payment verified.` };
    }
};
