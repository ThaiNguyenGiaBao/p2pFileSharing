import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
// import bencode from 'bencode/index.js';
const bencode = require('bencode');

// Hàm để tạo mã hash SHA-1 cho từng piece của tệp

function createPieceHashes(
    filePath: string,
    pieceSize: number
): Promise<{ hashes: string[]; sizes: number[] }> {
    return new Promise((resolve, reject) => {
        const hashes: string[] = [];
        const sizes: number[] = []; // Mảng để lưu kích thước của từng piece
        const stream = fs.createReadStream(filePath, {
            highWaterMark: pieceSize,
        });

        stream.on('data', (chunk) => {
            const hash = crypto.createHash('sha1');
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

// const createTorrentFile = async (
//     filePath: string,
//     name: string,
//     trackerUrl: string,
//     outputDir: string,
//     pieceSize: number = 512 * 1024
// ): Promise<void> => {
//     try {
//         // Bước 1: Tạo hashes cho các mảnh dữ liệu
//         const hashes = await createPieceHashes(filePath, pieceSize);

//         // Bước 2: Chuyển đổi các hash thành Buffer
//         const pieceBuffers = hashes.map((hash) => Buffer.from(hash, 'hex'));

//         // Bước 3: Lấy thông tin file
//         const fileStats = fs.statSync(filePath);

//         // Bước 4: Tạo object chứa thông tin torrent
//         const torrentInfo = {
//             name: name,
//             length: fileStats.size, // Kích thước file
//             pieceLength: pieceSize, // Kích thước mỗi mảnh
//             pieces: Buffer.concat(pieceBuffers), // Kết hợp các hash mảnh thành buffer
//             announce: trackerUrl, // Địa chỉ tracker
//         };

//         // Ghi dữ liệu vào file .torrent
//         const torrentFilePath = path.join(outputDir, `${name}.torrent`);
//         const torrentData = bencode.encode(torrentInfo);
//         fs.writeFileSync(torrentFilePath, torrentData);
//         console.log(`.torrent file created at: ${torrentFilePath}`);
//     } catch (error) {
//         console.error('Error creating torrent file:', error);
//         throw error;
//     }
// };

export { createPieceHashes };
