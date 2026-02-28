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
exports.getTournamentById = exports.getTournaments = void 0;
const tournament_service_1 = require("./tournament.service");
const response_util_1 = require("../../utils/response.util");
const getTournaments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield tournament_service_1.tournamentService.getTournaments();
        (0, response_util_1.sendSuccess)(res, 200, 'Tournaments retrieved', data);
    }
    catch (error) {
        next(error);
    }
});
exports.getTournaments = getTournaments;
const getTournamentById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const data = yield tournament_service_1.tournamentService.getTournamentById(id);
        (0, response_util_1.sendSuccess)(res, 200, 'Tournament retrieved', data);
    }
    catch (error) {
        next(error);
    }
});
exports.getTournamentById = getTournamentById;
