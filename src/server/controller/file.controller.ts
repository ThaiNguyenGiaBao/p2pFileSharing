import pool from '../database/initDb';
import { Request, Response, NextFunction } from 'express';
import dotent from 'dotenv';
dotent.config();

class FileController {
    // // Register a file
    // router.post("/file/register",);
    static async register(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const { filename, size, peerId } = req.body;
        if (!filename || !size || !peerId) {
            res.status(400).json({ message: 'Add filename, size, peerId' });
            return;
        }

        try {
            const file = await pool.query(
                'SELECT id FROM file WHERE fname = $1',
                [filename]
            );

            if (file.rows.length) {
                const fileId = file.rows[0].id;

                // Check if the peer already has the file
                const peerFileR = await pool.query(
                    'SELECT * FROM peerFileR WHERE peerId = $1 AND fileId = $2',
                    [peerId, fileId]
                );

                if (peerFileR.rows.length) {
                    res.status(400).json({
                        message: 'Peer already has the file',
                    });
                    return;
                }

                // Register the file to the peer
                const newPeerFileR = await pool.query(
                    'INSERT INTO peerFileR (peerId, fileId) VALUES ($1, $2) RETURNING *',
                    [peerId, fileId]
                );

                console.log(
                    'File registered by ' + peerId + '::',
                    file.rows[0]
                );
                res.status(201).json(file.rows[0]);
            } else {
                const newFile = await pool.query(
                    'INSERT INTO file (fname, fsize) VALUES ($1, $2) RETURNING *',
                    [filename, size]
                );

                const fileId = newFile.rows[0].id;
                const serverUrl = process.env.SERVER_URL;
                const magnetLink = `magnet:?id:${fileId}&fn=${filename}&tr=${serverUrl}`;

                // Update file with the magnet link
                const updateFile = await pool.query(
                    'UPDATE file SET magnetlink = $1 WHERE id = $2 RETURNING *',
                    [magnetLink, fileId]
                );

                // Register the file to the peer
                const peerFileR = await pool.query(
                    'INSERT INTO peerFileR (peerId, fileId) VALUES ($1, $2) RETURNING *',
                    [peerId, fileId]
                );

                console.log(
                    'File registered by ' + peerId + '::',
                    updateFile.rows[0]
                );

                res.status(201).json(updateFile.rows[0]);
            }
        } catch (err: any) {
            console.error(err);
            res.status(500).send(err.message);
        }
    }

    // // Return magnet link of the filename
    // router.get("/file/magnetlink/:filename",);
    static async getMagnetLinkByFileName(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const filename = req.params.filename;
        if (!filename) {
            res.status(400).send('Add filename');
            return;
        }

        try {
            const file = await pool.query(
                'SELECT magnetlink FROM file WHERE fname = $1',
                [filename]
            );

            //console.log(file.);

            if (file.rows.length == 0) {
                res.status(400).json({ message: 'File not found' });
                return;
            }

            res.status(200).json(file.rows[0]);
        } catch (err: any) {
            console.error(err);
            res.status(500).send(err.message);
        }
    }

    // // Return all magnet links
    // router.get("/file/magnetlink",);
    static async getMagnetLink(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const files = await pool.query('SELECT magnetlink FROM file');
            res.status(200).json(files.rows);
        } catch (err: any) {
            console.error(err);
            res.status(500).send(err.message);
        }
    }

    // // Return all peers that have the file
    // router.get("/file/peer/:fileId",);
    static async getPeerByFileId(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const fileId = req.params.fileId;
        if (!fileId) {
            res.status(400).send('Add fileId');
            return;
        }

        try {
            const peerIds = await pool.query(
                'SELECT peerId FROM peerFileR WHERE fileId = $1',
                [fileId]
            );
            //console.log(peerIds.rows);

            if (peerIds.rows.length == 0) {
                res.status(400).json({ message: 'File not found' });
                return;
            }

            const peerIdArray = peerIds.rows.map((peerId) => peerId.peerid);
            //console.log(peerIdArray);

            const peers = await pool.query(
                'SELECT * FROM peer WHERE id = ANY($1)', // Use the appropriate array type (e.g., `uuid[]` or `int[]`)
                [peerIdArray]
            );

            //console.log(peers);

            res.status(200).json(peers.rows);
        } catch (err: any) {
            console.error(err);
            res.status(500).send(err.message);
        }
    }
}

export default FileController;
