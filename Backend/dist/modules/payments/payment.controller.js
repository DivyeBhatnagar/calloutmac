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
exports.webhook = exports.verifyPayment = exports.createOrder = void 0;
const payment_service_1 = require("./payment.service");
const response_util_1 = require("../../utils/response.util");
const createOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield payment_service_1.paymentService.createOrder(req.user.id, req.body);
        (0, response_util_1.sendSuccess)(res, 201, 'Order created', data);
    }
    catch (error) {
        next(error);
    }
});
exports.createOrder = createOrder;
const verifyPayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield payment_service_1.paymentService.verifyPayment(req.body);
        (0, response_util_1.sendSuccess)(res, 200, 'Payment verified', data);
    }
    catch (error) {
        next(error);
    }
});
exports.verifyPayment = verifyPayment;
const webhook = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const signature = req.headers['x-razorpay-signature'];
        yield payment_service_1.paymentService.handleWebhook(req.body, signature);
        res.status(200).send('Webhook received');
    }
    catch (error) {
        next(error);
    }
});
exports.webhook = webhook;
