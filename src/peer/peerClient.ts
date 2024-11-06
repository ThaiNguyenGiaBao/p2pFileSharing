import net from "net";
import fs from "fs";
import axios from "axios";
import path from "path";
import { Peer, Piece } from "../types";
import { saveFilePiece } from "./filePiecesManager"; // Import các hàm cần thiết

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
          `Connected to peer ip:${peer.ip}, port:${peer.port} to download piece ${pieceIndex}`
        );

        // Yêu cầu peer gửi phần của tệp
        client.write(
          JSON.stringify({ action: "download", pieceIndex, filename })
        );

        client.on("data", (data) => {
          //console.log(data.toString());
          const message = data.toString();
          // Lưu phần tải xuống vào tệp
          if (message.startsWith("ERROR:")) {
            console.error(`Received error from donwloaded peer: ${message}`);
            // Trả về false khi có lỗi
            resolve(false);
            return; // Thoát khỏi callback
          } else {
            fs.appendFileSync(filePath, data, { flag: "a" });
            saveFilePiece(filePath, pieceIndex, data); // Cập nhật danh sách các phần
          }

          // Trả về true khi tải xuống thành công
          resolve(true);
          client.end();
        });
      }
    );

    client.on("error", (err) => {
      console.log(
        `Error connecting to peer ip:${peer.ip}, port:${peer.port}: ${err.message}`
      );
      resolve(false); // Trả về false khi có lỗi kết nối
    });
  });
};

// Hàm bắt đầu tải xuống tệp
const downloadFile = async (filename: string, myPeer: Peer) => {
  try {
    const validFilePath = process.env.FILE_PATH ?? "src/peer";
    const filePath = path.join(validFilePath, myPeer.port.toString(), filename);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true }); // Tạo thư mục với tùy chọn recursive
    }
    // Tạo tệp trống nếu chưa tồn tại
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, ""); // Tạo tệp trống
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
    const pieces: Piece[] = pieceListResponse.data;

    console.log(`Found ${pieces.length} pieces for the file ${filename}.`);
    // Tải xuống từng phần của tệp từ các peer
    for (let pieceIndex = 0; pieceIndex < pieces.length; pieceIndex++) {
      const piece: Piece = pieces[pieceIndex];
      const peersResponse = await axios.get(
        `${process.env.API_URL}/piece/peer/${piece.hash}`
      );

      const peers: Peer[] = peersResponse.data;

      console.log("List of peers having piece #" + pieceIndex + ":");
      peers.forEach((peer) => {
        console.log(" + ip:" + peer.ip + ", port:" + peer.port);
      });
      // Kiểm tra nếu có peer sẵn sàng cung cấp phần dữ liệu
      if (!peers || peers.length === 0) {
        console.log(`No peer found for piece ${pieceIndex}`);
        continue;
      }

      // sort peers by upload from smallest to largest
      peers.sort((a, b) => a.upload - b.upload);

      let isSuccess = false;

      for (let i = 0; i < peers.length && !isSuccess; i++) {
        const peer: Peer = peers[i];
        if (peer.port === myPeer.port && peer.ip === myPeer.ip) {
          continue;
        }
        isSuccess = await downloadPieceFromPeer(
          peer,
          pieceIndex,
          filename,
          filePath
        ); // Sử dụng await để đảm bảo thứ tự

        if (!isSuccess) {
          continue; // Thử tải xuống từ peer tiếp theo nếu có lỗi
        }
        
        myPeer.download =
          (parseInt(myPeer.download.toString()) || 0) +
          (parseInt(piece.size.toString()) || 0);


        await axios
          .patch(`${process.env.API_URL}/peer/update`, {
            port: myPeer.port,
            ip: myPeer.ip,
            download: myPeer.download,
          })
          .catch((error) => {
            if (error.response && error.response.status === 400) {
              // Kiểm tra nếu mã lỗi là 400
              console.error("Error:", error.response.data.message);
            } else {
              // Xử lý các lỗi khác
              console.error("Unexpected error:", error.message);
            }
          });
        try {
          await axios.post(`${process.env.API_URL}/piece/register`, {
            hash: piece.hash,
            torrentFileId: piece.torrentid,
            size: piece.size,
            index: piece.index,
            peerId: myPeer.id,
          });
        } catch (err: any) {
          if (err.response && err.response.status === 400) {
            console.error(err.response.data.message);
          } else {
            console.error("Unexpected error: Internal server error");
          }
        }
      }
      if (!isSuccess) {
        console.log(`Failed to download piece ${pieceIndex}`);
      }
    }
  } catch (err: any) {
    console.log("Error downloading file:", err.message);
  }
};

export { downloadPieceFromPeer, downloadFile };
