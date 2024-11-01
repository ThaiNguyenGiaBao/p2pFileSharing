import net from 'net';
import fs from 'fs';
import axios from 'axios';
import path from 'path';
import { Peer } from '../types';
import { saveFilePiece } from './filePiecesManager'; // Import các hàm cần thiết

// Hàm tải xuống một phần (piece) của tệp từ một peer
const downloadPieceFromPeer = async (
    peer: Peer,
    pieceIndex: number,
    filename: string,
    filePath: string
): Promise<boolean> => {
    return new Promise((resolve) => {
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
                    const message = data.toString();
                    // Lưu phần tải xuống vào tệp
                    if (message.startsWith('ERROR:')) {
                        console.error(`Received error from server: ${message}`);
                        // Trả về false khi có lỗi
                        resolve(false);
                        return; // Thoát khỏi callback
                    } else {
                        fs.appendFileSync(filePath, data, { flag: 'a' });
                        console.log(
                            `Downloaded piece ${pieceIndex} from peer ${peer.port}`
                        );
                        saveFilePiece(filePath, pieceIndex, data); // Cập nhật danh sách các phần
                    }

                    // Trả về true khi tải xuống thành công
                    resolve(true);
                    client.end();
                });
            }
        );

        client.on('error', (err) => {
            console.log(`Error connecting to peer ${peer.id}: ${err.message}`);
            resolve(false); // Trả về false khi có lỗi kết nối
        });
    });
};

// Hàm bắt đầu tải xuống tệp
const downloadFile = async (filename: string, port: string, PEER: Peer) => {
    try {
        // filePath = `${process.env.FILE_PATH}/${filePath}/${filename}`;
        const validFilePath = process.env.FILE_PATH ?? 'src/peer';
        const filePath = path.join(validFilePath, port, filename);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true }); // Tạo thư mục với tùy chọn recursive
        }
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
                const isSuccess = await downloadPieceFromPeer(
                    peer,
                    pieceIndex,
                    filename,
                    filePath
                ); // Sử dụng await để đảm bảo thứ tự
                if (isSuccess) {
                    PEER.download = Number(PEER.download) + 1;

                    // console.log();
                    await axios
                        .patch(`${process.env.API_URL}/peer/update`, {
                            port: PEER.port,
                            ip: PEER.ip,
                            download: PEER.download,
                        })
                        .catch((error) => {
                            if (
                                error.response &&
                                error.response.status === 400
                            ) {
                                // Kiểm tra nếu mã lỗi là 400
                                console.error(
                                    'Error:',
                                    error.response.data.message
                                );
                            } else {
                                // Xử lý các lỗi khác
                                console.error(
                                    'Unexpected error:',
                                    error.message
                                );
                            }
                        });
                    try {
                        await axios.post(
                            `${process.env.API_URL}/piece/register`,
                            {
                                hash: piece.hash,
                                torrentFileId: piece.torrentid,
                                size: piece.size,
                                index: piece.index,
                                peerId: PEER.id,
                            }
                        );
                    } catch (err) {
                        // Kiểm tra xem err có phải là AxiosError
                        if (axios.isAxiosError(err)) {
                            console.error('Error data:', err.response?.data);
                        } else {
                            console.error('Unexpected error:', err);
                        }
                    }
                }
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
