import express from "express";
import {
  getHospitalDashboard,
  getPatientDashboard,
  getAdminDashboard,
} from "../controllers/dashboardController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import ROLES from "../constants/roles.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/hospital", roleMiddleware([ROLES.HOSPITAL]), getHospitalDashboard);
router.get("/patient", roleMiddleware([ROLES.PATIENT]), getPatientDashboard);
router.get("/admin", roleMiddleware([ROLES.ADMIN]), getAdminDashboard);

export default router;
