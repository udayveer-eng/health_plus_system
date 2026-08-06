import express from "express";
import { getDoctors, addDoctor, updateDoctorStatus } from "../controllers/doctorController.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

// Role-based middleware to ensure only HOSPITALS can access these routes
const authorizeHospital = (req, res, next) => {
  if (req.user && req.user.role === "HOSPITAL") {
    next();
  } else {
    res.status(403).json({ success: false, message: "Not authorized as a hospital" });
  }
};

router.route("/")
  .get(protect, authorizeHospital, getDoctors)
  .post(protect, authorizeHospital, addDoctor);

router.route("/:id/status")
  .patch(protect, authorizeHospital, updateDoctorStatus);

export default router;
