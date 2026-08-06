import express from "express";
import protect from "../middlewares/authMiddleware.js";
import Hospital from "../models/Hospital.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/dashboard", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const hospital = await Hospital.findOne({ userId: req.user.userId });

    if (!hospital || !user) {
      return res.status(404).json({
        message: "Hospital not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Hospital dashboard loaded",
      success: true,
      hospital: {
        id: hospital._id,
        name: hospital.name,
        email: user.email,
        location: hospital.location,
        createdAt: hospital.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not load hospital dashboard",
      success: false,
    });
  }
});

export default router;
