"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/stats', user_controller_1.getDashboardStats);
router.get('/tournaments', user_controller_1.getUserTournaments);
// Queries
router.get('/queries', user_controller_1.getUserQueries);
router.post('/query', user_controller_1.submitQuery);
// Profile
router.put('/profile', user_controller_1.updateProfile);
exports.default = router;
