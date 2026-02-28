"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const response_util_1 = require("../utils/response.util");
const errorHandler = (err, req, res, next) => {
    console.error(err);
    const status = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    (0, response_util_1.sendError)(res, status, message);
};
exports.errorHandler = errorHandler;
