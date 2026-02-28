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
exports.verifyRegistration = exports.getAllRegistrations = exports.getUserRegistrations = exports.createRegistration = void 0;
const registration_service_1 = require("./registration.service");
const response_util_1 = require("../../utils/response.util");
const createRegistration = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield registration_service_1.registrationService.createRegistration(req.user.id, req.body);
        (0, response_util_1.sendSuccess)(res, 201, 'Registration created', data);
    }
    catch (error) {
        next(error);
    }
});
exports.createRegistration = createRegistration;
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
const verifyRegistration = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const data = yield registration_service_1.registrationService.verifyRegistration(id);
        (0, response_util_1.sendSuccess)(res, 200, 'Registration verified', data);
    }
    catch (error) {
        next(error);
    }
});
exports.verifyRegistration = verifyRegistration;
