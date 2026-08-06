import express from "express";
import { getHealth } from "../controllers/opsController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// All operational routes are protected
router.use(authMiddleware);

// GET /api/ops/health
router.get("/health", getHealth);

export default router;
