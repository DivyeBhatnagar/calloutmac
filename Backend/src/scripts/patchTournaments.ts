import admin, { db } from '../config/firebase.admin';

/**
 * DYNAMIC TOURNAMENT PATCH
 * 
 * Ensures all existing active tournaments have:
 * 1. supportedGames: Derived from the 'games' array if present, else ["BGMI"]
 * 2. allowedColleges: [] (default if missing)
 * 3. status: "active" (if missing)
 * 
 * This ensures the frontend selection wizard is fully dynamic for all tournaments.
 */
async function patchTournaments() {
    console.log('🚀 Starting dynamic tournament patch...');

    const snap = await db.collection('tournaments').get();
    console.log(`Found ${snap.size} tournaments total.`);

    const batch = db.batch();
    let count = 0;

    for (const doc of snap.docs) {
        const data = doc.data();
        const update: any = {};
        let changed = false;

        // 1. supportedGames (Dynamic derivation)
        const existingGames = data.games || []; // Array of { id, name, logoUrl }
        let targetGames = data.supportedGames || [];

        if (Array.isArray(existingGames) && existingGames.length > 0) {
            // Priority: sync from the rich 'games' array
            targetGames = existingGames.map((g: any) => g.name).filter(Boolean);
        }

        if (targetGames.length === 0) {
            // Fallback for legacy data with no 'games' and no 'supportedGames'
            targetGames = ['BGMI'];
        }

        // Compare targetGames with current supportedGames to avoid unnecessary updates
        const currentGamesStr = JSON.stringify((data.supportedGames || []).sort());
        const targetGamesStr = JSON.stringify([...targetGames].sort());

        if (currentGamesStr !== targetGamesStr) {
            update.supportedGames = targetGames;
            changed = true;
        }

        // 2. allowedColleges
        if (!data.allowedColleges || !Array.isArray(data.allowedColleges)) {
            update.allowedColleges = [];
            changed = true;
        }

        // 3. status
        if (!data.status) {
            update.status = 'active';
            changed = true;
        }

        if (changed) {
            update.updatedAt = admin.firestore.Timestamp.now();
            batch.update(doc.ref, update);
            count++;
            console.log(`[PATCH] Tournament: ${data.name || doc.id} -> games: ${JSON.stringify(targetGames)}`);
        }
    }

    if (count > 0) {
        await batch.commit();
        console.log(`✅ Successfully patched ${count} tournaments.`);
    } else {
        console.log('✨ No tournaments needed patching.');
    }
}

patchTournaments()
    .then(() => {
        console.log('🏁 Patch complete.');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Patch failed:', err);
        process.exit(1);
    });
