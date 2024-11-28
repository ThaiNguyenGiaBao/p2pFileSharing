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
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const createPieceHashes_1 = require("./createPieceHashes");
const fileService_1 = require("./fileService");
const filePiecesManager_1 = require("./filePiecesManager");
const progress_1 = __importDefault(require("progress"));
dotenv_1.default.config();
class TrackerAPI {
    static getFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield axios_1.default.get(`${process.env.API_URL}/torrentfile`);
                return res.data;
            }
            catch (err) {
                console.error(err.message);
                return [];
            }
        });
    }
    static registerPeer(ip, port) {
        return __awaiter(this, void 0, void 0, function* () {
            let peer = null;
            yield axios_1.default
                .post(`${process.env.API_URL}/peer/register`, { ip, port })
                .then((res) => {
                peer = res.data;
                console.log("Peer registered successfully!");
            })
                .catch((error) => {
                if (error.response && error.response.status === 400) {
                    // Kiểm tra nếu mã lỗi là 400
                    console.error("Error:", error.response.data.message); // Sẽ hiển thị "Peer already registered"
                }
                else {
                    // Xử lý các lỗi khác
                    console.error("Unexpected error:", error.message);
                }
            });
            return peer;
        });
    }
    // Đăng kí file với tracker
    static registerFile(peer, fileName, port) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const filePath = `${process.env.FILE_PATH}/${port}/${fileName}`;
                const isFileExist = yield (0, fileService_1.checkFileExists)(filePath);
                const pieceSize = 64 * 1024;
                if (isFileExist) {
                    const fileSize = yield (0, fileService_1.getFileSize)(filePath);
                    // Chia file thành các phần (pieces) và lưu vào thư mục
                    yield (0, filePiecesManager_1.loadFilePieces)(filePath, pieceSize);
                    yield axios_1.default
                        .post(`${process.env.API_URL}/torrentfile/register`, {
                        filename: fileName,
                        size: fileSize,
                        pieceSize,
                    })
                        .then((res) => __awaiter(this, void 0, void 0, function* () {
                        const { hashes, sizes } = yield (0, createPieceHashes_1.createPieceHashes)(filePath, pieceSize);
                        const bar = new progress_1.default("[:bar] :percent Registering :filename #:idx with size :size Bytes successfully", {
                            total: hashes.length,
                            width: 20,
                            complete: "#",
                            incomplete: "-",
                        });
                        for (let i = 0; i < hashes.length; i++) {
                            try {
                                yield axios_1.default.post(`${process.env.API_URL}/piece/register`, {
                                    hash: hashes[i],
                                    torrentFileId: res.data.id,
                                    size: sizes[i],
                                    index: i,
                                    peerId: peer.id,
                                });
                            }
                            catch (err) {
                                if (err.response && err.response.status === 400) {
                                }
                                else {
                                    console.error("Unexpected error: Internal Server Error");
                                }
                            }
                            bar.tick({ idx: i, size: sizes[i], filename: fileName });
                        }
                        console.log("Torrent file registered successfully!");
                    }))
                        .catch((error) => {
                        if (error.response && error.response.status === 400) {
                            console.error("Error:", error.response.data.message);
                        }
                        else {
                            console.error("Unexpected error: Internal Server Error");
                        }
                    });
                }
                else {
                    console.log("File does not exist");
                }
            }
            catch (e) {
                console.error("Error:", e.message);
            }
        });
    }
    static startPeer(ip, port) {
        return __awaiter(this, void 0, void 0, function* () {
            let peer = null;
            yield axios_1.default
                .patch(`${process.env.API_URL}/peer/update`, {
                port: port,
                ip: ip,
                isOnline: true,
            })
                .then((res) => {
                peer = res.data;
                // peer.id = res.data.id;
                // peer.upload = res.data.upload;
                // peer.download = res.data.download;
            })
                .catch((error) => {
                if (error.response && error.response.status === 400) {
                    console.error("Error:", error.response.data.message);
                }
                else {
                    console.error("Unexpected error: Internal server error");
                }
            });
            return peer;
        });
    }
    static getPeersFromFilename(rl) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                // Get filename from input
                rl.question("Enter filename: ", (filename) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const res = yield axios_1.default.get(`${process.env.API_URL}/file/get/${filename}`);
                        console.log(res.data);
                        resolve(res.data); // Trả về dữ liệu từ API
                    }
                    catch (err) {
                        console.error(err.message);
                        reject(err); // Nếu có lỗi, reject promise
                    }
                }));
            });
        });
    }
}
exports.default = TrackerAPI;
