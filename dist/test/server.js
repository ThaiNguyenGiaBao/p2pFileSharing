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
const PORT = 3000;
// Create the server
const server = net.createServer((socket) => {
    console.log('A client connected.');
    // Handle data received from the client
    socket.on('data', (data) => {
        console.log(`Client: ${data.toString()}`);
    });
    // Handle client disconnection
    socket.on('end', () => {
        console.log('Client disconnected.');
    });
    // Handle errors
    socket.on('error', (err) => {
        console.error(`Socket error: ${err.message}`);
    });
    // Allow server to send messages to the client
    process.stdin.on('data', (input) => {
        socket.write(input.toString().trim());
    });
});
// Start listening for connections
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// Handle server errors
server.on('error', (err) => {
    console.error(`Server error: ${err.message}`);
});
