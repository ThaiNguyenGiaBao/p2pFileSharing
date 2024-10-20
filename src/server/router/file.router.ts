import { Router } from "express";
import FileController from "../controller/file.controller";
import asyncHandler from "express-async-handler";

const router = Router();

// Register a file
router.post("/register", asyncHandler(FileController.register));

// Return magnet link of the filename
router.get(
  "/magnetlink/:filename",
  asyncHandler(FileController.getMagnetLinkByFileName)
);

// Return all magnet links
router.get("/magnetlink", asyncHandler(FileController.getMagnetLink));

// Return all peers that have the file
router.get("/peer/:fileId", asyncHandler(FileController.getPeerByFileId));

export default router;
