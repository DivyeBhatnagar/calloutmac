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
 * Script to set up admin user
 * Run with: npx ts-node src/utils/setupAdmin.ts
 */
const ADMIN_EMAIL = 'divyebhatnagar784@gmail.com';
function setupAdmin() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Find user by email
            const usersSnapshot = yield firebase_admin_1.db.collection('users')
                .where('email', '==', ADMIN_EMAIL)
                .get();
            if (usersSnapshot.empty) {
                console.log(`User with email ${ADMIN_EMAIL} not found.`);
                console.log('Please register this user first, then run this script again.');
                return;
            }
            const userDoc = usersSnapshot.docs[0];
            // Update user role to ADMIN
            yield firebase_admin_1.db.collection('users').doc(userDoc.id).update({
                role: 'ADMIN',
                updatedAt: new Date().toISOString()
            });
            console.log(`✅ Successfully set ${ADMIN_EMAIL} as ADMIN`);
            console.log(`User ID: ${userDoc.id}`);
        }
        catch (error) {
            console.error('Error setting up admin:', error);
        }
    });
}
setupAdmin();
