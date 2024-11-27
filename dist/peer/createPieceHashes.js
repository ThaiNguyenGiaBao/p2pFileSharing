"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPieceHashes = createPieceHashes;
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
// Hàm để tạo mã hash SHA-1 cho từng piece của tệp
function createPieceHashes(filePath, pieceSize) {
    return new Promise((resolve, reject) => {
        const hashes = [];
        const sizes = []; // Mảng để lưu kích thước của từng piece
        const stream = fs_1.default.createReadStream(filePath, {
            highWaterMark: pieceSize,
        });
        stream.on('data', (chunk) => {
            const hash = crypto_1.default.createHash('sha1');
            hash.update(chunk);
            hashes.push(hash.digest('hex'));
            sizes.push(chunk.length); // Lưu kích thước của từng chunk
        });
        stream.on('end', () => {
            resolve({ hashes, sizes }); // Trả về cả hashes và sizes
        });
        stream.on('error', (err) => {
            reject(err);
        });
    });
}
