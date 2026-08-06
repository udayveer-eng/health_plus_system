import Doctor from "../models/Doctor.js";
import Hospital from "../models/Hospital.js";

// @desc    Get all doctors for a hospital
// @route   GET /api/doctors
// @access  Private (Hospital only)
export const getDoctors = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user.userId });
    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital not found" });
    }

    const doctors = await Doctor.find({ hospitalId: hospital._id, isDeleted: false });
    res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Add a new doctor
// @route   POST /api/doctors
// @access  Private (Hospital only)
export const addDoctor = async (req, res) => {
  try {
    const { name, specialty, contactNumber } = req.body;

    if (!name || !specialty || !contactNumber) {
      return res.status(400).json({ success: false, message: "Please provide all required fields" });
    }

    const hospital = await Hospital.findOne({ userId: req.user.userId });
    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital not found" });
    }

    const doctor = await Doctor.create({
      hospitalId: hospital._id,
      name,
      specialty,
      contactNumber,
      status: "OFFLINE",
    });

    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    console.error("Error adding doctor:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Update doctor status
// @route   PATCH /api/doctors/:id/status
// @access  Private (Hospital only)
export const updateDoctorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["ONLINE", "OFFLINE", "ON_CALL", "IN_SURGERY"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const hospital = await Hospital.findOne({ userId: req.user.userId });
    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital not found" });
    }

    const doctor = await Doctor.findOneAndUpdate(
      { _id: id, hospitalId: hospital._id },
      { status },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found or unauthorized" });
    }

    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    console.error("Error updating doctor status:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
