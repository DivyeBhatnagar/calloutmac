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
exports.respondToQuery = exports.getAllQueries = void 0;
const query_service_1 = require("./query.service");
const response_util_1 = require("../../utils/response.util");
const getAllQueries = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield query_service_1.queryService.getAllQueries();
        (0, response_util_1.sendSuccess)(res, 200, 'All queries retrieved', data);
    }
    catch (error) {
        next(error);
    }
});
exports.getAllQueries = getAllQueries;
const respondToQuery = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const { adminResponse } = req.body;
        const data = yield query_service_1.queryService.respondToQuery(id, adminResponse);
        (0, response_util_1.sendSuccess)(res, 200, 'Query responded to', data);
    }
    catch (error) {
        next(error);
    }
});
exports.respondToQuery = respondToQuery;
