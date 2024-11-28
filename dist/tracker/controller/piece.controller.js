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
class PieceController {
    //     router.post("/register", asyncHandler(PieceController.registerPiece));
    static registerPiece(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(req.body);
            const { hash, torrentFileId, size, index, peerId } = req.body;
            console.log("Piece::", hash, torrentFileId, size, index, peerId);
            if (!hash || !torrentFileId || !size || index == undefined || !peerId) {
                res.status(400).json({
                    message: "Add hash, torrentFileId, size, index, peerId",
                });
                return;
            }
            try {
                // Check the index of the piece
                const piece = yield initDb_1.default.query("SELECT * FROM piece WHERE hash = $1 AND index = $2", [hash, index]);
                //console.log("Piece::", piece);
                // Piece does not exist
                if (piece.rows.length == 0) {
                    const newPiece = yield initDb_1.default.query("INSERT INTO piece (hash, torrentId, size, index) VALUES ($1, $2, $3, $4) RETURNING *", [hash, torrentFileId, size, index]);
                    console.log("New piece::", newPiece.rows[0]);
                    // Register the peerPiece
                    const peerPiece = yield initDb_1.default.query("INSERT INTO peerPieceR (peerId, hashPiece) VALUES ($1, $2) RETURNING *", [peerId, hash]);
                    console.log("PeerPiece::", peerPiece.rows[0]);
                    res.status(201).json(newPiece.rows[0]);
                    return;
                }
                if (piece.rows[0].hash != hash) {
                    res.status(400).json({
                        message: "Checksum error. The hash of this piece is not similar to the registered one!",
                    });
                    return;
                }
                // peerPiece already exists
                const peerPiece1 = yield initDb_1.default.query("SELECT * FROM peerPieceR WHERE peerId = $1 AND hashPiece = $2", [peerId, hash]);
                if (peerPiece1.rows.length != 0) {
                    // res.status(400).json({
                    //   message: "Peer already registered this piece",
                    // });
                    return;
                }
                // Register the peerPiece
                const peerPiece = yield initDb_1.default.query("INSERT INTO peerPieceR (peerId, hashPiece) VALUES ($1, $2) RETURNING *", [peerId, hash]);
                console.log("PeerPiece::", peerPiece.rows[0]);
                res.status(201).json(piece.rows[0]);
            }
            catch (err) {
                console.error(err);
                res.status(500).send(err.message);
            }
        });
    }
    // // Get all peers by hashPiece
    // router.get("/peer/:hashPiece", asyncHandler(PieceController.getPeersByHashPiece));
    static getPeersByHashPiece(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashPiece = req.params.hashPiece;
            if (!hashPiece) {
                res.status(400).send("Add hashPiece");
                return;
            }
            try {
                // Check if the piece not exists
                const piece = yield initDb_1.default.query("SELECT * FROM piece WHERE hash = $1", [
                    hashPiece,
                ]);
                if (piece.rows.length == 0) {
                    res.status(400).json({ message: "Piece not found" });
                    return;
                }
                const peerList = yield initDb_1.default.query("select Peer.id, ip, port, download, upload from PeerPieceR join Peer on peerId = Peer.id where hashPiece = $1", [hashPiece]);
                console.log("Peer list::", peerList.rows);
                res.status(200).json(peerList.rows);
            }
            catch (err) {
                console.error(err.message);
                res.status(500).send(err.message);
            }
        });
    }
    //   // Get all pieces by torrentId
    // router.get(
    //     ":torrentId",
    //     asyncHandler(PieceController.getPiecesByTorrentId)
    //   );
    static sortPieces(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // sort pieces by number of peers that have the piece
            try {
                const filename = req.params.filename;
                const sortedPieces = yield initDb_1.default.query("select hash, index, count(*) from piece join torrentfile t on t.id = torrentid join peerPieceR on hashPiece = hash where filename = $1 group by index, t.filename, hash order by count(*) asc", [filename]);
                res.status(200).json(sortedPieces.rows);
            }
            catch (err) {
                res.status(500).send({ message: err.message });
            }
        });
    }
    static getPiecesByTorrentId(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const torrentId = req.params.torrentId;
            if (!torrentId) {
                res.status(400).send("Add torrentId");
                return;
            }
            try {
                const pieces = yield initDb_1.default.query("SELECT * FROM piece WHERE torrentId = $1", [torrentId]);
                res.status(200).json(pieces.rows);
            }
            catch (err) {
                console.error(err);
                res.status(500).send(err.message);
            }
        });
    }
    static deletePiecePeer(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { ip, port, filename, index } = req.body;
            if (!ip || !ip || !filename || index == undefined) {
                res.status(400).json({
                    message: "Add ip, port, filename, index",
                });
                return;
            }
            const peerId = yield initDb_1.default.query("SELECT id FROM peer WHERE ip = $1 AND port = $2", [ip, port]);
            console.log("PeerId::", peerId.rows);
            if (peerId.rows.length == 0) {
                res.status(400).json({
                    message: "Peer not found",
                });
                return;
            }
            const hashPiece = yield initDb_1.default.query("SELECT hash FROM piece JOIN torrentfile ON torrentId = torrentfile.id WHERE filename = $1 AND index = $2", [filename, index]);
            console.log("HashPiece::", hashPiece.rows);
            if (hashPiece.rows.length == 0) {
                res.status(400).json({
                    message: "Piece not found",
                });
                return;
            }
            try {
                const peerPiece = yield initDb_1.default.query("DELETE FROM peerPieceR WHERE peerId = $1 AND hashPiece = $2 RETURNING *", [peerId.rows[0].id, hashPiece.rows[0].hash]);
                if (peerPiece.rows.length == 0) {
                    res.status(400).json({
                        message: "PeerPiece not found",
                    });
                    return;
                }
                res.status(200).json(peerPiece.rows[0]);
            }
            catch (err) {
                console.error(err);
                res.status(500).send(err.message);
            }
        });
    }
}
exports.default = PieceController;
