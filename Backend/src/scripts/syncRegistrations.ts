import * as admin from 'firebase-admin';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

if (!serviceAccountKey && !serviceAccountBase64) {
    console.error('Neither FIREBASE_SERVICE_ACCOUNT_KEY nor FIREBASE_SERVICE_ACCOUNT_BASE64 is set.');
    process.exit(1);
}

let serviceAccount: any;
if (serviceAccountBase64) {
    try {
        serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('ascii'));
    } catch (error) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64.');
        process.exit(1);
    }
} else if (serviceAccountKey) {
    try {
        serviceAccount = JSON.parse(serviceAccountKey);
    } catch (error) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY.');
        process.exit(1);
    }
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

const syncLegacyRegistrations = async () => {
    try {
        console.log('🔄 Starting sync of all legacy registrations...');

        const tournamentsSnapshot = await db.collection('tournaments').get();
        console.log(`Found ${tournamentsSnapshot.size} tournaments.`);

        const batch = db.batch();
        let totalUpdated = 0;

        for (const tDoc of tournamentsSnapshot.docs) {
            const tournamentId = tDoc.id;

            // Count all registrations for this tournament
            const registrationsSnapshot = await db.collection('registrations')
                .where('tournamentId', '==', tournamentId)
                .get();

            const actualCount = registrationsSnapshot.size;
            const currentCount = tDoc.data().currentRegistrations || 0;

            if (actualCount !== currentCount) {
                console.log(`Tournament ${tDoc.data().name} (${tournamentId}): Expected ${actualCount}, found ${currentCount}. Updating...`);
                batch.update(tDoc.ref, { currentRegistrations: actualCount });
                totalUpdated++;
            } else {
                console.log(`Tournament ${tDoc.data().name} (${tournamentId}): Correct count ${currentCount}. Skipping.`);

                // Even if it matches but the field doesn't explicitly exist, we should set it
                if (tDoc.data().currentRegistrations === undefined) {
                    batch.update(tDoc.ref, { currentRegistrations: actualCount });
                    totalUpdated++;
                }
            }
        }

        if (totalUpdated > 0) {
            await batch.commit();
            console.log(`✅ Success! Synced ${totalUpdated} tournaments with their actual registration counts.`);
        } else {
            console.log(`✅ Success! All tournaments already have the correct registration counts.`);
        }

        process.exit(0);
    } catch (e) {
        console.error('CRITICAL ERROR DURING SYNC:', e);
        process.exit(1);
    }
};

syncLegacyRegistrations();
