import readline from "readline";
import net from "net";
import { Peer, File } from "../types";
import axios from "axios";
import { argv } from "process";
import dotenv from "dotenv";

import { createPeerServer } from "./peerServer";
import { downloadFile } from "./peerClient";
import TrackerAPI from "./trackerAPI";

dotenv.config();
const trackerUrl: string = process.env.TRACKER_URL ?? "http://localhost:8000";
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let peer: any;
async function startPeer() {
  peer = await TrackerAPI.startPeer("localhost", parseInt(argv[2]));
  if (!peer) {
    peer = await TrackerAPI.registerPeer("localhost", parseInt(argv[2]));
  }
  if (peer) {
    console.log(
      "Peer ip: " +
        peer.ip +
        ", port: " +
        peer.port +
        ", download: " +
        peer.download +
        ", upload: " +
        peer.upload
    );
    createPeerServer(peer);
  } else {
    console.log("Error starting peer");
  }
}
startPeer();
console.log("To see list of commands, type 'help'");

//TrackerAPI.startPeer(peer);

rl.on("line", async (input) => {
  const inputs = input.trim().split(" ");
  const command = inputs[0];
  switch (command) {
    case "help": {
      console.log("Commands:");
      console.log(
        "+ register_file <filePath> <fileName>: Register file with tracker"
      );
      console.log("+ download_file <port> <fileName>: Download file from peer");
      console.log("+ exit");
      break;
    }

    case "me": {
      console.log(
        "Peer ip: " +
          peer.ip +
          ", port: " +
          peer.port +
          ", download: " +
          peer.download +
          ", upload: " +
          peer.upload
      );
      break;
    }

    case "list_files": {
      const files = await TrackerAPI.getFiles();
      console.log("Files:");
      files.forEach((file: any) => {
        console.log(`+ ${file.filename} - ${file.size} Bytes`);
      });
      break;
    }

    case "register_file": {
      if (inputs.length === 2) {
        const fileName = inputs[1];
        await TrackerAPI.registerFile(peer, fileName, peer.port.toString());
      } else {
        console.log("Invalid input: register_file <fileName>");
      }
      break;
    }

    // case 'createTorrentFile': {
    //     if (inputs.length >= 4) {
    //         const filePath = inputs[1];
    //         const fileName = inputs[2];
    //         const torrentPath = inputs[3];
    //         createTorrentFile(filePath, fileName, trackerUrl, torrentPath);
    //     } else {
    //         console.log('Miss value');
    //     }
    //     break;
    // }
    case "download_file": {
      if (inputs.length === 2) {
        const fileName = inputs[1];
        downloadFile(fileName, peer as Peer);
      } else {
        console.log("Invalid input: download_file <port> <fileName>");
      }
      break;
    }

    case "exit": {
      await axios
        .patch(`${process.env.API_URL}/peer/update`, {
          port: peer.port,
          ip: peer.ip,
          isOnline: false,
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
      console.log("Closing readline...");
      rl.close();
      break;
    }

    default: {
      console.log("Invalid command, type 'help' for list of commands");
    }
  }
});
