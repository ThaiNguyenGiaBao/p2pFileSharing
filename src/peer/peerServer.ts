import net from 'net';
import readline from 'readline';

// Tạo giao diện readline để nhận dữ liệu từ người dùng

export const createPeerServer = (port: number, rl: readline.Interface) => {
    const server = net.createServer((socket) => {
        console.log(
            'Client connected: ' +
                socket.remoteAddress +
                ':' +
                socket.remotePort
        );

        socket.on('data', (data) => {
            console.log('Received data: ' + data);
        });

        rl.on('line', (input) => {
            socket.write(input);
        });
    });

    return server;
};

export const uploadFile = (port: number, rl: readline.Interface) => {
    const server = net.createServer((socket) => {
        console.log(
            'Client connected: ' +
                socket.remoteAddress +
                ':' +
                socket.remotePort
        );

        socket.on('data', (data) => {
            console.log('Received data: ' + data);
        });

        rl.on('line', (input) => {
            socket.write(input);
        });
    });

    return server;
};
