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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin_service_1 = require("./modules/admin/admin.service");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const res = yield admin_service_1.adminService.getAllUsers();
        console.log("Found users length:", res.length);
        if (res.length > 0) {
            console.log("First user:", res[0]);
        }
    }
    catch (e) {
        console.error("Error:", e);
    }
});
run();
