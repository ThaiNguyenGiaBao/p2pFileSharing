import net from 'net';
import fs from 'fs';
import axios from 'axios';
import { Peer, File } from '../types';
// Hàm tải xuống tệp từ một peer
const downloadPieceFromPeer = (
    peer: Peer,
    pieceIndex: number,
    filename: string
) => {
    const client = net.createConnection(
        { port: peer.port, host: peer.ip },
        () => {
            console.log(
                `Connected to peer ${peer.id} to download piece ${pieceIndex}`
            );

            // Yêu cầu peer gửi phần của tệp
            client.write(JSON.stringify({ action: 'download', pieceIndex }));

            client.on('data', (data) => {
                // Lưu phần tải xuống vào tệp
                fs.appendFileSync(filename, data);
                console.log(
                    `Downloaded piece ${pieceIndex} from peer ${peer.id}`
                );
                client.end();
            });
        }
    );

    client.on('error', (err) => {
        console.log(`Error connecting to peer ${peer.id}: ${err.message}`);
    });
};

// Hàm bắt đầu tải xuống tệp
const downloadFile = async (filename: string) => {
    try {
        // Yêu cầu danh sách các peer có tệp
        const response = await axios.get(
            `http://tracker-server.com/file/${filename}`
        );
        const peers = response.data.peers;

        console.log(`Found ${peers.length} peers with the file.`);

        // Giả sử tệp có 10 pieces
        const totalPieces = 10;

        // Tải xuống từng piece từ các peer
        for (let pieceIndex = 0; pieceIndex < totalPieces; pieceIndex++) {
            // const peer = peers[pieceIndex % peers.length]; // Chọn peer ngẫu nhiên
            const peer = peers[0]; // Chọn peer ngẫu nhiên
            downloadPieceFromPeer(peer, pieceIndex, filename);
        }
    } catch (err: unknown) {
        if (isError(err)) {
            console.error(`Error downloading file: ${err.message}`);
        } else {
            console.error(`Error downloading file: ${String(err)}`);
        }
    }
};

function isError(err: unknown): err is Error {
    return (err as Error).message !== undefined;
}

export { downloadPieceFromPeer, downloadFile };
