"use strict";
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
exports.queryService = void 0;
const firebase_admin_1 = require("../../config/firebase.admin");
exports.queryService = {
    getAllQueries() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const snapshot = yield firebase_admin_1.db.collection('queries').orderBy('createdAt', 'desc').get();
            const result = [];
            for (const doc of snapshot.docs) {
                const data = doc.data();
                const uDoc = yield firebase_admin_1.db.collection('users').doc(data.userId).get();
                result.push(Object.assign(Object.assign({ id: doc.id }, data), { user: uDoc.exists ? { username: (_a = uDoc.data()) === null || _a === void 0 ? void 0 : _a.username, email: (_b = uDoc.data()) === null || _b === void 0 ? void 0 : _b.email } : null }));
            }
            return result;
        });
    },
    respondToQuery(queryId, adminResponse) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!adminResponse) {
                throw { statusCode: 400, message: 'Response message is required' };
            }
            const docRef = firebase_admin_1.db.collection('queries').doc(queryId);
            yield docRef.update({
                adminResponse,
                status: 'RESOLVED',
                updatedAt: new Date().toISOString()
            });
            const updated = yield docRef.get();
            return Object.assign({ id: updated.id }, updated.data());
        });
    }
};
