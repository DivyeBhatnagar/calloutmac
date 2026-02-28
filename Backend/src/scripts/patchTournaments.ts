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

        // 1. supportedGames (Dynamic derivation to objects)
        const existingGames = data.games || []; // Array of { id, name, logoUrl }
        let targetGames: any[] = [];

        if (Array.isArray(existingGames) && existingGames.length > 0) {
            targetGames = existingGames.map((g: any) => ({
                id: g.id || admin.firestore().collection('tmp').doc().id,
                name: g.name,
                logoUrl: g.logoUrl || ''
            }));
        } else if (Array.isArray(data.supportedGames) && data.supportedGames.length > 0) {
            // Convert legacy string array to objects
            targetGames = data.supportedGames.map((g: any) => {
                if (typeof g === 'string') return { id: admin.firestore().collection('tmp').doc().id, name: g, logoUrl: '' };
                return g;
            });
        }

        if (targetGames.length === 0) {
            targetGames = [{ id: 'bgmi-default', name: 'BGMI', logoUrl: '' }];
        }

        // Compare targetGames with current supportedGames
        const currentGames = data.supportedGames || [];
        const isGameMismatch = JSON.stringify(currentGames) !== JSON.stringify(targetGames);

        if (isGameMismatch) {
            update.supportedGames = targetGames;
            changed = true;
        }

        // 2. allowedColleges (Objects {id, name, logoUrl})
        let targetColleges: any[] = [];
        if (Array.isArray(data.allowedColleges) && data.allowedColleges.length > 0) {
            targetColleges = data.allowedColleges.map((c: any) => {
                if (typeof c === 'string') return { id: admin.firestore().collection('tmp').doc().id, name: c, logoUrl: '' };
                return c;
            });
        }

        const currentColleges = data.allowedColleges || [];
        if (JSON.stringify(currentColleges) !== JSON.stringify(targetColleges)) {
            update.allowedColleges = targetColleges;
            changed = true;
        }

        // 3. status
        if (data.status !== 'ACTIVE') {
            update.status = 'ACTIVE';
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
