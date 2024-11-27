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
exports.createTorrentFile = void 0;
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
const bencode = require('bencode');
// Hàm để tạo mã hash SHA-1 cho từng piece của tệp
function createPieceHashes(filePath, pieceSize) {
    return new Promise((resolve, reject) => {
        const hashes = [];
        const stream = fs_1.default.createReadStream(filePath, {
            highWaterMark: pieceSize,
        });
        stream.on('data', (chunk) => {
            const hash = crypto_1.default.createHash('sha1');
            hash.update(chunk);
            hashes.push(hash.digest('hex'));
        });
        stream.on('end', () => {
            resolve(hashes);
        });
        stream.on('error', (err) => {
            reject(err);
        });
    });
}
const createTorrentFile = (filePath_1, name_1, outputDir_1, ...args_1) => __awaiter(void 0, [filePath_1, name_1, outputDir_1, ...args_1], void 0, function* (filePath, name, outputDir, pieceSize = 64 * 1024) {
    try {
        // Bước 1: Tạo hashes cho các mảnh dữ liệu
        const hashes = yield createPieceHashes(filePath, pieceSize);
        // Bước 2: Chuyển đổi các hash thành Buffer
        const pieceBuffers = hashes.map((hash) => Buffer.from(hash, 'hex'));
        // Bước 3: Lấy thông tin file
        const fileStats = fs_1.default.statSync(filePath);
        // Bước 4: Tạo object chứa thông tin torrent
        const torrentInfo = {
            name: name,
            length: fileStats.size, // Kích thước file
            pieceLength: pieceSize, // Kích thước mỗi mảnh
            pieces: Buffer.concat(pieceBuffers), // Kết hợp các hash mảnh thành buffer
        };
        // Ghi dữ liệu vào file .torrent
        const torrentFilePath = path_1.default.join(outputDir, `${name}.torrent`);
        const torrentData = bencode.encode(torrentInfo);
        fs_1.default.writeFileSync(torrentFilePath, torrentData);
        console.log(`.torrent file created at: ${torrentFilePath}`);
    }
    catch (error) {
        console.error('Error creating torrent file:', error);
        throw error;
    }
});
exports.createTorrentFile = createTorrentFile;
