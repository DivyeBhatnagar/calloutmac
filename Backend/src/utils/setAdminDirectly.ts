import { db, adminAuth } from '../config/firebase.admin';

/**
 * Direct script to set admin role
 * Run with: npx ts-node src/utils/setAdminDirectly.ts
 */

const ADMIN_EMAIL = 'divyebhatnagar784@gmail.com';

async function setAdminDirectly() {
    try {
        console.log('🔍 Searching for user with email:', ADMIN_EMAIL);
        
        // Method 1: Find by email in Firestore
        const usersSnapshot = await db.collection('users')
            .where('email', '==', ADMIN_EMAIL)
            .get();

        if (!usersSnapshot.empty) {
            const userDoc = usersSnapshot.docs[0];
            console.log('✅ Found user in Firestore:', userDoc.id);
            console.log('Current data:', userDoc.data());
            
            // Update role
            await db.collection('users').doc(userDoc.id).update({
                role: 'ADMIN',
                updatedAt: new Date().toISOString()
            });
            
            console.log('✅ Successfully updated user role to ADMIN in Firestore');
            
            // Verify update
            const updatedDoc = await db.collection('users').doc(userDoc.id).get();
            console.log('Updated data:', updatedDoc.data());
        } else {
            console.log('❌ User not found in Firestore');
            console.log('Trying to find in Firebase Auth...');
            
            // Method 2: Try Firebase Auth
            try {
                const userRecord = await adminAuth.getUserByEmail(ADMIN_EMAIL);
                console.log('✅ Found user in Firebase Auth:', userRecord.uid);
                
                // Create/Update Firestore document
                await db.collection('users').doc(userRecord.uid).set({
                    email: ADMIN_EMAIL,
                    username: userRecord.displayName || 'Admin User',
                    role: 'ADMIN',
                    phoneNumber: userRecord.phoneNumber || '',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }, { merge: true });
                
                console.log('✅ Created/Updated Firestore document with ADMIN role');
            } catch (authError) {
                console.error('❌ User not found in Firebase Auth either');
                console.error('Please make sure the user has registered first');
            }
        }
        
        console.log('\n📋 All users in Firestore:');
        const allUsers = await db.collection('users').get();
        allUsers.forEach(doc => {
            const data = doc.data();
            console.log(`- ${data.email} (${data.role}) - ID: ${doc.id}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
    
    process.exit(0);
}

setAdminDirectly();
