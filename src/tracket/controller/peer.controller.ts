import pool from "../database/initDb";
import { Request, Response, NextFunction } from "express";

class PeerController {
  static async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { ip, port } = req.body;
    if (!ip || !port) {
      res.status(400).json({message:"Add ip and port"});
      return;
    }

    try {
      const peer = await pool.query(
        "SELECT * FROM peer WHERE ip = $1 AND port = $2",
        [ip, port]
      );
      if (peer.rows.length != 0) {
        res.status(400).json({message:"Peer already registered"});
        return;
      }

      const newPeer = await pool.query(
        "INSERT INTO peer (ip, port) VALUES ($1, $2) RETURNING *",
        [ip, port]
      );
      console.log("Peer registered::", newPeer.rows[0]);
      res.status(201).json(newPeer.rows[0]);
    } catch (err: any) {
      console.error(err);
      res.status(500).send(err.message);
    }
  }
  static async get(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const peerId = req.params.peerId;
    if (!peerId) {
      res.status(400).send("Add peerId");
      return;
    }

    try {
      const peer = await pool.query("SELECT * FROM peer WHERE id = $1", [
        peerId,
      ]);
      if (peer.rows.length == 0) {
       res.status(400).json({message:"Peer not found"});
        return;
      }

      res.status(200).json(peer.rows[0]);
    } catch (err: any) {
      console.error(err);
      res.status(500).send(err.message);
    }
  }

  static async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const peers = await pool.query("SELECT id, ip, port FROM peer");
      res.status(200).json(peers.rows);
    } catch (err: any) {
      console.error(err);
      res.status(500).send(err.message);
    }
  }
}

export default PeerController;
