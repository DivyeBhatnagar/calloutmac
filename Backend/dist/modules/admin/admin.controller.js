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
exports.updateUserRole = exports.deleteUser = exports.getAllUsers = exports.getAdminStats = void 0;
const admin_service_1 = require("./admin.service");
const response_util_1 = require("../../utils/response.util");
const getAdminStats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield admin_service_1.adminService.getAdminStats();
        (0, response_util_1.sendSuccess)(res, 200, 'Admin stats retrieved', data);
    }
    catch (error) {
        next(error);
    }
});
exports.getAdminStats = getAdminStats;
const getAllUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield admin_service_1.adminService.getAllUsers();
        (0, response_util_1.sendSuccess)(res, 200, 'All users retrieved', data);
    }
    catch (error) {
        next(error);
    }
});
exports.getAllUsers = getAllUsers;
const deleteUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const data = yield admin_service_1.adminService.deleteUser(id);
        (0, response_util_1.sendSuccess)(res, 200, 'User deleted', data);
    }
    catch (error) {
        next(error);
    }
});
exports.deleteUser = deleteUser;
const updateUserRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const { role } = req.body;
        const data = yield admin_service_1.adminService.updateUserRole(id, role);
        (0, response_util_1.sendSuccess)(res, 200, 'User role updated', data);
    }
    catch (error) {
        next(error);
    }
});
exports.updateUserRole = updateUserRole;
