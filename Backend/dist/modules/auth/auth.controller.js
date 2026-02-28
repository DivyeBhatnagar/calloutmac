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
exports.getMe = exports.googleLogin = exports.login = exports.register = void 0;
const auth_service_1 = require("./auth.service");
const response_util_1 = require("../../utils/response.util");
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield auth_service_1.authService.register(req.body);
        (0, response_util_1.sendSuccess)(res, 201, 'User registered successfully', data);
    }
    catch (error) {
        next(error);
    }
});
exports.register = register;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield auth_service_1.authService.login(req.body);
        (0, response_util_1.sendSuccess)(res, 200, 'User logged in successfully', data);
    }
    catch (error) {
        next(error);
    }
});
exports.login = login;
const googleLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield auth_service_1.authService.googleLogin(req.body);
        (0, response_util_1.sendSuccess)(res, 200, 'User authenticated with Google successfully', data);
    }
    catch (error) {
        next(error);
    }
});
exports.googleLogin = googleLogin;
const getMe = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const user = yield auth_service_1.authService.verifyUser(userId);
        (0, response_util_1.sendSuccess)(res, 200, 'User details retrieved', user);
    }
    catch (error) {
        next(error);
    }
});
exports.getMe = getMe;
