
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
if (!b64) {
    console.error('❌ FIREBASE_SERVICE_ACCOUNT_BASE64 is not set');
    process.exit(1);
}

const serviceAccount = JSON.parse(Buffer.from(b64, 'base64').toString('ascii'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
});

const run = async () => {
    try {
        console.log('🔍 Listing all buckets for project:', serviceAccount.project_id);
        // Using the underlying storage client from a dummy bucket reference
        const storageClient = admin.storage().bucket('dummy').storage;
        const [buckets] = await storageClient.getBuckets();

        if (buckets.length === 0) {
            console.log('❌ No buckets found in this project.');
        } else {
            console.log('✅ Found buckets:');
            buckets.forEach((b: any) => console.log(`   - ${b.name}`));
        }
    } catch (error: any) {
        console.error('❌ Error listing buckets:', error.message);
    }
    process.exit(0);
};

run();
