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
exports.completeWithPayment = exports.getAllRegistrations = exports.getUserRegistrations = exports.createRegistration = void 0;
const registration_service_1 = require("./registration.service");
const response_util_1 = require("../../utils/response.util");
/**
 * STEP 5 — Create Registration
 * POST /api/registrations/create
 * Returns { registrationId } only (per spec)
 */
const createRegistration = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield registration_service_1.registrationService.createRegistration(req.user.id, req.body);
        (0, response_util_1.sendSuccess)(res, 201, 'Registration created successfully', data);
    }
    catch (error) {
        next(error);
    }
});
exports.createRegistration = createRegistration;
/**
 * STEP 9 — User Dashboard: Get My Registrations
 * GET /api/registrations/user
 * Returns registrations with statusLabel computed on backend
 */
const getUserRegistrations = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield registration_service_1.registrationService.getUserRegistrations(req.user.id);
        (0, response_util_1.sendSuccess)(res, 200, 'User registrations retrieved', data);
    }
    catch (error) {
        next(error);
    }
});
exports.getUserRegistrations = getUserRegistrations;
/**
 * Admin: Get All Registrations (used by registration.routes legacy path)
 * Delegates to registrationService.getAllRegistrations
 */
const getAllRegistrations = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield registration_service_1.registrationService.getAllRegistrations();
        (0, response_util_1.sendSuccess)(res, 200, 'All registrations retrieved', data);
    }
    catch (error) {
        next(error);
    }
});
exports.getAllRegistrations = getAllRegistrations;
/**
 * STEP 8 (NEW FLOW) — Complete registration atomically with payment
 * POST /api/registrations/complete-with-payment
 * Creates registration + assigns QR + creates payment doc in ONE transaction.
 * Nothing is written to Firestore until the user submits payment proof.
 */
const completeWithPayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield registration_service_1.registrationService.completeWithPayment(req.user.id, req.body);
        (0, response_util_1.sendSuccess)(res, 201, 'Registration complete — payment submitted and awaiting admin verification', data);
    }
    catch (error) {
        next(error);
    }
});
exports.completeWithPayment = completeWithPayment;
