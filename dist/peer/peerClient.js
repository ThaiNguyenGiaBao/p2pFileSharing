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
exports.downloadFile = void 0;
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const path_1 = __importDefault(require("path"));
const worker_threads_1 = require("worker_threads");
const progress_1 = __importDefault(require("progress"));
const fileService_1 = require("./fileService");
// // Hàm tải xuống một phần (piece) của tệp từ một peer
// const downloadPieceFromPeer = async (
//   peer: Peer,
//   pieceIndex: number,
//   filename: string,
//   filePath: string
// ): Promise<boolean> => {
//   return new Promise((resolve) => {
//     const client = net.createConnection(
//       { port: peer.port, host: peer.ip },
//       () => {
//         console.log(
//           `Connected to peer ip:${peer.ip}, port:${peer.port} to download piece ${pieceIndex}`
//         );
//         // Yêu cầu peer gửi phần của tệp
//         client.write(
//           JSON.stringify({ action: "download", pieceIndex, filename })
//         );
//         client.on("data", (data) => {
//           //console.log(data.toString());
//           const message = data.toString();
//           // Lưu phần tải xuống vào tệp
//           if (message.startsWith("ERROR:")) {
//             console.error(`Received error from donwloaded peer: ${message}`);
//             // Trả về false khi có lỗi
//             resolve(false);
//             return; // Thoát khỏi callback
//           }
//           // Trả về true khi tải xuống thành công
//           resolve(true);
//           client.end();
//         });
//       }
//     );
//     client.on("error", (err) => {
//       console.log(
//         `Error connecting to peer ip:${peer.ip}, port:${peer.port}: ${err.message}`
//       );
//       resolve(false); // Trả về false khi có lỗi kết nối
//     });
//   });
// };
// Hàm bắt đầu tải xuống tệp
const downloadFile = (filename, myPeer) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const validFilePath = (_a = process.env.FILE_PATH) !== null && _a !== void 0 ? _a : "src/peer";
        const filePath = path_1.default.join(validFilePath, myPeer.port.toString(), filename);
        const dir = path_1.default.dirname(filePath);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true }); // Tạo thư mục với tùy chọn recursive
        }
        // Tạo tệp trống nếu chưa tồn tại
        if (!fs_1.default.existsSync(filePath)) {
            fs_1.default.writeFileSync(filePath, ""); // Tạo tệp trống
        }
        // Lấy torrent file từ tracker bằng filename
        const torrentFileResponse = yield axios_1.default.get(`${process.env.API_URL}/torrentfile/${filename}`);
        const torrentFile = torrentFileResponse.data;
        // Lấy danh sách các phần (pieces) của tệp
        const pieceListResponse = yield axios_1.default.get(`${process.env.API_URL}/piece/${torrentFile.id}`);
        const pieces = pieceListResponse.data;
        console.log(`Found ${pieces.length} pieces for the file ${filename}.`);
        const workers = [];
        // Declare a list to store the downloaded piece data with the size = pieces.length
        const pieceFileDataList = new Array(pieces.length);
        const bar = new progress_1.default("[:bar] :percent Downloaded piece #:idx with size :size Bytes from peer ip: :ip, port: :port successfully", {
            total: pieces.length,
            width: 20,
            complete: "#",
            incomplete: "-",
        });
        // Tải xuống từng phần của tệp từ các peer
        let isUpdating = false;
        // Rarest first
        const { data } = yield axios_1.default.get(`${process.env.API_URL}/piece/sort/${filename}`);
        const sortedPieces = data;
        const sortedPieceIndex = sortedPieces.map((p) => p.index);
        for (let idx = 0; idx < pieces.length; idx++) {
            const pieceIndex = sortedPieceIndex[idx];
            //console.log(`Downloading piece #${pieceIndex}...`);
            // Check if the piece has been downloaded
            const extractedFilename = path_1.default.basename(filename, path_1.default.extname(filename));
            const pieceFilePath = `${dir}/${extractedFilename}/piece_${pieceIndex}.bin`;
            if (yield (0, fileService_1.checkPieceExist)(myPeer.port, filename, pieceIndex)) {
                //console.log(`Piece #${pieceIndex} has been downloaded`);
                const pieceData = fs_1.default.readFileSync(pieceFilePath);
                bar.tick({
                    idx: pieceIndex,
                    size: pieceData.length,
                    ip: myPeer.ip,
                    port: myPeer.port,
                });
                pieceFileDataList[pieceIndex] = pieceData;
                continue;
            }
            const worker = new worker_threads_1.Worker("./src/peer/workerDownloadPiece.mjs", {
                workerData: {
                    piece: pieces[pieceIndex],
                    myPeer,
                    filename,
                    filePath,
                    pieceIndex,
                },
            });
            worker.on("message", (message) => __awaiter(void 0, void 0, void 0, function* () {
                if (message.success) {
                    while (isUpdating) {
                        yield new Promise((resolve) => setTimeout(resolve, 1));
                    }
                    isUpdating = true; // Acquire lock
                    bar.tick({
                        idx: message.pieceIndex,
                        size: message.data.length,
                        ip: message.ip,
                        port: message.port,
                    });
                    pieceFileDataList[message.pieceIndex] = message.data;
                    isUpdating = false; // Release lock
                }
                else {
                    console.log(`Failed to download piece #${message.pieceIndex}`);
                }
            }));
            worker.on("error", (error) => {
                console.error("Worker error:", error);
            });
            worker.on("exit", (code) => {
                if (code !== 0) {
                    console.error(`Worker stopped with exit code ${code}`);
                }
            });
            workers.push(worker);
        }
        // Wait for all workers to finish
        const workerPromises = workers.map((worker) => {
            return new Promise((resolve) => {
                worker.on("exit", () => {
                    resolve(null);
                });
            });
        });
        yield Promise.all(workerPromises);
        // Fail if any piece is missing
        if (pieceFileDataList.length !== pieces.length) {
            console.error("Failed to download the file");
            return;
        }
        for (let i = 0; i < pieceFileDataList.length; i++) {
            fs_1.default.appendFileSync(filePath, pieceFileDataList[i], { flag: "a" });
        }
        console.log(`File ${filename} has been downloaded successfully!`);
    }
    catch (err) {
        if (err.response) {
            console.error("Error:", err.response.data.message);
        }
    }
});
exports.downloadFile = downloadFile;
