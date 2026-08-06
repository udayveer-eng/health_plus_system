import DashboardService from "../services/dashboardService.js";
import Hospital from "../models/Hospital.js";
import Patient from "../models/Patient.js";

const getHospitalDashboard = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user.userId, isDeleted: false });
    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital profile not found" });
    }

    const data = await DashboardService.getHospitalDashboard(hospital._id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Hospital Dashboard Error:", error);
    return res.status(500).json({ success: false, message: "Failed to load dashboard data" });
  }
};



const getPatientDashboard = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId, isDeleted: false });
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient profile not found" });
    }

    const data = await DashboardService.getPatientDashboard(patient._id, req.user.userId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Patient Dashboard Error:", error);
    return res.status(500).json({ success: false, message: "Failed to load dashboard data" });
  }
};

const getAdminDashboard = async (req, res) => {
  try {
    const data = await DashboardService.getAdminDashboard();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);
    return res.status(500).json({ success: false, message: "Failed to load dashboard data" });
  }
};

export {
  getHospitalDashboard,
  getPatientDashboard,
  getAdminDashboard,
};
