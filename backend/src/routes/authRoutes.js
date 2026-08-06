import express from "express";
import {
  registerHospital,
  loginHospital,
  registerPatient,
  loginPatient,
} from "../controllers/authController.js";
import { validateRequest } from "../middlewares/validateMiddleware.js";
import { registerSchema, loginSchema } from "../validators/authValidator.js";
import { authLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.post("/register", authLimiter, validateRequest(registerSchema), registerHospital);
router.post("/login", authLimiter, validateRequest(loginSchema), loginHospital);

router.post("/patient/register", authLimiter, validateRequest(registerSchema), registerPatient);
router.post("/patient/login", authLimiter, validateRequest(loginSchema), loginPatient);

export default router;
