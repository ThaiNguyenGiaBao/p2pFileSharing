import fs from 'fs';
import crypto from 'crypto';

// Hàm để tạo mã hash SHA-1 cho từng piece của tệp
const createPieceHashes = (
    filePath: string,
    pieceSize: number
): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        const hashes: string[] = [];
        const stream = fs.createReadStream(filePath, {
            highWaterMark: pieceSize,
        });

        stream.on('data', (chunk) => {
            const hash = crypto.createHash('sha1');
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
};

// Hàm để tạo magnet link từ các mã hash của các piece
const createMagnetLink = async (
    filePath: string,
    name: string,
    pieceSize: number
): Promise<string> => {
    try {
        const hashes = await createPieceHashes(filePath, pieceSize);
        const magnetLink = `magnet:?xt=urn:btih:${hashes.join(
            ','
        )}&dn=${encodeURIComponent(name)}`;
        return magnetLink;
    } catch (error) {
        console.error('Error creating magnet link:', error);
        throw error;
    }
};

export { createMagnetLink };

// Sử dụng hàm để tạo magnet link
// const filePath = 'path/to/your/file.ext';
// const fileName = 'example-file.ext';
// const pieceSize = 512 * 1024; // 512KB

// createMagnetLink(filePath, fileName, pieceSize)
//     .then((link) => {
//         console.log('Magnet Link:', link);
//     })
//     .catch((error) => {
//         console.error('Failed to create magnet link:', error);
//     });
