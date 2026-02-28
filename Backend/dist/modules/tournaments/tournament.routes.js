"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tournament_controller_1 = require("./tournament.controller");
const router = (0, express_1.Router)();
router.get('/', tournament_controller_1.getTournaments);
router.get('/:id', tournament_controller_1.getTournamentById);
exports.default = router;
