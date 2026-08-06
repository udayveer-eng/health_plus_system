import Patient from "../models/Patient.js";
import User from "../models/User.js";

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const patient = await Patient.findOne({ userId: req.user.userId, isDeleted: false });

    if (!patient || !user) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      patient: {
        id: patient._id,
        name: patient.name,
        email: user.email,
        age: patient.age,
        bloodGroup: patient.bloodGroup,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Get Patient Profile Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, age, bloodGroup } = req.body;
    const updateQuery = {};

    if (name !== undefined) updateQuery.name = name;
    if (age !== undefined) updateQuery.age = age;
    if (bloodGroup !== undefined) updateQuery.bloodGroup = bloodGroup;

    const patient = await Patient.findOneAndUpdate(
      { userId: req.user.userId, isDeleted: false },
      { $set: updateQuery },
      { new: true }
    );

    const user = await User.findById(req.user.userId);

    if (!patient || !user) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      patient: {
        id: patient._id,
        name: patient.name,
        email: user.email,
        age: patient.age,
        bloodGroup: patient.bloodGroup,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Update Patient Profile Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

export { getProfile, updateProfile };
