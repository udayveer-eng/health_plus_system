import express from "express";
import {
  createEmergencyRequest,
  getHospitalEmergencyRequests,
  getPatientEmergencyRequests,
  acceptEmergencyRequest,
  completeEmergencyRequest,
  cancelEmergencyRequest
} from "../controllers/emergencyRequestController.js";
import protect from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/roleMiddleware.js";
import ROLES from "../constants/roles.js";
import { validateRequest } from "../middlewares/validateMiddleware.js";
import { createEmergencyRequestSchema } from "../validators/emergencyValidator.js";

const router = express.Router();

router.use(protect);

router.post("/", authorize([ROLES.PATIENT]), validateRequest(createEmergencyRequestSchema), createEmergencyRequest);
router.get("/patient", authorize([ROLES.PATIENT]), getPatientEmergencyRequests);
router.get("/hospital", authorize([ROLES.HOSPITAL]), getHospitalEmergencyRequests);

router.post("/:id/accept", authorize([ROLES.HOSPITAL]), acceptEmergencyRequest);
router.post("/:id/complete", authorize([ROLES.HOSPITAL]), completeEmergencyRequest);
router.post("/:id/cancel", authorize([ROLES.PATIENT, ROLES.HOSPITAL, ROLES.ADMIN]), cancelEmergencyRequest);

export default router;
