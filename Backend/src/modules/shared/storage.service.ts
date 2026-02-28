import { storage } from '../../config/firebase.admin';
import { v4 as uuidv4 } from 'uuid';

export class StorageService {
    /**
     * Uploads a file buffer to Firebase Storage and returns the public URL.
     * @param file Buffer of the file to upload
     * @param folder Destination folder in storage
     * @param mimeType MIME type of the file
     * @returns Promise<string> Public download URL
     */
    static async uploadFile(file: Buffer, folder: string, mimeType: string): Promise<string> {
        const fileName = `${folder}/${uuidv4()}_${Date.now()}`;
        const fileRef = storage.file(fileName);

        await fileRef.save(file, {
            metadata: {
                contentType: mimeType,
            },
            public: true, // Make it public so we can get a persistent URL
        });

        // The public URL format for Firebase Storage:
        // https://storage.googleapis.com/[BUCKET_NAME]/[FILE_NAME]
        // Or using getDownloadURL logic if we were using the client SDK, 
        // but for admin SDK we can construct it or use makePublic.

        return `https://storage.googleapis.com/${storage.name}/${fileName}`;
    }

    /**
     * Deletes a file from Firebase Storage.
     * @param url Public URL of the file to delete
     */
    static async deleteFile(url: string): Promise<void> {
        try {
            const prefix = `https://storage.googleapis.com/${storage.name}/`;
            if (url.startsWith(prefix)) {
                const fileName = url.replace(prefix, '');
                await storage.file(fileName).delete();
            }
        } catch (error) {
            console.error('Error deleting file from storage:', error);
        }
    }
}
