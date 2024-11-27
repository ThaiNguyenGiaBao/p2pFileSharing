"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const torrentfile_controller_1 = __importDefault(require("../controller/torrentfile.controller"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const router = (0, express_1.Router)();
// Register a file
router.post("/register", (0, express_async_handler_1.default)(torrentfile_controller_1.default.register));
// Get a torrentfile by filename
router.get("/:filename", (0, express_async_handler_1.default)(torrentfile_controller_1.default.getTorrentFile));
// Get all torrentfiles
router.get("/", (0, express_async_handler_1.default)(torrentfile_controller_1.default.getTorrentFiles));
exports.default = router;
