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
const firebase_admin_1 = require("../config/firebase.admin");
function checkTournaments() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('--- TOURNAMENT STATUS CHECK ---');
        const snapshot = yield firebase_admin_1.db.collection('tournaments').get();
        if (snapshot.empty) {
            console.log('No tournaments found.');
            return;
        }
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`ID: ${doc.id} | Data: ${JSON.stringify(data, null, 2)}`);
        });
        console.log('-------------------------------');
        process.exit(0);
    });
}
checkTournaments().catch(err => {
    console.error(err);
    process.exit(1);
});
