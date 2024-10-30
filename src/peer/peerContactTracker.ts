import axios from 'axios';
import readline from 'readline';
import dotenv from 'dotenv';
import { Peer, File } from '../types';

import { createPieceHashes } from './createPieceHashes';
import { checkFileExists, getFileSize } from './fileService';
import { loadFilePieces } from './filePiecesManager';
dotenv.config();
const registerPeer = async (peer: Peer) => {
    await axios
        .post(`${process.env.API_URL}/peer/register`, peer)
        .then((res) => {
            console.log(res.data);
            peer.id = res.data.id;
        })
        .catch((error) => {
            if (error.response && error.response.status === 400) {
                // Kiểm tra nếu mã lỗi là 400
                console.error('Error:', error.response.data.message); // Sẽ hiển thị "Peer already registered"
            } else {
                // Xử lý các lỗi khác
                console.error('Unexpected error:', error.message);
            }
        });
};
// Đăng kí file với tracker
const registerFile = async (peer: Peer, fileName: string, filePath: string) => {
    try {
        filePath = `${process.env.FILE_PATH}/${filePath}/${fileName}`;
        const isFileExist = await checkFileExists(filePath);
        const pieceSize = 512 * 1024;

        if (isFileExist) {
            const fileSize = await getFileSize(filePath);
            // Chia file thành các phần (pieces) và lưu vào
            await loadFilePieces(fileName, filePath, pieceSize);
            await axios
                .post(`${process.env.API_URL}/torrentfile/register`, {
                    filename: fileName,
                    size: fileSize,
                    pieceSize,
                })
                .then(async (res) => {
                    const { hashes, sizes } = await createPieceHashes(
                        filePath,
                        pieceSize
                    );

                    for (let i = 0; i < hashes.length; i++) {
                        await axios.post(
                            `${process.env.API_URL}/piece/register`,
                            {
                                hash: hashes[i],
                                torrentFileId: res.data.id,
                                size: sizes[i],
                                index: i,
                                peerId: peer.id,
                            }
                        );
                    }
                })
                .catch((error) => {
                    if (error.response && error.response.status === 400) {
                        console.error('Error:', error.response.data.message);
                    } else {
                        console.error('Unexpected error:', error.message);
                    }
                });
        } else {
            console.log('File does not exist');
        }
    } catch (e) {
        console.error('Error registering file:', e);
    }
};

const getPeersFromFilename = (rl: readline.Interface): Promise<any> => {
    return new Promise((resolve, reject) => {
        // Get filename from input
        rl.question('Enter filename: ', async (filename) => {
            try {
                const res = await axios.get(
                    `${process.env.API_URL}/file/get/${filename}`
                );
                console.log(res.data);
                resolve(res.data); // Trả về dữ liệu từ API
            } catch (err: any) {
                console.error(err.message);
                reject(err); // Nếu có lỗi, reject promise
            }
        });
    });
};
export { registerPeer, registerFile, getPeersFromFilename };
