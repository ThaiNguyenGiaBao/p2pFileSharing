import readline from 'readline';
import net from 'net';
import { Peer, File } from '../types';
import axios from 'axios';
import { argv } from 'process';
import dotenv from 'dotenv';

import { createPeerServer } from './peerServer';
import { downloadFile } from './peerClient';
import { registerPeer, registerFile } from './peerContactTracker';
// import { createTorrentFile } from './createPieceHashes';
// import { getFileInfo, checkFileExists } from './fileService';
dotenv.config();
const trackerUrl: string = process.env.TRACKER_URL ?? 'http://localhost:8000';
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const peer: Peer = {
    id: 'cf11f5e4-3d6a-405c-b1c6-6d0a477b2e91',
    ip: 'localhost',
    port: parseInt(argv[2]),
};

const file = {
    name: 'test1',
    size: 100,
};

rl.on('line', async (input) => {
    const inputs = input.trim().split(' ');
    const command = inputs[0];
    switch (command) {
        case 'registerPeer': {
            registerPeer(peer);
            break;
        }

        case 'registerFile': {
            // nhập info từ người dùng
            if (inputs.length === 3) {
                const filePath = inputs[1];
                const fileName = inputs[2];
                registerFile(peer, fileName, filePath);
            } else {
                console.log('Miss value');
            }
            break;
        }
        case 'startPeer': {
            await axios
                .patch(`${process.env.API_URL}/peer/update`, {
                    port: peer.port,
                    ip: peer.ip,
                    isOnline: true,
                })
                .then((res) => {
                    console.log(res.data);
                    peer.id = res.data.id;
                })
                .catch((error) => {
                    if (error.response && error.response.status === 400) {
                        // Kiểm tra nếu mã lỗi là 400
                        console.error('Error:', error.response.data.message);
                    } else {
                        // Xử lý các lỗi khác
                        console.error('Unexpected error:', error.message);
                    }
                });
        }
        // case 'createTorrentFile': {
        //     if (inputs.length >= 4) {
        //         const filePath = inputs[1];
        //         const fileName = inputs[2];
        //         const torrentPath = inputs[3];
        //         createTorrentFile(filePath, fileName, trackerUrl, torrentPath);
        //     } else {
        //         console.log('Miss value');
        //     }
        //     break;
        // }
        case 'downloadFile': {
            if (inputs.length === 2) {
                const fileName = inputs[1];
                downloadFile(fileName);
            }
            break;
        }

        case 'uploadFile': {
            break;
        }

        case 'exit': {
            await axios
                .patch(`${process.env.API_URL}/peer/update`, {
                    port: peer.port,
                    ip: peer.ip,
                    isOnline: false,
                })
                .then((res) => {
                    console.log(res.data);
                })
                .catch((error) => {
                    if (error.response && error.response.status === 400) {
                        // Kiểm tra nếu mã lỗi là 400
                        console.error('Error:', error.response.data.message);
                    } else {
                        // Xử lý các lỗi khác
                        console.error('Unexpected error:', error.message);
                    }
                });
            console.log('Closing readline...');
            rl.close(); // Đóng rl khi người dùng nhập 'exit'
            break;
        }

        default: {
            console.log('Invalid Input!');
        }
    }
});

// Create peerServer

const server = createPeerServer(peer.port, rl);

server.listen(peer.port, () => {
    console.log('Server listening on port', peer.port);
});
