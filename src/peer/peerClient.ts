import net from 'net';
import fs from 'fs';
import axios from 'axios';
import path from 'path';
import { Peer } from '../types';
import { setFilePieces, updateFilePiece } from './filePiecesManager'; // Import các hàm cần thiết

// Hàm tải xuống một phần (piece) của tệp từ một peer
const downloadPieceFromPeer = async (
    peer: Peer,
    pieceIndex: number,
    filename: string,
    filePath: string
) => {
    const client = net.createConnection(
        { port: peer.port, host: peer.ip },
        () => {
            console.log(
                `Connected to peer ${peer.id} to download piece ${pieceIndex}`
            );

            // Yêu cầu peer gửi phần của tệp
            client.write(
                JSON.stringify({ action: 'download', pieceIndex, filename })
            );

            client.on('data', (data) => {
                // Lưu phần tải xuống vào tệp
                fs.appendFileSync(filePath, data, { flag: 'a' });
                console.log(
                    `Downloaded piece ${pieceIndex} from peer ${peer.port}`
                );

                // Cập nhật filePiecesManager sau khi tải xuống thành công
                updateFilePiece(filename, pieceIndex, data); // Cập nhật danh sách các phần

                client.end();
            });
        }
    );

    client.on('error', (err) => {
        console.log(`Error connecting to peer ${peer.id}: ${err.message}`);
    });
};

// Hàm bắt đầu tải xuống tệp
const downloadFile = async (filename: string, port: string) => {
    try {
        // filePath = `${process.env.FILE_PATH}/${filePath}/${filename}`;
        const validFilePath = process.env.FILE_PATH ?? 'src/peer';
        const filePath = path.join(validFilePath, port, filename);
        // const dir = path.dirname(filePath);

        // Tạo tệp trống nếu chưa tồn tại
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, ''); // Tạo tệp trống
        }

        // Yêu cầu danh sách các peer có tệp
        const torrentFileResponse = await axios.get(
            `${process.env.API_URL}/torrentfile/${filename}`
        );
        const torrentFile = torrentFileResponse.data;
        // Lấy danh sách các phần (pieces) của tệp
        const pieceListResponse = await axios.get(
            `${process.env.API_URL}/piece/${torrentFile.id}`
        );
        const pieces = pieceListResponse.data;

        console.log(`Found ${pieces.length} pieces for the file ${filename}.`);
        // Tải xuống từng phần của tệp từ các peer
        for (let pieceIndex = 0; pieceIndex < pieces.length; pieceIndex++) {
            const piece = pieces[pieceIndex];
            const peersResponse = await axios.get(
                `${process.env.API_URL}/piece/peer/${piece.hash}`
            );

            const peers: Peer[] = peersResponse.data;
            console.log(peers);
            // Kiểm tra nếu có peer sẵn sàng cung cấp phần dữ liệu
            if (peers.length > 0) {
                let index = 0;
                for (let i = 0; i < peers.length; i++) {
                    if (peers[i].upload < peers[index].upload) {
                        index = i;
                    }
                }
                const peer = peers[index];
                await downloadPieceFromPeer(
                    peer,
                    pieceIndex,
                    filename,
                    filePath
                ); // Sử dụng await để đảm bảo thứ tự
            } else {
                console.log(`No peer found for piece ${pieceIndex}`);
            }
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
