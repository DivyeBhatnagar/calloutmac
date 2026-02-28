"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const firebase_admin_1 = require("../../config/firebase.admin");
const uuid_1 = require("uuid");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class StorageService {
    /**
     * Uploads a file buffer to Firebase Storage or local disk as fallback.
     * @param file Buffer of the file to upload
     * @param folder Destination folder (posters, games, etc.)
     * @param mimeType MIME type of the file
     * @returns Promise<string> Public download URL
     */
    static uploadFile(file, folder, mimeType) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileName = `${folder}/${(0, uuid_1.v4)()}_${Date.now()}.${mimeType.split('/')[1] || 'jpg'}`;
            console.log(`[Storage] 🚀 Starting upload: ${fileName} (${file.length} bytes)`);
            // 1. Try Firebase Storage
            if (firebase_admin_1.storage) {
                try {
                    console.log(`[Storage] 📡 Attempting Firebase upload to bucket: ${firebase_admin_1.storage.name}`);
                    const fileRef = firebase_admin_1.storage.file(fileName);
                    yield fileRef.save(file, {
                        metadata: { contentType: mimeType },
                        public: true,
                    });
                    console.log(`[Storage] ✅ Firebase success: ${fileName}`);
                    return `https://storage.googleapis.com/${firebase_admin_1.storage.name}/${fileName}`;
                }
                catch (error) {
                    console.warn(`[Storage] ❌ Firebase failed: ${error.message}.`);
                    console.log('[Storage] 🔄 Falling back to local storage...');
                }
            }
            else {
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
            }
            catch (localError) {
                console.error(`[Storage] 🚨 CRITICAL FAILURE: Both storage methods failed!`, localError);
                throw new Error(`Upload failed: ${localError.message}`);
            }
        });
    }
    /**
     * Deletes a file from Firebase Storage.
     * @param url Public URL of the file to delete
     */
    static deleteFile(url) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!firebase_admin_1.storage)
                return;
            try {
                const prefix = `https://storage.googleapis.com/${firebase_admin_1.storage.name}/`;
                if (url.startsWith(prefix)) {
                    const fileName = url.replace(prefix, '');
                    yield firebase_admin_1.storage.file(fileName).delete();
                    console.log(`[Storage] 🗑️ Deleted Firebase file: ${fileName}`);
                }
                else if (url.startsWith('/uploads/')) {
                    const localPath = path.join(__dirname, '../../../public', url);
                    if (fs.existsSync(localPath)) {
                        fs.unlinkSync(localPath);
                        console.log(`[Storage] 🗑️ Deleted local file: ${localPath}`);
                    }
                }
            }
            catch (error) {
                console.error('[Storage] Error during file deletion:', error);
            }
        });
    }
}
exports.StorageService = StorageService;
