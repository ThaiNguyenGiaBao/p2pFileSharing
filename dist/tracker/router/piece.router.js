"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const piece_controller_1 = __importDefault(require("../controller/piece.controller"));
const router = (0, express_1.Router)();
router.post('/register', (0, express_async_handler_1.default)(piece_controller_1.default.registerPiece));
// Get all pieces by torrentId
router.get('/:torrentId', (0, express_async_handler_1.default)(piece_controller_1.default.getPiecesByTorrentId));
//Get all peers by hashPiece
router.get('/peer/:hashPiece', (0, express_async_handler_1.default)(piece_controller_1.default.getPeersByHashPiece));
router.get('/sort/:filename', (0, express_async_handler_1.default)(piece_controller_1.default.sortPieces));
router.delete('/delete', (0, express_async_handler_1.default)(piece_controller_1.default.deletePiecePeer));
exports.default = router;
