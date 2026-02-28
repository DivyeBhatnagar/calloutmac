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
const admin = __importStar(require("firebase-admin"));
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
if (!b64) {
    console.error('❌ FIREBASE_SERVICE_ACCOUNT_BASE64 is not set');
    process.exit(1);
}
const sa = JSON.parse(Buffer.from(b64, 'base64').toString('ascii'));
const projectId = sa.project_id;
const testBucket = (name) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`\n🧪 Testing bucket: ${name} ...`);
    try {
        // Initialize or get app
        let app;
        if (admin.apps.length > 0 && admin.apps[0]) {
            app = admin.apps[0];
        }
        else {
            app = admin.initializeApp({
                credential: admin.credential.cert(sa)
            }, 'test-app-' + name);
        }
        const bucket = admin.storage(app).bucket(name);
        const fileName = `test_connection_${Date.now()}.txt`;
        const file = bucket.file(fileName);
        yield file.save('Connection Test', {
            metadata: { contentType: 'text/plain' }
        });
        console.log(`✅ SUCCESS! Bucket "${name}" exists and is writable.`);
        yield file.delete();
        return true;
    }
    catch (error) {
        console.error(`❌ FAILED: ${name} -> ${error.message}`);
        return false;
    }
});
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const names = [
        `${projectId}.appspot.com`,
        `${projectId}.firebasestorage.app`,
        `callout-esports.appspot.com`,
        `callout-esports.firebasestorage.app`,
        `project-185478354356.appspot.com`
    ];
    for (const name of names) {
        if (yield testBucket(name)) {
            console.log(`\n🎯 THE CORRECT BUCKET IS: ${name}`);
            process.exit(0);
        }
    }
    console.log('\n❌ ALL BUCKETS FAILED. Please check Firebase Console for the correct "Storage Bucket" name.');
    process.exit(1);
});
run();
