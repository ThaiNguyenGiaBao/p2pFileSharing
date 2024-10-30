import { Router } from 'express';
import PeerController from '../controller/peer.controller';
import asyncHandler from 'express-async-handler';

const router = Router();

router.post('/register', asyncHandler(PeerController.register));
router.get('/get/:peerId', asyncHandler(PeerController.get));
router.get('/get', asyncHandler(PeerController.getAll));

export default router;
