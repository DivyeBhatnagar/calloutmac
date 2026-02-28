import { db } from '../config/firebase.admin';

/**
 * Script to set up admin user
 * Run with: npx ts-node src/utils/setupAdmin.ts
 */

const ADMIN_EMAIL = 'divyebhatnagar784@gmail.com';

async function setupAdmin() {
    try {
        // Find user by email
        const usersSnapshot = await db.collection('users')
            .where('email', '==', ADMIN_EMAIL)
            .get();

        if (usersSnapshot.empty) {
            console.log(`User with email ${ADMIN_EMAIL} not found.`);
            console.log('Please register this user first, then run this script again.');
            return;
        }

        const userDoc = usersSnapshot.docs[0];
        
        // Update user role to ADMIN
        await db.collection('users').doc(userDoc.id).update({
            role: 'ADMIN',
            updatedAt: new Date().toISOString()
        });

        console.log(`✅ Successfully set ${ADMIN_EMAIL} as ADMIN`);
        console.log(`User ID: ${userDoc.id}`);
        
    } catch (error) {
        console.error('Error setting up admin:', error);
    }
}

setupAdmin();
