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
exports.authService = void 0;
const auth_1 = require("firebase/auth");
const firebase_client_1 = require("../../config/firebase.client");
const firebase_admin_1 = require("../../config/firebase.admin");
exports.authService = {
    register(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, email, password, phoneNumber } = data;
            // Check existing username (Firebase auth only checks email)
            const usernameQuery = yield firebase_admin_1.db.collection('users').where('username', '==', username).get();
            if (!usernameQuery.empty) {
                throw { statusCode: 400, message: 'Username already taken' };
            }
            try {
                // Create user in Firebase Auth
                const userCredential = yield (0, auth_1.createUserWithEmailAndPassword)(firebase_client_1.authClient, email, password);
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
                yield firebase_admin_1.db.collection('users').doc(user.uid).set(userData);
                // Get ID token
                const token = yield user.getIdToken();
                return {
                    user: Object.assign({ id: user.uid }, userData),
                    token,
                };
            }
            catch (error) {
                if (error.code === 'auth/email-already-in-use') {
                    throw { statusCode: 400, message: 'Email already exists' };
                }
                throw { statusCode: 500, message: error.message };
            }
        });
    },
    login(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = data;
            try {
                const userCredential = yield (0, auth_1.signInWithEmailAndPassword)(firebase_client_1.authClient, email, password);
                const user = userCredential.user;
                const userDoc = yield firebase_admin_1.db.collection('users').doc(user.uid).get();
                const userData = userDoc.data();
                const token = yield user.getIdToken();
                return {
                    user: Object.assign({ id: user.uid }, userData),
                    token,
                };
            }
            catch (error) {
                throw { statusCode: 401, message: 'Invalid credentials' };
            }
        });
    },
    verifyUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userDoc = yield firebase_admin_1.db.collection('users').doc(userId).get();
            if (!userDoc.exists) {
                throw { statusCode: 404, message: 'User not found' };
            }
            return Object.assign({ id: userDoc.id }, userDoc.data());
        });
    },
    googleLogin(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { idToken, username } = data; // Front-end will send Firebase ID token and optionally a username for first-time login
            if (!idToken)
                throw { statusCode: 400, message: 'Google ID Token is required' };
            try {
                // Verify the ID token using the Firebase Admin SDK
                const decodedToken = yield firebase_admin_1.adminAuth.verifyIdToken(idToken);
                const { uid, email, name, picture } = decodedToken;
                // Check if user exists in Firestore
                const userDoc = yield firebase_admin_1.db.collection('users').doc(uid).get();
                let userData;
                if (!userDoc.exists) {
                    // If it's a new user, they need a username. If none provided, generate one from email or name
                    const finalUsername = username || (email ? email.split('@')[0] : `oper_${uid.slice(0, 5)}`);
                    // Ensure generated username is unique
                    const usernameQuery = yield firebase_admin_1.db.collection('users').where('username', '==', finalUsername).get();
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
                    yield firebase_admin_1.db.collection('users').doc(uid).set(userData);
                }
                else {
                    userData = userDoc.data();
                }
                return {
                    user: Object.assign({ id: uid }, userData),
                    token: idToken, // Re-use the Firebase ID token for our stateless session mapping
                };
            }
            catch (error) {
                console.error("GOOGLE AUTH VERIFICATION FAILED. RAW ERROR:", error);
                throw { statusCode: 401, message: 'Invalid or expired Google Token: ' + error.message };
            }
        });
    }
};
