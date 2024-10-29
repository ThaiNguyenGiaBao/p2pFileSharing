import pool from '../database/initDb';
import { Request, Response, NextFunction } from 'express';

class PieceController {
    //     router.post("/register", asyncHandler(PieceController.registerPiece));

    static async registerPiece(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        console.log(req.body);
        const { hash, torrentFileId, size, index, peerId } = req.body;
        console.log('Piece::', hash, torrentFileId, size, index, peerId);
        if (!hash || !torrentFileId || !size || index == undefined || !peerId) {
            res.status(400).json({
                message: 'Add hash, torrentFileId, size, index, peerId',
            });
            return;
        }

        try {
            // Check the index of the piece

            const piece = await pool.query(
                'SELECT * FROM piece WHERE hash = $1 AND index = $2',
                [hash, index]
            );
            //console.log("Piece::", piece);

            // Piece does not exist
            if (piece.rows.length == 0) {
                const newPiece = await pool.query(
                    'INSERT INTO piece (hash, torrentId, size, index) VALUES ($1, $2, $3, $4) RETURNING *',
                    [hash, torrentFileId, size, index]
                );
                console.log('New piece::', newPiece.rows[0]);

                // Register the peerPiece
                const peerPiece = await pool.query(
                    'INSERT INTO peerPieceR (peerId, hashPiece) VALUES ($1, $2) RETURNING *',
                    [peerId, hash]
                );
                console.log('PeerPiece::', peerPiece.rows[0]);

                res.status(201).json(newPiece.rows[0]);
                return;
            }

            if (piece.rows[0].hash != hash) {
                res.status(400).json({
                    message:
                        'Checksum error. The hash of this piece is not similar to the registered one!',
                });
                return;
            }

            // peerPiece already exists
            const peerPiece1 = await pool.query(
                'SELECT * FROM peerPieceR WHERE peerId = $1 AND hashPiece = $2',
                [peerId, hash]
            );

            if (peerPiece1.rows.length != 0) {
                res.status(400).json({
                    message: 'Peer already registered this piece',
                });
                return;
            }

            // Register the peerPiece
            const peerPiece = await pool.query(
                'INSERT INTO peerPieceR (peerId, hashPiece) VALUES ($1, $2) RETURNING *',
                [peerId, hash]
            );

            console.log('PeerPiece::', peerPiece.rows[0]);
            res.status(201).json(piece.rows[0]);
        } catch (err: any) {
            console.error(err);
            res.status(500).send(err.message);
        }
    }

    // // Get all peers by hashPiece
    // router.get("/peer/:hashPiece", asyncHandler(PieceController.getPeersByHashPiece));
    static async getPeersByHashPiece(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const hashPiece = req.params.hashPiece;
        if (!hashPiece) {
            res.status(400).send('Add hashPiece');
            return;
        }

        try {
            // Check if the piece not exists
            const piece = await pool.query(
                'SELECT * FROM piece WHERE hash = $1',
                [hashPiece]
            );
            if (piece.rows.length == 0) {
                res.status(400).json({ message: 'Piece not found' });
                return;
            }

            const peerList = await pool.query(
                'select Peer.id, ip, port, download, upload from PeerPieceR join Peer on peerId = Peer.id where hashPiece = $1',
                [hashPiece]
            );

            console.log('Peer list::', peerList.rows);

            res.status(200).json(peerList.rows);
        } catch (err: any) {
            console.error(err.message);
            res.status(500).send(err.message);
        }
    }

    //   // Get all pieces by torrentId
    // router.get(
    //     ":torrentId",
    //     asyncHandler(PieceController.getPiecesByTorrentId)
    //   );

    static async getPiecesByTorrentId(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const torrentId = req.params.torrentId;
        if (!torrentId) {
            res.status(400).send('Add torrentId');
            return;
        }

        try {
            const pieces = await pool.query(
                'SELECT * FROM piece WHERE torrentId = $1',
                [torrentId]
            );
            res.status(200).json(pieces.rows);
        } catch (err: any) {
            console.error(err);
            res.status(500).send(err.message);
        }
    }
}

export default PieceController;
