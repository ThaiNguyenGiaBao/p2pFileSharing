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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const initDb_1 = __importDefault(require("../database/initDb"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class TorrentFileController {
    //  // Register a file
    // router.post("/register", asyncHandler(TorrentFileController.register));
    static register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(req.body);
            const { filename, size, pieceSize } = req.body;
            if (!filename || !size || !pieceSize) {
                res.status(400).json({
                    message: "Add filename, size and pieceSize",
                });
                return;
            }
            try {
                const torrentFile = yield initDb_1.default.query("SELECT * FROM torrentfile WHERE filename = $1", [filename]);
                if (torrentFile.rows.length != 0) {
                    res.status(200).json(torrentFile.rows[0]);
                    return;
                }
                const newTorrentFile = yield initDb_1.default.query("INSERT INTO torrentfile (filename, size, pieceSize) VALUES ($1, $2, $3) RETURNING *", [filename, size, pieceSize]);
                console.log("File registered::", newTorrentFile.rows[0]);
                res.status(201).json(newTorrentFile.rows[0]);
            }
            catch (err) {
                console.error(err);
                res.status(500).send(err.message);
            }
        });
    }
    // // Get all torrentfiles
    // router.get("/get", asyncHandler(TorrentFileController.getTorrentFiles));
    static getTorrentFiles(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const torrentFiles = yield initDb_1.default.query("SELECT * FROM torrentfile");
                res.status(200).json(torrentFiles.rows);
            }
            catch (err) {
                console.error(err);
                res.status(500).send(err.message);
            }
        });
    }
    // // Get a torrentfile by filename
    // router.get("/:filename", asyncHandler(TorrentFileController.getTorrentFile));
    static getTorrentFile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const filename = req.params.filename;
            if (!filename) {
                res.status(400).send("Add filename");
                return;
            }
            try {
                const torrentFile = yield initDb_1.default.query("SELECT * FROM torrentfile WHERE filename = $1", [filename]);
                if (torrentFile.rows.length == 0) {
                    res.status(400).json({ message: "File not found" });
                    return;
                }
                res.status(200).json(torrentFile.rows[0]);
            }
            catch (err) {
                console.error(err);
                res.status(500).send(err.message);
            }
        });
    }
}
exports.default = TorrentFileController;
