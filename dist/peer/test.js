"use strict";
// const ProgressBar = require('progress');
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const progress_1 = __importDefault(require("progress"));
// Create a new progress bar instance with the total length
const bar = new progress_1.default("[:bar] :percent Downloaded piece #:idx with size :size Bytes from peer ip: :ip, port: :port successfully", {
    total: 30,
    width: 20,
    complete: "#",
    incomplete: "-",
});
// Simulate a process with a timer
for (let i = 0; i < 30; i++) {
    setTimeout(() => {
        bar.tick({
            idx: 1,
            size: 100,
            ip: "127.0.0.1",
            port: "8080",
        });
        if (bar.complete) {
            console.log("\nComplete!\n");
        }
    }, i * 100);
}
