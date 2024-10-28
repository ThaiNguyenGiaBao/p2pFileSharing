import { Router } from "express";
import TorrentFileController from "../controller/torrentfile.controller";
import asyncHandler from "express-async-handler";

const router = Router();

// Register a file
router.post("/register", asyncHandler(TorrentFileController.register));

// Return magnet link of the filename
router.get(
  "/magnetlink/:filename",
  asyncHandler(TorrentFileController.getMagnetLinkByFileName)
);

// Return all magnet links
router.get("/magnetlink", asyncHandler(TorrentFileController.getMagnetLink));

// Return all peers that have the file
router.get("/peer/:fileId", asyncHandler(TorrentFileController.getPeerByFileId));

export default router;
