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
exports.createPeerServer = void 0;
const net_1 = __importDefault(require("net"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const fileService_1 = require("./fileService");
// Hàm tạo server peer
const createPeerServer = (peer) => {
    const server = net_1.default.createServer((socket) => {
        // Concurrency not parrallel
        socket.on("data", (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const message = JSON.parse(data.toString().trim());
                if (message.action === "download" &&
                    typeof message.pieceIndex === "number" &&
                    typeof message.filename === "string" // Kiểm tra fileId
                ) {
                    const index = message.pieceIndex;
                    const filename = message.filename;
                    // Extract the filename without the domain and extension
                    const extractedFilename = path_1.default.basename(filename, path_1.default.extname(filename));
                    // Xác định đường dẫn đến file piece
                    const pieceFilePath = `${process.env.FILE_PATH}/${peer.port}/${extractedFilename}/piece_${index}.bin`; // Tạo đường dẫn đến file piece
                    try {
                        // Đọc phần dữ liệu từ file
                        // Check if the piece of file exists
                        if (!(yield (0, fileService_1.checkFileExists)(pieceFilePath))) {
                            console.log(`Piece ${filename}#${index} does not exist`);
                            // Delete the piece peer from the database
                            const deletePeerPiece = yield axios_1.default.delete(`${process.env.API_URL}/piece/delete`, {
                                data: {
                                    ip: peer.ip,
                                    port: peer.port,
                                    filename: filename,
                                    index: index,
                                },
                            });
                            socket.write("ERROR: Piece does not exist");
                            return;
                        }
                        const pieceData = yield promises_1.default.readFile(pieceFilePath);
                        // Gửi phần dữ liệu (piece) cho client
                        socket.write(pieceData);
                        console.log(`Sent piece ${filename}#${index} with size ${pieceData.length} Bytes successfully`);
                        peer.upload = Number(peer.upload) + pieceData.length;
                        yield axios_1.default
                            .patch(`${process.env.API_URL}/peer/update`, {
                            port: peer.port,
                            ip: peer.ip,
                            upload: peer.upload,
                        })
                            .catch((error) => {
                            if (error.response && error.response.status === 400) {
                                console.error("Error:", error.response.data.message);
                            }
                            else {
                                console.error("Unexpected error:", error.message);
                            }
                        });
                    }
                    catch (fileError) {
                        // Kiểm tra kiểu lỗi và lấy thông tin
                        if (fileError instanceof Error) {
                            console.error("Error reading piece file:", fileError.message);
                        }
                        else {
                            console.error("Error reading piece file: Unknown error");
                        }
                        socket.write("ERROR: Failed to read piece file");
                    }
                }
                else {
                    console.log("Received unknown command:", message);
                }
            }
            catch (error) {
                console.log("Failed to parse message:", data.toString());
            }
        }));
    });
    server.listen(peer.port, () => {
        console.log(`Peer listening on port ${peer.port}`);
    });
    return server;
};
exports.createPeerServer = createPeerServer;
