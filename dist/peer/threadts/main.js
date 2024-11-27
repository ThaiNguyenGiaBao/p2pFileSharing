"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
console.log("Is main thread:", worker_threads_1.isMainThread); // Check if this is the main thread
// Main thread logic
function runWorkerTask(workerData) {
    return new Promise((resolve, reject) => {
        const worker = new worker_threads_1.Worker("./src/peer/threadts/worker.mjs", { workerData }); // Start a new worker using this file
        worker.on("message", resolve); // Listen for messages from the worker
        worker.on("error", reject); // Listen for errors from the worker
        worker.on("exit", (code) => {
            if (code !== 0)
                reject(new Error(`Worker stopped with exit code ${code}`));
        });
    });
}
// Run the worker with some data
console.log("Starting worker task...");
runWorkerTask("Hello from the main thread")
    .then(console.log)
    .catch(console.error);
