"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = require("../config/firebase.admin");
/**
 * Direct script to set admin role
 * Run with: npx ts-node src/utils/setAdminDirectly.ts
 */
const ADMIN_EMAIL = 'divyebhatnagar784@gmail.com';
function setAdminDirectly() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('🔍 Searching for user with email:', ADMIN_EMAIL);
            // Method 1: Find by email in Firestore
            const usersSnapshot = yield firebase_admin_1.db.collection('users')
                .where('email', '==', ADMIN_EMAIL)
                .get();
            if (!usersSnapshot.empty) {
                const userDoc = usersSnapshot.docs[0];
                console.log('✅ Found user in Firestore:', userDoc.id);
                console.log('Current data:', userDoc.data());
                // Update role
                yield firebase_admin_1.db.collection('users').doc(userDoc.id).update({
                    role: 'ADMIN',
                    updatedAt: new Date().toISOString()
                });
                console.log('✅ Successfully updated user role to ADMIN in Firestore');
                // Verify update
                const updatedDoc = yield firebase_admin_1.db.collection('users').doc(userDoc.id).get();
                console.log('Updated data:', updatedDoc.data());
            }
            else {
                console.log('❌ User not found in Firestore');
                console.log('Trying to find in Firebase Auth...');
                // Method 2: Try Firebase Auth
                try {
                    const userRecord = yield firebase_admin_1.adminAuth.getUserByEmail(ADMIN_EMAIL);
                    console.log('✅ Found user in Firebase Auth:', userRecord.uid);
                    // Create/Update Firestore document
                    yield firebase_admin_1.db.collection('users').doc(userRecord.uid).set({
                        email: ADMIN_EMAIL,
                        username: userRecord.displayName || 'Admin User',
                        role: 'ADMIN',
                        phoneNumber: userRecord.phoneNumber || '',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }, { merge: true });
                    console.log('✅ Created/Updated Firestore document with ADMIN role');
                }
                catch (authError) {
                    console.error('❌ User not found in Firebase Auth either');
                    console.error('Please make sure the user has registered first');
                }
            }
            console.log('\n📋 All users in Firestore:');
            const allUsers = yield firebase_admin_1.db.collection('users').get();
            allUsers.forEach(doc => {
                const data = doc.data();
                console.log(`- ${data.email} (${data.role}) - ID: ${doc.id}`);
            });
        }
        catch (error) {
            console.error('❌ Error:', error);
        }
        process.exit(0);
    });
}
setAdminDirectly();
