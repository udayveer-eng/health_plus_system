import Ambulance from "../models/Ambulance.js";
import Hospital from "../models/Hospital.js";
import TransitEngine from "../services/TransitEngine.js";
import AuditService from "../services/auditService.js";

// @desc    Get all ambulances for a hospital
// @route   GET /api/ambulances
// @access  Private (Hospital only)
export const getAmbulances = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user.userId });
    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital not found" });
    }

    const ambulances = await Ambulance.find({ hospitalId: hospital._id, isDeleted: false });
    res.status(200).json({ success: true, data: ambulances });
  } catch (error) {
    console.error("Error fetching ambulances:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Add a new ambulance
// @route   POST /api/ambulances
// @access  Private (Hospital only)
export const addAmbulance = async (req, res) => {
  try {
    const { vehicleNumber, driverName, equipmentLevel } = req.body;

    if (!vehicleNumber || !driverName) {
      return res.status(400).json({ success: false, message: "Please provide all required fields" });
    }

    const hospital = await Hospital.findOne({ userId: req.user.userId });
    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital not found" });
    }

    const ambulance = await Ambulance.create({
      hospitalId: hospital._id,
      vehicleNumber,
      driverName,
      equipmentLevel: equipmentLevel || "BASIC",
      status: "AVAILABLE",
    });

    res.status(201).json({ success: true, data: ambulance });
  } catch (error) {
    console.error("Error adding ambulance:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Update ambulance status
// @route   PATCH /api/ambulances/:id/status
// @access  Private (Hospital only)
export const updateAmbulanceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["AVAILABLE", "EN_ROUTE", "MAINTENANCE"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const hospital = await Hospital.findOne({ userId: req.user.userId });
    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital not found" });
    }

    const updatePayload = { status };
    let routingDetails = null;

    if (status === "EN_ROUTE" && req.body.destinationZone) {
      updatePayload.destinationZone = req.body.destinationZone;
      // Synthetically assuming hospital is in Sector 62 for demo routing
      routingDetails = TransitEngine.getShortestPath("Sector 62", req.body.destinationZone, 60);
      updatePayload.etaMinutes = routingDetails.etaMinutes;
      console.log(`[TransitEngine] Dispatching ambulance to ${req.body.destinationZone}. ETA: ${routingDetails.etaMinutes} mins. Path: ${routingDetails.path.join(" -> ")}`);
    } else if (status === "AVAILABLE" || status === "MAINTENANCE") {
      updatePayload.destinationZone = null;
      updatePayload.etaMinutes = null;
    }

    const ambulance = await Ambulance.findOneAndUpdate(
      { _id: id, hospitalId: hospital._id },
      updatePayload,
      { new: false } // Get previous state for audit
    );

    if (!ambulance) {
      return res.status(404).json({ success: false, message: "Ambulance not found or unauthorized" });
    }

    const updatedAmbulance = await Ambulance.findById(id);

    // Audit State Transition
    AuditService.logStateTransition(
      req.user.userId,
      req.user.role,
      "AMBULANCE_DISPATCHED",
      "Ambulance",
      ambulance._id,
      { status: ambulance.status, destinationZone: ambulance.destinationZone },
      { status: updatedAmbulance.status, destinationZone: updatedAmbulance.destinationZone }
    );

    res.status(200).json({ success: true, data: updatedAmbulance });
  } catch (error) {
    console.error("Error updating ambulance status:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
