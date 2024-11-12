import net from "net";
import fs from "fs";
import axios from "axios";
import path from "path";
import { Peer, Piece } from "../types";
import { saveFilePiece } from "./filePiecesManager"; // Import các hàm cần thiết
import { Worker } from "worker_threads";
import ProgressBar from "progress";
import { checkPieceExist } from "./fileService";

// // Hàm tải xuống một phần (piece) của tệp từ một peer
// const downloadPieceFromPeer = async (
//   peer: Peer,
//   pieceIndex: number,
//   filename: string,
//   filePath: string
// ): Promise<boolean> => {
//   return new Promise((resolve) => {
//     const client = net.createConnection(
//       { port: peer.port, host: peer.ip },
//       () => {
//         console.log(
//           `Connected to peer ip:${peer.ip}, port:${peer.port} to download piece ${pieceIndex}`
//         );

//         // Yêu cầu peer gửi phần của tệp
//         client.write(
//           JSON.stringify({ action: "download", pieceIndex, filename })
//         );

//         client.on("data", (data) => {
//           //console.log(data.toString());
//           const message = data.toString();
//           // Lưu phần tải xuống vào tệp
//           if (message.startsWith("ERROR:")) {
//             console.error(`Received error from donwloaded peer: ${message}`);
//             // Trả về false khi có lỗi
//             resolve(false);
//             return; // Thoát khỏi callback
//           }

//           // Trả về true khi tải xuống thành công
//           resolve(true);
//           client.end();
//         });
//       }
//     );

//     client.on("error", (err) => {
//       console.log(
//         `Error connecting to peer ip:${peer.ip}, port:${peer.port}: ${err.message}`
//       );
//       resolve(false); // Trả về false khi có lỗi kết nối
//     });
//   });
// };

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

    const workers: Worker[] = [];

    // Declare a list to store the downloaded piece data with the size = pieces.length
    const pieceFileDataList: any[] = new Array(pieces.length);

    const bar = new ProgressBar(
      "[:bar] :percent Downloaded piece #:idx with size :size Bytes from peer ip: :ip, port: :port successfully",
      {
        total: pieces.length,
        width: 20,
        complete: "#",
        incomplete: "-",
      }
    );

    // Tải xuống từng phần của tệp từ các peer
    let isUpdating = false;

    // Rarest first
    const { data } = await axios.get(
      `${process.env.API_URL}/piece/sort/${filename}`
    );
    const sortedPieces: Piece[] = data;
    const sortedPieceIndex: number[] = sortedPieces.map((p: Piece) => p.index);

    for (let idx = 0; idx < pieces.length; idx++) {
      const pieceIndex = sortedPieceIndex[idx];
      //console.log(`Downloading piece #${pieceIndex}...`);
      // Check if the piece has been downloaded
      const extractedFilename = path.basename(filename, path.extname(filename));
      const pieceFilePath = `${dir}/${extractedFilename}/piece_${pieceIndex}.bin`;
      if (await checkPieceExist(myPeer.port, filename, pieceIndex)) {
        //console.log(`Piece #${pieceIndex} has been downloaded`);
        const pieceData = fs.readFileSync(pieceFilePath);
        bar.tick({
          idx: pieceIndex,
          size: pieceData.length,
          ip: myPeer.ip,
          port: myPeer.port,
        });
        pieceFileDataList[pieceIndex] = pieceData;
        continue;
      }

      const worker = new Worker("./src/peer/workerDownloadPiece.mjs", {
        workerData: {
          piece: pieces[pieceIndex],
          myPeer,
          filename,
          filePath,
          pieceIndex,
        },
      });

      worker.on("message", async (message) => {
        if (message.success) {
          while (isUpdating) {
            await new Promise((resolve) => setTimeout(resolve, 1));
          }
          isUpdating = true; // Acquire lock

          bar.tick({
            idx: message.pieceIndex,
            size: message.data.length,
            ip: message.ip,
            port: message.port,
          });
          pieceFileDataList[message.pieceIndex] = message.data;
          isUpdating = false; // Release lock
        } else {
          console.log(`Failed to download piece #${message.pieceIndex}`);
        }
      });
      worker.on("error", (error) => {
        console.error("Worker error:", error);
      });
      worker.on("exit", (code) => {
        if (code !== 0) {
          console.error(`Worker stopped with exit code ${code}`);
        }
      });
      workers.push(worker);
    }

    // Wait for all workers to finish
    const workerPromises = workers.map((worker) => {
      return new Promise((resolve) => {
        worker.on("exit", () => {
          resolve(null);
        });
      });
    });

    await Promise.all(workerPromises);

    // Fail if any piece is missing
    if (pieceFileDataList.length !== pieces.length) {
      console.error("Failed to download the file");
      return;
    }

    for (let i = 0; i < pieceFileDataList.length; i++) {
      fs.appendFileSync(filePath, pieceFileDataList[i], { flag: "a" });
    }
    console.log(`File ${filename} has been downloaded successfully!`);
  } catch (err: any) {
    if (err.response) {
      console.error("Error:", err.response.data.message);
    }
  }
};

export { downloadFile };
