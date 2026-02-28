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
exports.getUserQueries = exports.submitQuery = exports.updateProfile = exports.getUserTournaments = exports.getDashboardStats = void 0;
const user_service_1 = require("./user.service");
const response_util_1 = require("../../utils/response.util");
const getDashboardStats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield user_service_1.userService.getDashboardStats(req.user.id);
        (0, response_util_1.sendSuccess)(res, 200, 'Dashboard stats retrieved', data);
    }
    catch (error) {
        next(error);
    }
});
exports.getDashboardStats = getDashboardStats;
const getUserTournaments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield user_service_1.userService.getUserTournaments(req.user.id);
        (0, response_util_1.sendSuccess)(res, 200, 'User tournaments retrieved', data);
    }
    catch (error) {
        next(error);
    }
});
exports.getUserTournaments = getUserTournaments;
const updateProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield user_service_1.userService.updateProfile(req.user.id, req.body);
        (0, response_util_1.sendSuccess)(res, 200, 'Profile updated', data);
    }
    catch (error) {
        next(error);
    }
});
exports.updateProfile = updateProfile;
const submitQuery = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield user_service_1.userService.submitQuery(req.user.id, req.body);
        (0, response_util_1.sendSuccess)(res, 201, 'Query submitted', data);
    }
    catch (error) {
        next(error);
    }
});
exports.submitQuery = submitQuery;
const getUserQueries = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield user_service_1.userService.getUserQueries(req.user.id);
        (0, response_util_1.sendSuccess)(res, 200, 'User queries retrieved', data);
    }
    catch (error) {
        next(error);
    }
});
exports.getUserQueries = getUserQueries;
