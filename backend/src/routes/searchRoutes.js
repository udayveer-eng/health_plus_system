import express from "express";
import { searchHospitals, searchPatients, searchEmergencies } from "../controllers/searchController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/hospitals", searchHospitals);
router.get("/patients", searchPatients);
router.get("/emergencies", searchEmergencies);

export default router;
