import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAdGbXI0aEgLqTyz6ULi_LRt_a8MBXCfwo",
    authDomain: "call-out-esports.firebaseapp.com",
    projectId: "call-out-esports",
    storageBucket: "call-out-esports.firebasestorage.app",
    messagingSenderId: "185478354356",
    appId: "1:185478354356:web:662b8ff66f1dbee1830ee1",
    measurementId: "G-1JJW8D8SPM"
};

// Initialize Firebase only once
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Optional: Prompt user to select account always
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

export { app, auth, googleProvider };
