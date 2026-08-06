import express from "express";
import { getProfile, updateProfile } from "../controllers/patientController.js";
import protect from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/roleMiddleware.js";
import ROLES from "../constants/roles.js";

const router = express.Router();

// Apply auth and RBAC middlewares for all patient routes
router.use(protect);
router.use(authorize([ROLES.PATIENT]));

router.get("/profile", getProfile);
router.put("/profile", updateProfile);

export default router;
