"use strict";
// // filePiecesManager.ts
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
exports.getFilePiece = exports.saveFilePiece = exports.getFilePieces = void 0;
exports.loadFilePieces = loadFilePieces;
// import { readFile } from 'fs/promises'; // Import các hàm từ fs/promises
// const filePiecesMap: Map<string, Buffer[]> = new Map();
// export const getFilePieces = (fileId: string): Buffer[] | undefined => {
//     return filePiecesMap.get(fileId);
// };
// export const setFilePieces = (fileId: string, pieces: Buffer[]): void => {
//     filePiecesMap.set(fileId, pieces);
// };
// export const updateFilePiece = (
//     fileId: string,
//     index: number,
//     piece: Buffer
// ): void => {
//     const pieces = filePiecesMap.get(fileId);
//     if (pieces && index >= 0 && index < pieces.length) {
//         pieces[index] = piece;
//     }
// };
// // Hàm chia nhỏ file thành các phần (pieces) và lưu vào Map
// export async function loadFilePieces(
//     filename: string,
//     filePath: string,
//     pieceSize: number
// ) {
//     const fileBuffer = await readFile(filePath);
//     const pieces: Buffer[] = [];
//     for (let i = 0; i < fileBuffer.length; i += pieceSize) {
//         pieces.push(fileBuffer.slice(i, i + pieceSize));
//     }
//     filePiecesMap.set(filename, pieces);
// }
const promises_1 = require("fs/promises"); // Nhập trực tiếp các hàm từ fs/promises
const path_1 = __importDefault(require("path"));
// Hàm lấy tất cả các file chứa các phần
const getFilePieces = (fileId) => __awaiter(void 0, void 0, void 0, function* () {
    const piecesDirectory = path_1.default.join(__dirname, fileId);
    // Trả về danh sách các file trong thư mục
    return yield (0, promises_1.readdir)(piecesDirectory);
});
exports.getFilePieces = getFilePieces;
// Hàm lưu một piece vào file
const saveFilePiece = (filePath, index, piece) => __awaiter(void 0, void 0, void 0, function* () {
    // Tạo thư mục nếu chưa tồn tại
    const dirPath = path_1.default.dirname(filePath); // Lấy đường dẫn thư mục cha
    const baseName = path_1.default.basename(filePath, path_1.default.extname(filePath)); // Lấy tên file không có phần mở rộng
    // console.log(dirPath);
    const newDirPath = path_1.default.join(dirPath, baseName); // Tạo đường dẫn mới cho thư mục
    yield (0, promises_1.mkdir)(newDirPath, { recursive: true });
    const pieceFilePath = path_1.default.join(newDirPath, `piece_${index}.bin`); // Tên file cho từng piece
    yield (0, promises_1.writeFile)(pieceFilePath, piece);
});
exports.saveFilePiece = saveFilePiece;
// Hàm lấy một piece từ file
const getFilePiece = (fileId, index) => __awaiter(void 0, void 0, void 0, function* () {
    const pieceFilePath = path_1.default.join(__dirname, fileId, `piece_${index}.bin`);
    try {
        const pieceBuffer = yield (0, promises_1.readFile)(pieceFilePath);
        return pieceBuffer;
    }
    catch (error) {
        console.error(`Error reading piece file ${pieceFilePath}:`, error);
        return null;
    }
});
exports.getFilePiece = getFilePiece;
// Hàm chia nhỏ file thành các phần (pieces) và lưu vào file
function loadFilePieces(filePath, pieceSize) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileBuffer = yield (0, promises_1.readFile)(filePath);
        const numberOfPieces = Math.ceil(fileBuffer.length / pieceSize);
        for (let i = 0; i < numberOfPieces; i++) {
            const piece = fileBuffer.slice(i * pieceSize, (i + 1) * pieceSize);
            yield (0, exports.saveFilePiece)(filePath, i, piece); // Lưu từng phần vào file riêng
        }
    });
}
