"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrivateIP = getPrivateIP;
const os_1 = __importDefault(require("os"));
function getPrivateIP() {
    const networkInterfaces = os_1.default.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
        const addresses = networkInterfaces[interfaceName];
        if (addresses) {
            for (const address of addresses) {
                if (address.family === "IPv4" && !address.internal) {
                    return address.address;
                }
            }
        }
    }
    return "No private IP found";
}
console.log("Private IP:", getPrivateIP());
