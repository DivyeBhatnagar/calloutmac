"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const registration_controller_1 = require("./registration.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// User routes
router.post('/', registration_controller_1.createRegistration);
router.get('/user', registration_controller_1.getUserRegistrations);
// Admin routes
router.get('/admin', auth_middleware_1.authorizeAdmin, registration_controller_1.getAllRegistrations);
router.patch('/admin/:id/verify', auth_middleware_1.authorizeAdmin, registration_controller_1.verifyRegistration);
exports.default = router;
