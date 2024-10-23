import readline from 'readline';
import net from 'net';
import { Peer, File } from '../types';
import axios from 'axios';
import { argv } from 'process';
import dotenv from 'dotenv';

import { createPeerServer } from './peerServer';
import { downloadPieceFromPeer, downloadFile } from './peerClient';
import { registerPeer, registerFile } from './peerContactTracker';

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const peer: Peer = {
    id: argv[2],
    ip: 'localhost',
    port: parseInt(argv[3]),
};

const file = {
    name: 'test1',
    size: 100,
};

rl.on('line', async (input) => {
    switch (input) {
        case 'registerPeer': {
            registerPeer(peer);
            break;
        }

        case 'registerFile': {
            registerFile(peer, rl);
            break;
        }

        case 'exit': {
            console.log('Closing readline...');
            rl.close(); // Đóng rl khi người dùng nhập 'exit'
            break;
        }

        case 'downloadFile': {
            
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
