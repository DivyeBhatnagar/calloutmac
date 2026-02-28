"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const registration_controller_1 = require("./registration.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// All registration routes require authentication
router.use(auth_middleware_1.authenticate);
// OLD FLOW: Create registration only (user then calls /payments/assign-qr + /payments/submit separately)
router.post('/create', auth_middleware_1.authorizeUser, registration_controller_1.createRegistration);
// NEW FLOW: Atomically create registration + assign QR + submit payment in one call
// Nothing is written to Firestore before this endpoint is called.
router.post('/complete-with-payment', auth_middleware_1.authorizeUser, registration_controller_1.completeWithPayment);
// STEP 9: Get user's own registrations with statusLabel — USER only
router.get('/user', auth_middleware_1.authorizeUser, registration_controller_1.getUserRegistrations);
// Legacy admin sub-route (also accessible via /api/admin/registrations)
router.get('/admin', auth_middleware_1.authorizeAdmin, registration_controller_1.getAllRegistrations);
exports.default = router;
