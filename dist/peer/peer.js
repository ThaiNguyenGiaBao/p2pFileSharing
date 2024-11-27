"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const readline_1 = __importDefault(require("readline"));
const axios_1 = __importDefault(require("axios"));
const process_1 = require("process");
const dotenv_1 = __importDefault(require("dotenv"));
const peerServer_1 = require("./peerServer");
const peerClient_1 = require("./peerClient");
const trackerAPI_1 = __importDefault(require("./trackerAPI"));
const getIP_1 = require("./getIP");
dotenv_1.default.config();
//const trackerUrl: string = process.env.TRACKER_URL ?? "http://localhost:8000";
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout,
});
const ip = (0, getIP_1.getPrivateIP)();
let peer;
function startPeer() {
    return __awaiter(this, void 0, void 0, function* () {
        peer = yield trackerAPI_1.default.startPeer(ip, parseInt(process_1.argv[2]));
        if (!peer) {
            peer = yield trackerAPI_1.default.registerPeer(ip, parseInt(process_1.argv[2]));
        }
        if (peer) {
            console.log("Peer ip: " +
                peer.ip +
                ", port: " +
                peer.port +
                ", download: " +
                peer.download +
                ", upload: " +
                peer.upload);
            yield (0, peerServer_1.createPeerServer)(peer);
        }
        else {
            console.log("Error starting peer");
        }
    });
}
startPeer();
console.log("To see list of commands, type 'help'");
//TrackerAPI.startPeer(peer);
rl.on("line", (input) => __awaiter(void 0, void 0, void 0, function* () {
    const inputs = input.trim().split(" ");
    const command = inputs[0];
    switch (command) {
        case "help": {
            console.log("Commands:");
            console.log("+ register_file <fileName>: Register file with tracker");
            console.log("+ download_file <fileName>: Download file from peer");
            console.log("+ list_files: List all files");
            console.log("+ me: Show peer information");
            console.log("+ exit");
            break;
        }
        case "me": {
            console.log("Peer ip: " +
                peer.ip +
                ", port: " +
                peer.port +
                ", download: " +
                peer.download +
                ", upload: " +
                peer.upload);
            break;
        }
        case "list_files": {
            const files = yield trackerAPI_1.default.getFiles();
            console.log("Files:");
            files.forEach((file) => {
                console.log(`+ ${file.filename} - ${file.size} Bytes`);
            });
            break;
        }
        case "register_file": {
            if (inputs.length === 2) {
                const fileName = inputs[1];
                yield trackerAPI_1.default.registerFile(peer, fileName, peer.port.toString());
            }
            else {
                console.log("Invalid input: register_file <fileName>");
            }
            break;
        }
        case "download_file": {
            if (inputs.length >= 2) {
                const fileNames = inputs.slice(1); // Extract file names from inputs
                fileNames.forEach((fileName) => {
                    (0, peerClient_1.downloadFile)(fileName, peer); // Call the download function for each file
                });
            }
            else {
                console.log("Invalid input: download_file <fileName1> <fileName2> ... <fileNameN>");
            }
            break;
        }
        case "exit": {
            yield axios_1.default
                .patch(`${process.env.API_URL}/peer/update`, {
                port: peer.port,
                ip: peer.ip,
                isOnline: false,
            })
                .catch((error) => {
                if (error.response && error.response.status === 400) {
                    // Kiểm tra nếu mã lỗi là 400
                    console.error("Error:", error.response.data.message);
                }
                else {
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
}));
