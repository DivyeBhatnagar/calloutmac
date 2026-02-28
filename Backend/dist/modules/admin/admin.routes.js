"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("./admin.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
// Multer configuration for memory storage
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});
// All admin routes are protected — requires valid JWT + ADMIN role
router.use(auth_middleware_1.authenticate, auth_middleware_1.authorizeAdmin);
// User management
router.get('/stats', admin_controller_1.getAdminStats);
router.get('/users', admin_controller_1.getAllUsers);
router.delete('/users/:id', admin_controller_1.deleteUser);
router.patch('/users/:id/role', admin_controller_1.updateUserRole);
// STEP 10 — View all registrations with full team + payment details
router.get('/registrations', admin_controller_1.getAdminRegistrations);
// STEP 11 — Verify a registration payment manually
router.patch('/registrations/:id/verify', admin_controller_1.verifyRegistrationPayment);
// CSV Export — download all (or filtered) registrations as CSV
router.get('/registrations/export-csv', admin_controller_1.exportRegistrationsCSV);
// Tournament Management
router.post('/tournaments', admin_controller_1.createTournament);
router.patch('/tournaments/:id', admin_controller_1.updateTournament);
router.delete('/tournaments/:id', admin_controller_1.deleteTournament);
// Image Uploads
router.post('/tournaments/:id/poster', upload.single('poster'), admin_controller_1.uploadTournamentPoster);
router.post('/tournaments/:id/games/:gameId/logo', upload.single('logo'), admin_controller_1.uploadGameLogo);
router.post('/tournaments/:id/colleges/:collegeId/logo', upload.single('logo'), admin_controller_1.uploadCollegeLogo);
exports.default = router;
