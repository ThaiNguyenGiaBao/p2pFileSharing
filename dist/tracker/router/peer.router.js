"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const peer_controller_1 = __importDefault(require("../controller/peer.controller"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const router = (0, express_1.Router)();
router.post("/register", (0, express_async_handler_1.default)(peer_controller_1.default.register));
router.get("/get/:peerId", (0, express_async_handler_1.default)(peer_controller_1.default.get));
router.get("/get", (0, express_async_handler_1.default)(peer_controller_1.default.getAll));
router.patch("/update", (0, express_async_handler_1.default)(peer_controller_1.default.update));
router.get("/me", (0, express_async_handler_1.default)(peer_controller_1.default.getMe));
exports.default = router;
