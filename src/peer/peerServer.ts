import net from 'net';
import readline from 'readline';
import { getFilePieces } from './filePiecesManager'; // Import hàm lấy các phần từ filePiecesManager

// Hàm tạo server peer
export const createPeerServer = (port: number, rl: readline.Interface) => {
    const server = net.createServer((socket) => {
        console.log(
            'Client connected: ' +
                socket.remoteAddress +
                ':' +
                socket.remotePort
        );

        socket.on('data', (data) => {
            try {
                const message = JSON.parse(data.toString().trim());

                if (
                    message.action === 'download' &&
                    typeof message.pieceIndex === 'number' &&
                    typeof message.filename === 'string' // Kiểm tra fileId
                ) {
                    const index = message.pieceIndex;
                    const filename = message.filename;

                    // Lấy các phần của tệp từ filePiecesManager
                    const filePieces = getFilePieces(filename);

                    // Kiểm tra xem filePieces có tồn tại không
                    if (!filePieces) {
                        socket.write('ERROR: No pieces found for this file');
                    } else if (index < 0 || index >= filePieces.length) {
                        // Kiểm tra xem chỉ số có nằm trong phạm vi không
                        socket.write('ERROR: Invalid piece index');
                    } else {
                        // Gửi phần dữ liệu (piece) cho client
                        socket.write(filePieces[index]);
                        console.log(
                            `Sent piece ${index} of file ${filename} to client.`
                        );
                    }
                } else {
                    console.log('Received unknown command:', message);
                }
            } catch (error) {
                console.log('Failed to parse message:', data.toString());
            }
        });

        rl.on('line', (input) => {
            socket.write(input);
        });
    });

    server.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });

    return server;
};
