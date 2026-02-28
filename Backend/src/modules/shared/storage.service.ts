import { storage } from '../../config/firebase.admin';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

export class StorageService {
    /**
     * Uploads a file buffer to Firebase Storage or local disk as fallback.
     * @param file Buffer of the file to upload
     * @param folder Destination folder (posters, games, etc.)
     * @param mimeType MIME type of the file
     * @returns Promise<string> Public download URL
     */
    static async uploadFile(file: Buffer, folder: string, mimeType: string): Promise<string> {
        const fileName = `${folder}/${uuidv4()}_${Date.now()}.${mimeType.split('/')[1] || 'jpg'}`;
        console.log(`[Storage] 🚀 Starting upload: ${fileName} (${file.length} bytes)`);

        // 1. Try Firebase Storage
        if (storage) {
            try {
                console.log(`[Storage] 📡 Attempting Firebase upload to bucket: ${storage.name}`);
                const fileRef = storage.file(fileName);
                await fileRef.save(file, {
                    metadata: { contentType: mimeType },
                    public: true,
                });
                console.log(`[Storage] ✅ Firebase success: ${fileName}`);
                return `https://storage.googleapis.com/${storage.name}/${fileName}`;
            } catch (error: any) {
                console.warn(`[Storage] ❌ Firebase failed: ${error.message}.`);
                console.log('[Storage] 🔄 Falling back to local storage...');
            }
        } else {
            console.log('[Storage] ℹ️ Firebase not initialized. Using local fallback.');
        }

        // 2. Local Fallback
        try {
            // Path relative to this file: ../../../public/uploads
            const localDir = path.join(__dirname, '../../../public/uploads', folder);

            if (!fs.existsSync(localDir)) {
                console.log(`[Storage] 📂 Creating local directory: ${localDir}`);
                fs.mkdirSync(localDir, { recursive: true });
            }

            const localPath = path.join(localDir, path.basename(fileName));
            console.log(`[Storage] 💾 Writing file to local disk: ${localPath}`);
            fs.writeFileSync(localPath, file);

            // Return path served by Express static middleware
            const resultUrl = `/uploads/${fileName}`;
            console.log(`[Storage] ✨ Local upload complete: ${resultUrl}`);
            return resultUrl;
        } catch (localError: any) {
            console.error(`[Storage] 🚨 CRITICAL FAILURE: Both storage methods failed!`, localError);
            throw new Error(`Upload failed: ${localError.message}`);
        }
    }

    /**
     * Deletes a file from Firebase Storage.
     * @param url Public URL of the file to delete
     */
    static async deleteFile(url: string): Promise<void> {
        if (!storage) return;
        try {
            const prefix = `https://storage.googleapis.com/${storage.name}/`;
            if (url.startsWith(prefix)) {
                const fileName = url.replace(prefix, '');
                await storage.file(fileName).delete();
                console.log(`[Storage] 🗑️ Deleted Firebase file: ${fileName}`);
            } else if (url.startsWith('/uploads/')) {
                const localPath = path.join(__dirname, '../../../public', url);
                if (fs.existsSync(localPath)) {
                    fs.unlinkSync(localPath);
                    console.log(`[Storage] 🗑️ Deleted local file: ${localPath}`);
                }
            }
        } catch (error) {
            console.error('[Storage] Error during file deletion:', error);
        }
    }
}
