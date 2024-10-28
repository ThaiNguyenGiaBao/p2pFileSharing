import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import fileRouter from "./router/torrentfile.router";
import peerRouter from "./router/peer.router";
import dotenv from "dotenv";
dotenv.config();
import pool from "./database/initDb";



const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT_SERVER || 8000;

// Connect to PostgreSQL
pool.connect().then(() => {
  console.log("Connected to PostgreSQL!");
}).catch((err: any) => {
  console.error("Error connecting to PostgreSQL:", err.message);
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

app.use("/api/file", fileRouter);
app.use("/api/peer", peerRouter);

app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
});
