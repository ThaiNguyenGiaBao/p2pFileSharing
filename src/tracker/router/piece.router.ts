import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import PieceController from '../controller/piece.controller';

const router = Router();
router.post('/register', asyncHandler(PieceController.registerPiece));

//Get all peers by hashPiece
router.get(
    '/peer/:hashPiece',
    asyncHandler(PieceController.getPeersByHashPiece)
);

export default router;
