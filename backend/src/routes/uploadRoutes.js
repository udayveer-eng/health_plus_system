import express from "express";
import { uploadFile, getFileMetadata, deleteFile } from "../controllers/uploadController.js";
import protect from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import { uploadLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// Require authentication for all upload-related actions
router.use(protect);

// Map the generic upload middleware and handle errors
router.post("/", uploadLimiter, (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, uploadFile);

router.get("/:id", getFileMetadata);
router.delete("/:id", deleteFile);

export default router;
