import express from "express";
import { getHospitals, getGlobalStats } from "../controllers/publicController.js";

const router = express.Router();

router.get("/hospitals", getHospitals);
router.get("/stats", getGlobalStats);

export default router;
