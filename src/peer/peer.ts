import readline from 'readline';
import net from 'net';
import { Peer, File } from '../types';
// import axios from 'axios';
import { argv } from 'process';
import dotenv from 'dotenv';

import { createPeerServer } from './peerServer';
import { downloadFile } from './peerClient';
import { registerPeer, registerFile } from './peerContactTracker';
import { createTorrentFile } from './createTorrentFile';
// import { getFileInfo, checkFileExists } from './fileService';
dotenv.config();
const trackerUrl: string = process.env.TRACKER_URL ?? 'http://localhost:8000';
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const peer: Peer = {
    id: argv[2], // delete
    ip: 'localhost',
    port: parseInt(argv[3]),
};

const file = {
    name: 'test1',
    size: 100,
};

rl.on('line', async (input) => {
    const inputs = input.trim().split(' ');
    const command = inputs[0];
    console.log(command);
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
                registerFile(peer, rl, fileName, filePath);
            } else {
                console.log('Miss value');
            }
            break;
        }
        case 'createTorrentFile': {
            if (inputs.length >= 3) {
                const filePath = inputs[1];
                const fileName = inputs[2];
                createTorrentFile(filePath, fileName, trackerUrl);
            } else {
                console.log('Miss value');
            }
            break;
        }
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
