import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyAdGbXI0aEgLqTyz6ULi_LRt_a8MBXCfwo",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "call-out-esports.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "call-out-esports",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "call-out-esports.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "185478354356",
    appId: process.env.FIREBASE_APP_ID || "1:185478354356:web:662b8ff66f1dbee1830ee1",
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-1JJW8D8SPM"
};

const app = initializeApp(firebaseConfig);
export const authClient = getAuth(app);
export default app;
