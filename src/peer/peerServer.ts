import net from "net";
import readline from "readline";
import fs from "fs/promises";
import path from "path";
import { Peer } from "../types";
import axios from "axios";

// Hàm tạo server peer
export const createPeerServer = (peer: Peer) => {
  const server = net.createServer((socket: net.Socket) => {
    console.log(
      "Peer connected: " + socket.remoteAddress + ":" + socket.remotePort
    );

    socket.on("data", async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString().trim());
        if (
          message.action === "download" &&
          typeof message.pieceIndex === "number" &&
          typeof message.filename === "string" // Kiểm tra fileId
        ) {
          const index = message.pieceIndex;
          const filename = message.filename;

          // Extract the filename without the domain and extension
          const extractedFilename = path.basename(
            filename,
            path.extname(filename)
          );

          // Xác định đường dẫn đến file piece
          const pieceFilePath = `${process.env.FILE_PATH}/${peer.port}/${extractedFilename}/piece_${index}.bin`; // Tạo đường dẫn đến file piece

          try {
            // Đọc phần dữ liệu từ file
            const pieceData = await fs.readFile(pieceFilePath);

            // Gửi phần dữ liệu (piece) cho client
            socket.write(pieceData);
            console.log(`Sent piece ${index} of file ${filename} to client.`);

            peer.upload = Number(peer.upload) + 1;

            await axios
              .patch(`${process.env.API_URL}/peer/update`, {
                port: peer.port,
                ip: peer.ip,
                upload: peer.upload,
              })
              .catch((error) => {
                if (error.response && error.response.status === 400) {
                  console.error("Error:", error.response.data.message);
                } else {
                  console.error("Unexpected error:", error.message);
                }
              });
          } catch (fileError: unknown) {
            // Kiểm tra kiểu lỗi và lấy thông tin
            if (fileError instanceof Error) {
              console.error("Error reading piece file:", fileError.message);
            } else {
              console.error("Error reading piece file: Unknown error");
            }
            socket.write("ERROR: Failed to read piece file");
          }
        } else {
          console.log("Received unknown command:", message);
        }
      } catch (error) {
        console.log("Failed to parse message:", data.toString());
      }
    });

    // rl.on('line', (input: string) => {
    //     socket.write(input);
    // });
  });

  server.listen(peer.port, () => {
    console.log(`Peer listening on port ${peer.port}`);
  });

  return server;
};
