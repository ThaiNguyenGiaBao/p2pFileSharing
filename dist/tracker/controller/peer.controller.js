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
class PeerController {
    static register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { ip, port } = req.body;
            if (!ip || !port) {
                res.status(400).json({ message: "Add ip and port" });
                return;
            }
            try {
                const peer = yield initDb_1.default.query("SELECT * FROM peer WHERE ip = $1 AND port = $2", [ip, port]);
                if (peer.rows.length != 0) {
                    res.status(400).json({ message: "Peer already registered" });
                    return;
                }
                const newPeer = yield initDb_1.default.query("INSERT INTO peer (ip, port) VALUES ($1, $2) RETURNING *", [ip, port]);
                console.log("Peer registered::", newPeer.rows[0]);
                res.status(201).json(newPeer.rows[0]);
            }
            catch (err) {
                console.error(err);
                res.status(500).send(err.message);
            }
        });
    }
    static getMe(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const ip = req.query.ip;
            const port = req.query.port;
            if (!ip || !port) {
                res.status(400).json({ message: "Add ip and port" });
                return;
            }
            try {
                const peer = yield initDb_1.default.query("SELECT * FROM peer WHERE ip = $1 AND port = $2", [ip, port]);
                if (peer.rows.length == 0) {
                    res.status(400).json({ message: "Peer not found" });
                    return;
                }
                res.status(200).json(peer.rows[0]);
            }
            catch (err) {
                console.error(err);
                res.status(500).send(err.message);
            }
        });
    }
    static get(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const peerId = req.params.peerId;
            if (!peerId) {
                res.status(400).send("Add peerId");
                return;
            }
            try {
                const peer = yield initDb_1.default.query("SELECT * FROM peer p JOIN peerpiecer pe on pe.peerid = p.id join piece on hashpiece = hash JOIN torrentfile t on t.id = torrentid  WHERE p.id = $1 ", [peerId]);
                if (peer.rows.length == 0) {
                    res.status(400).json({ message: "Peer not found" });
                    return;
                }
                res.status(200).json(peer.rows);
            }
            catch (err) {
                console.error(err);
                res.status(500).send(err.message);
            }
        });
    }
    static getAll(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const peers = yield initDb_1.default.query("SELECT * FROM peer");
                res.status(200).json(peers.rows);
            }
            catch (err) {
                console.error(err);
                res.status(500).send(err.message);
            }
        });
    }
    static delete(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const peerId = req.params.peerId;
            if (!peerId) {
                res.status(400).send("Add peerId");
                return;
            }
            try {
                const peer = yield initDb_1.default.query("DELETE FROM peer WHERE id = $1", [peerId]);
                if (peer.rowCount == 0) {
                    res.status(400).json({ message: "Peer not found" });
                    return;
                }
                res.status(200).json({ message: "Peer deleted" });
            }
            catch (err) {
                console.error(err);
                res.status(500).send(err.message);
            }
        });
    }
    static update(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { ip, port, isOnline, upload, download } = req.body;
            // Only update the fields that not null
            const values = [];
            if (isOnline != null) {
                values.push(`isOnline = ${isOnline}`);
            }
            if (upload != null) {
                values.push(`upload = ${upload}`);
            }
            if (download != null) {
                values.push(`download = ${download}`);
            }
            console.log("Values::", values.join(", "));
            try {
                const peer = yield initDb_1.default.query(`UPDATE peer SET ${values.join(", ")} WHERE port = $1 AND ip = $2 RETURNING *`, [port, ip]);
                if (peer.rows.length == 0) {
                    res.status(400).json({ message: "Peer not found" });
                    return;
                }
                console.log("Peer updated::", peer.rows[0]);
                res.status(200).json(peer.rows[0]);
            }
            catch (err) {
                console.error(err);
                res.status(500).send(err.message);
            }
        });
    }
}
exports.default = PeerController;
