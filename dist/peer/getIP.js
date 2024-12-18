"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrivateIP = getPrivateIP;
const os_1 = __importDefault(require("os"));
function getPrivateIP() {
    const networkInterfaces = os_1.default.networkInterfaces();
    // Loop through all network interfaces
    for (const [interfaceName, addresses] of Object.entries(networkInterfaces)) {
        if (interfaceName.toLowerCase().includes('wi-fi') && addresses) {
            // Check each address for the Wi-Fi adapter
            for (const address of addresses) {
                if (address.family === 'IPv4' && !address.internal) {
                    return address.address; // Return the IPv4 address
                }
            }
        }
    }
    return 'No Wi-Fi private IP found';
}
