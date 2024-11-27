"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const torrentfile_router_1 = __importDefault(require("./router/torrentfile.router"));
const peer_router_1 = __importDefault(require("./router/peer.router"));
const piece_router_1 = __importDefault(require("./router/piece.router"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const initDb_1 = __importDefault(require("./database/initDb"));
const getIP_1 = require("../peer/getIP");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
const PORT = process.env.PORT_SERVER || 8000;
const IP = (0, getIP_1.getPrivateIP)();
// Connect to PostgreSQL
initDb_1.default
    .connect()
    .then(() => {
    console.log("Connected to PostgreSQL!");
})
    .catch((err) => {
    console.error("Error connecting to PostgreSQL:", err.message);
});
app.get("/", (req, res) => {
    res.send("Hello World");
});
app.use("/api/torrentfile", torrentfile_router_1.default);
app.use("/api/peer", peer_router_1.default);
app.use("/api/piece", piece_router_1.default);
app.listen(PORT, () => {
    console.log("Server is running on http://" + IP + ":" + PORT);
});
