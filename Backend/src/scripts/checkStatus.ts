import admin, { db } from '../config/firebase.admin';

async function checkTournaments() {
    console.log('--- TOURNAMENT STATUS CHECK ---');
    const snapshot = await db.collection('tournaments').get();
    if (snapshot.empty) {
        console.log('No tournaments found.');
        return;
    }

    snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`ID: ${doc.id} | Name: ${data.name} | Status: "${data.status}"`);
    });
    console.log('-------------------------------');
    process.exit(0);
}

checkTournaments().catch(err => {
    console.error(err);
    process.exit(1);
});
