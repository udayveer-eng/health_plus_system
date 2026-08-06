import express from "express";
import { getAmbulances, addAmbulance, updateAmbulanceStatus } from "../controllers/ambulanceController.js";
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
  .get(protect, authorizeHospital, getAmbulances)
  .post(protect, authorizeHospital, addAmbulance);

router.route("/:id/status")
  .patch(protect, authorizeHospital, updateAmbulanceStatus);

export default router;
