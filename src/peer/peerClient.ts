import net from "net";
import fs from "fs";
import axios from "axios";
import path from "path";
import { Peer, Piece } from "../types";
import { saveFilePiece } from "./filePiecesManager"; // Import các hàm cần thiết
import ProgressBar from "progress";

// Hàm tải xuống một phần (piece) của tệp từ một peer
const downloadPieceFromPeer = async (
  peer: Peer,
  pieceIndex: number,
  filename: string,
  filePath: string
): Promise<{ data: any; isSuccess: boolean }> => {
  return new Promise((resolve) => {
    const client = net.createConnection(
      { port: peer.port, host: peer.ip },
      () => {
        // console.log(
        //   `Connected to peer ip:${peer.ip}, port:${peer.port} to download #${pieceIndex}`
        // );

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
            resolve({ data: null, isSuccess: false });
            return; // Thoát khỏi callback
          } 
          
          resolve({ data, isSuccess: true });
          client.end();
        });
      }
    );

    client.on("error", (err) => {
      console.log(
        `Error connecting to peer ip:${peer.ip}, port:${peer.port}: ${err.message}`
      );
      resolve({ data: null, isSuccess: false }); // Trả về false khi có lỗi kết nối
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

    const bar = new ProgressBar(
      "[:bar] :percent Downloaded piece #:idx with size :size Bytes from peer ip: :ip, port: :port successfully",
      {
        total: pieces.length,
        width: 20,
        complete: "#",
        incomplete: "-",
      }
    );

    // Simulate a process with a timer

    const pieceDataList = Array(pieces.length);

    // Tải xuống từng phần của tệp từ các peer
    for (let pieceIndex = 0; pieceIndex < pieces.length; pieceIndex++) {
      const piece: Piece = pieces[pieceIndex];
      const peersResponse = await axios.get(
        `${process.env.API_URL}/piece/peer/${piece.hash}`
      );

      const peers: Peer[] = peersResponse.data;

      if (!peers || peers.length === 0) {
        console.log(`No peer found for piece ${pieceIndex}`);
        continue;
      }

      // sort peers by upload from smallest to largest
      peers.sort((a, b) => a.upload - b.upload);

      let isSuccess = false;
      let data = null;

      for (let i = 0; i < peers.length && !isSuccess; i++) {
        const peer: Peer = peers[i];
        if (peer.port === myPeer.port && peer.ip === myPeer.ip) {
          continue;
        }
        ({ data, isSuccess } = await downloadPieceFromPeer(
          peer,
          pieceIndex,
          filename,
          filePath
        )); // Sử dụng await để đảm bảo thứ tự

        if (!isSuccess) {
          continue; // Thử tải xuống từ peer tiếp theo nếu có lỗi
        }
        pieceDataList[pieceIndex] = data;
        bar.tick({
          idx: pieceIndex,
          size: data.length,
          ip: peer.ip,
          port: peer.port,
        });

        myPeer.download =
          (parseInt(myPeer.download.toString()) || 0) +
          (parseInt(piece.size.toString()) || 0);
        axios
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
          } else {
            console.error("Unexpected error: Internal server error");
          }
        }
      }
      if (!isSuccess) {
        console.log(`Failed to download piece ${pieceIndex}`);
      }
    }

    // Ghi các phần đã tải xuống vào tệp
    for (let i = 0; i < pieceDataList.length; i++) {
      if (pieceDataList[i]) {
        //console.log(`Writing #${i} to file`);
        fs.appendFileSync(filePath, pieceDataList[i], { flag: "a" });
        saveFilePiece(filePath, i, pieceDataList[i]); // Cập nhật danh sách các phần
      }
    }
    console.log(`Downloaded file ${filename} successfully!`);
  } catch (err: any) {
    console.log("Error downloading file:", err.message);
  }
};

export { downloadPieceFromPeer, downloadFile };
