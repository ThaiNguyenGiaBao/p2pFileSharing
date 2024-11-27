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
exports.checkPieceExist = exports.getFileSize = exports.checkFileExists = void 0;
const promises_1 = require("fs/promises"); // Import các hàm từ fs/promises
const path_1 = __importDefault(require("path"));
// Hàm kiểm tra file có tồn tại hay không
const checkFileExists = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, promises_1.access)(filePath);
        return true;
    }
    catch (err) {
        return false;
    }
});
exports.checkFileExists = checkFileExists;
// Hàm lấy kích thước của file
const getFileSize = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield (0, promises_1.stat)(filePath);
        return stats.size;
    }
    catch (err) {
        console.error("Error getting file size:", err);
        throw err;
    }
});
exports.getFileSize = getFileSize;
// Check if the piece of file exists
const checkPieceExist = (port, filename, index) => __awaiter(void 0, void 0, void 0, function* () {
    const extractedFilename = path_1.default.basename(filename, path_1.default.extname(filename));
    const pieceFilePath = `${process.env.FILE_PATH}/${port}/${extractedFilename}/piece_${index}.bin`;
    return (0, exports.checkFileExists)(pieceFilePath);
});
exports.checkPieceExist = checkPieceExist;
