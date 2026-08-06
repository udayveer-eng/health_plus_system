import Hospital from "../models/Hospital.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const hospital = await Hospital.findOne({ userId: req.user.userId });
    if (!hospital || !user) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }
    return res.status(200).json({
      success: true,
      hospital: {
        id: hospital._id,
        name: hospital.name,
        email: user.email,
        location: hospital.location,
        city: hospital.city,
        isVerified: user.isVerified,
        resourceUpdatedAt: hospital.resourceUpdatedAt,
        createdAt: hospital.createdAt,
      },
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, city, location } = req.body;
    const updateQuery = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }
      updateQuery.name = name;
    }

    if (city !== undefined) {
      if (!city.trim()) {
        return res.status(400).json({
          success: false,
          message: "City cannot be empty",
        });
      }
      updateQuery.city = city;
    }

    if (location !== undefined) {
      // Location is optional, so we allow empty strings.
      updateQuery.location = location;
    }

    const hospital = await Hospital.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: updateQuery },
      { new: true }
    );
    
    const user = await User.findById(req.user.userId);

    if (!hospital || !user) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        name: hospital.name,
        email: user.email,
        city: hospital.city,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      token,
      hospital: {
        id: hospital._id,
        name: hospital.name,
        email: user.email,
        city: hospital.city,
        location: hospital.location,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

export { getProfile, updateProfile };
