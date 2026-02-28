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
exports.getTournamentAnalytics = exports.getUserAnalytics = exports.getRevenueAnalytics = void 0;
const analytics_service_1 = require("./analytics.service");
const response_util_1 = require("../../utils/response.util");
const getRevenueAnalytics = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield analytics_service_1.analyticsService.getRevenueAnalytics();
        (0, response_util_1.sendSuccess)(res, 200, 'Revenue analytics retrieved', data);
    }
    catch (error) {
        next(error);
    }
});
exports.getRevenueAnalytics = getRevenueAnalytics;
const getUserAnalytics = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield analytics_service_1.analyticsService.getUserAnalytics();
        (0, response_util_1.sendSuccess)(res, 200, 'User analytics retrieved', data);
    }
    catch (error) {
        next(error);
    }
});
exports.getUserAnalytics = getUserAnalytics;
const getTournamentAnalytics = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield analytics_service_1.analyticsService.getTournamentAnalytics();
        (0, response_util_1.sendSuccess)(res, 200, 'Tournament analytics retrieved', data);
    }
    catch (error) {
        next(error);
    }
});
exports.getTournamentAnalytics = getTournamentAnalytics;
