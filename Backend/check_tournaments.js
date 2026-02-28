const admin = require('./src/config/firebase.admin').default;
const db = admin.firestore();

async function checkTournaments() {
    const snapshot = await db.collection('tournaments').get();
    console.log(`Total tournaments: ${snapshot.size}`);
    snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`ID: ${doc.id} | Name: ${data.name} | Status: ${data.status}`);
    });
    process.exit(0);
}

checkTournaments().catch(console.error);
