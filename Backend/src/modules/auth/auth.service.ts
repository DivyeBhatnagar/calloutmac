import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { authClient } from '../../config/firebase.client';
import { adminAuth, db } from '../../config/firebase.admin';

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
    },

    async googleLogin(data: any) {
        const { idToken, username } = data; // Front-end will send Firebase ID token and optionally a username for first-time login
        if (!idToken) throw { statusCode: 400, message: 'Google ID Token is required' };

        try {
            // Verify the ID token using the Firebase Admin SDK
            const decodedToken = await adminAuth.verifyIdToken(idToken);
            const { uid, email, name, picture } = decodedToken;

            // Check if user exists in Firestore
            const userDoc = await db.collection('users').doc(uid).get();

            let userData;
            if (!userDoc.exists) {
                // If it's a new user, they need a username. If none provided, generate one from email or name
                const finalUsername = username || (email ? email.split('@')[0] : `oper_${uid.slice(0, 5)}`);

                // Ensure generated username is unique
                const usernameQuery = await db.collection('users').where('username', '==', finalUsername).get();
                if (!usernameQuery.empty) {
                    throw { statusCode: 400, message: 'Username is already taken. Please choose another one.' };
                }

                userData = {
                    username: finalUsername,
                    email: email || '',
                    phoneNumber: null,
                    role: 'USER',
                    avatar: picture || null,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                await db.collection('users').doc(uid).set(userData);
            } else {
                userData = userDoc.data();
            }

            return {
                user: {
                    id: uid,
                    ...userData
                },
                token: idToken, // Re-use the Firebase ID token for our stateless session mapping
            };
        } catch (error: any) {
            console.error("GOOGLE AUTH VERIFICATION FAILED. RAW ERROR:", error);
            throw { statusCode: 401, message: 'Invalid or expired Google Token: ' + error.message };
        }
    }
};
