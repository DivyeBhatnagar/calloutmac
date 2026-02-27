import { db, adminAuth } from './src/config/firebase.admin';

async function testFirebase() {
    try {
        console.log("Testing Firestore Connection...");
        const snapshot = await db.collection('users').limit(1).get();
        console.log("Firestore Access SUCCESS. Found docs:", snapshot.size);
    } catch (error) {
        console.error("Firestore Access FAILED:", error);
    }
}

testFirebase();
