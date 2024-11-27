"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const net = __importStar(require("net"));
const HOST = '191.16.11.128'; // Replace with the server's IP address
const PORT = 3000;
// Connect to the server
const client = net.createConnection(PORT, HOST, () => {
    console.log('Connected to the server.');
    // Allow client to send messages to the server
    process.stdin.on('data', (input) => {
        client.write(input.toString().trim());
    });
});
// Handle data received from the server
client.on('data', (data) => {
    console.log(`Server: ${data.toString()}`);
});
// Handle server disconnection
client.on('end', () => {
    console.log('Disconnected from the server.');
});
// Handle errors
client.on('error', (err) => {
    console.error(`Connection error: ${err.message}`);
});
