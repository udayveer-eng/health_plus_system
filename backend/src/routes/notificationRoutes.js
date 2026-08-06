import express from "express";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

// Require authentication. 
// Open to ALL roles (Patients, Doctors, Hospitals) since everyone has a `userId`
router.use(protect);

router.get("/", getMyNotifications);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);

export default router;
