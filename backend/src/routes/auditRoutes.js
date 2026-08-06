import express from "express";
import { getAuditLogs, getAuditLogById } from "../controllers/auditController.js";
import protect from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/roleMiddleware.js";
import ROLES from "../constants/roles.js";

const router = express.Router();

router.use(protect);
router.use(authorize([ROLES.ADMIN])); // Strictly Admin only

router.get("/", getAuditLogs);
router.get("/:id", getAuditLogById);

export default router;
