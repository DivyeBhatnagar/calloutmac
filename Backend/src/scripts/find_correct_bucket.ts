
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
if (!b64) {
    console.error('❌ FIREBASE_SERVICE_ACCOUNT_BASE64 is not set');
    process.exit(1);
}

const sa = JSON.parse(Buffer.from(b64, 'base64').toString('ascii'));
const projectId = sa.project_id;

const testBucket = async (name: string) => {
    console.log(`\n🧪 Testing bucket: ${name} ...`);
    try {
        // Initialize or get app
        let app: admin.app.App;
        if (admin.apps.length > 0 && admin.apps[0]) {
            app = admin.apps[0];
        } else {
            app = admin.initializeApp({
                credential: admin.credential.cert(sa)
            }, 'test-app-' + name);
        }

        const bucket = admin.storage(app).bucket(name);
        const fileName = `test_connection_${Date.now()}.txt`;
        const file = bucket.file(fileName);

        await file.save('Connection Test', {
            metadata: { contentType: 'text/plain' }
        });

        console.log(`✅ SUCCESS! Bucket "${name}" exists and is writable.`);
        await file.delete();
        return true;
    } catch (error: any) {
        console.error(`❌ FAILED: ${name} -> ${error.message}`);
        return false;
    }
};

const run = async () => {
    const names = [
        `${projectId}.appspot.com`,
        `${projectId}.firebasestorage.app`,
        `callout-esports.appspot.com`,
        `callout-esports.firebasestorage.app`,
        `project-185478354356.appspot.com`
    ];

    for (const name of names) {
        if (await testBucket(name)) {
            console.log(`\n🎯 THE CORRECT BUCKET IS: ${name}`);
            process.exit(0);
        }
    }

    console.log('\n❌ ALL BUCKETS FAILED. Please check Firebase Console for the correct "Storage Bucket" name.');
    process.exit(1);
};

run();
