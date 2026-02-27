import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { authClient } from '../../config/firebase.client';
import { db } from '../../config/firebase.admin';

export const authService = {
    async register(data: any) {
        const { username, email, password, phoneNumber } = data;

        // Check existing username (Firebase auth only checks email)
        const usernameQuery = await db.collection('users').where('username', '==', username).get();
        if (!usernameQuery.empty) {
            throw { statusCode: 400, message: 'Username already taken' };
        }

        try {
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(authClient, email, password);
            const user = userCredential.user;

            const userData = {
                username,
                email,
                phoneNumber: phoneNumber || null,
                role: 'USER',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Store additional user data in Firestore
            await db.collection('users').doc(user.uid).set(userData);

            // Get ID token
            const token = await user.getIdToken();

            return {
                user: {
                    id: user.uid,
                    ...userData
                },
                token,
            };
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                throw { statusCode: 400, message: 'Email already exists' };
            }
            throw { statusCode: 500, message: error.message };
        }
    },

    async login(data: any) {
        const { email, password } = data;

        try {
            const userCredential = await signInWithEmailAndPassword(authClient, email, password);
            const user = userCredential.user;

            const userDoc = await db.collection('users').doc(user.uid).get();
            const userData = userDoc.data();

            const token = await user.getIdToken();

            return {
                user: {
                    id: user.uid,
                    ...userData
                },
                token,
            };
        } catch (error: any) {
            throw { statusCode: 401, message: 'Invalid credentials' };
        }
    },

    async verifyUser(userId: string) {
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            throw { statusCode: 404, message: 'User not found' };
        }

        return {
            id: userDoc.id,
            ...userDoc.data()
        };
    }
};
