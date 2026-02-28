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
exports.uploadCollegeLogo = exports.uploadGameLogo = exports.uploadTournamentPoster = exports.deleteTournament = exports.updateTournament = exports.createTournament = exports.exportRegistrationsCSV = exports.verifyRegistrationPayment = exports.getAdminRegistrations = exports.updateUserRole = exports.deleteUser = exports.getAllUsers = exports.getAdminStats = void 0;
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
/**
 * STEP 10 — Admin: Get All Registrations
 * Returns full team + IGL + player + payment details
 * GET /api/admin/registrations
 */
const getAdminRegistrations = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield admin_service_1.adminService.getAllRegistrations();
        (0, response_util_1.sendSuccess)(res, 200, 'All registrations retrieved', data);
    }
    catch (error) {
        next(error);
    }
});
exports.getAdminRegistrations = getAdminRegistrations;
/**
 * STEP 11 — Admin: Verify Payment
 * PATCH /api/admin/registrations/:id/verify
 */
const verifyRegistrationPayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const registrationId = req.params.id;
        const adminId = req.user.id;
        const data = yield admin_service_1.adminService.verifyRegistrationPayment(adminId, registrationId);
        (0, response_util_1.sendSuccess)(res, 200, 'Registration payment verified', data);
    }
    catch (error) {
        next(error);
    }
});
exports.verifyRegistrationPayment = verifyRegistrationPayment;
/**
 * CSV EXPORT — Admin: Export Registrations as CSV
 * GET /api/admin/registrations/export-csv?tournamentId=xxx  (tournamentId optional)
 */
const exportRegistrationsCSV = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tournamentId = req.query.tournamentId;
        const csv = yield admin_service_1.adminService.exportRegistrationsCSV(tournamentId);
        const filename = tournamentId
            ? `registrations_${tournamentId}_${Date.now()}.csv`
            : `registrations_all_${Date.now()}.csv`;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csv);
    }
    catch (error) {
        next(error);
    }
});
exports.exportRegistrationsCSV = exportRegistrationsCSV;
/**
 * ADMIN: Create Tournament
 * POST /api/admin/tournaments
 */
const createTournament = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminId = req.user.id;
        const data = yield admin_service_1.adminService.createTournament(adminId, req.body);
        (0, response_util_1.sendSuccess)(res, 201, 'Tournament created', data);
    }
    catch (error) {
        next(error);
    }
});
exports.createTournament = createTournament;
/**
 * ADMIN: Update Tournament
 * PATCH /api/admin/tournaments/:id
 */
const updateTournament = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const data = yield admin_service_1.adminService.updateTournament(id, req.body);
        (0, response_util_1.sendSuccess)(res, 200, 'Tournament updated', data);
    }
    catch (error) {
        next(error);
    }
});
exports.updateTournament = updateTournament;
/**
 * ADMIN: Delete Tournament
 * DELETE /api/admin/tournaments/:id
 */
const deleteTournament = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const data = yield admin_service_1.adminService.deleteTournament(id);
        (0, response_util_1.sendSuccess)(res, 200, 'Tournament deleted', data);
    }
    catch (error) {
        next(error);
    }
});
exports.deleteTournament = deleteTournament;
const uploadTournamentPoster = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(`[AdminController] 📥 uploadTournamentPoster: id=${req.params.id}, hasFile=${!!req.file}`);
        if (!req.file)
            throw { statusCode: 400, message: 'No file uploaded' };
        const id = req.params.id;
        const data = yield admin_service_1.adminService.uploadTournamentPoster(id, req.file);
        (0, response_util_1.sendSuccess)(res, 200, 'Poster uploaded successfully', data);
    }
    catch (error) {
        next(error);
    }
});
exports.uploadTournamentPoster = uploadTournamentPoster;
const uploadGameLogo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(`[AdminController] 📥 uploadGameLogo: id=${req.params.id}, gameId=${req.params.gameId}, hasFile=${!!req.file}`);
        if (!req.file)
            throw { statusCode: 400, message: 'No file uploaded' };
        const id = req.params.id;
        const gameId = req.params.gameId;
        const data = yield admin_service_1.adminService.uploadGameLogo(id, gameId, req.file);
        (0, response_util_1.sendSuccess)(res, 200, 'Game logo uploaded successfully', data);
    }
    catch (error) {
        next(error);
    }
});
exports.uploadGameLogo = uploadGameLogo;
const uploadCollegeLogo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file)
            throw { statusCode: 400, message: 'No file uploaded' };
        const id = req.params.id;
        const collegeId = req.params.collegeId;
        const data = yield admin_service_1.adminService.uploadCollegeLogo(id, collegeId, req.file);
        (0, response_util_1.sendSuccess)(res, 200, 'College logo uploaded successfully', data);
    }
    catch (error) {
        next(error);
    }
});
exports.uploadCollegeLogo = uploadCollegeLogo;
