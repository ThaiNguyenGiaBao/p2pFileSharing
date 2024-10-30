import axios from 'axios';
import readline from 'readline';
import dotenv from 'dotenv';
import { Peer, File } from '../types';

import { createTorrentFile } from './createTorrentFile';
import { checkFileExists } from './fileService';
dotenv.config();
const registerPeer = async (peer: Peer) => {
    await axios
        .post(`${process.env.API_URL}/peer/register`, peer)
        .then((res) => {
            console.log(res.data);
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
const registerFile = async (
    peer: Peer,
    rl: readline.Interface,
    fileName: string,
    filePath: string
) => {
    try {
        const isFileExist = await checkFileExists(filePath);

        if (isFileExist) {
            const file: File = {
                name: fileName,
                size: 1024,
            };

            await axios
                .post(`${process.env.API_URL}/file/register`, {
                    file,
                    peer,
                })
                .then((res) => {
                    console.log(res.data);
                })
                .catch((err) => {
                    console.error(err.message);
                });
        } else {
            console.log('File is not exist');
        }
    } catch (e) {
        console.log(e);
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
