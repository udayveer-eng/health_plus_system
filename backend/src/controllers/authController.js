import Hospital from "../models/Hospital.js";
import Patient from "../models/Patient.js";
import User from "../models/User.js";
import ROLES from "../constants/roles.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import QueueService from "../services/queueService.js";
import { EMAIL_TYPES } from "../constants/emailConstants.js";

const registerHospital = async (req, res) => {
  const { name, email, city, password, location } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email and password are required",
      success: false,
    });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      role: ROLES.HOSPITAL,
    });

    const hospital = await Hospital.create({
      userId: user._id,
      name,
      email,
      location: location || "",
      city: city || "",
    });

    // Enqueue background email
    await QueueService.addEmailJob(EMAIL_TYPES.WELCOME, {
      email: user.email,
      name: hospital.name,
    });

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

    return res.status(201).json({
      message: "Hospital registered successfully",
      success: true,
      token,
      hospital: {
        id: hospital._id, // Backward compatible ID
        userId: user._id,
        name: hospital.name,
        email: user.email,
        city: hospital.city,
        location: hospital.location,
        createdAt: hospital.createdAt,
      },
    });
  } catch (error) {
    console.error("Register hospital error:", error.message);

    return res.status(500).json({
      message: `Something went wrong while registering hospital: ${error.message}`,
      success: false,
    });
  }
};

const loginHospital = async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
      success: false,
    });
  }

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user || user.role !== ROLES.HOSPITAL) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }
    
    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    const hospital = await Hospital.findOne({ userId: user._id });

    if (!hospital) {
       return res.status(404).json({
        message: "Hospital profile not found for this user",
        success: false,
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
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      message: "Login successful",
      success: true,
      token,
      hospital: {
        id: hospital._id, // Backward compatible ID
        userId: user._id,
        name: hospital.name,
        email: user.email,
        city: hospital.city,
        location: hospital.location,
      },
    });
  } catch (error) {
    console.error("Hospital login error:", error.message);

    return res.status(500).json({
      message: "Login failed",
      success: false,
    });
  }
};



const registerPatient = async (req, res) => {
  const { name, email, password, age, bloodGroup } = req.body || {};

  if (!name || !email || !password || age === undefined || !bloodGroup) {
    return res.status(400).json({
      message: "All required fields must be provided",
      success: false,
    });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      role: ROLES.PATIENT,
    });

    const patient = await Patient.create({
      userId: user._id,
      name,
      email,
      age,
      bloodGroup,
    });

    // Enqueue background email
    await QueueService.addEmailJob(EMAIL_TYPES.WELCOME, {
      email: user.email,
      name: patient.name,
    });

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        name: patient.name,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      message: "Patient registered successfully",
      success: true,
      token,
      patient: {
        id: patient._id,
        userId: user._id,
        name: patient.name,
        email: user.email,
        age: patient.age,
        bloodGroup: patient.bloodGroup,
      },
    });
  } catch (error) {
    console.error("Register patient error:", error.message);

    return res.status(500).json({
      message: `Something went wrong while registering patient: ${error.message}`,
      success: false,
    });
  }
};

const loginPatient = async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
      success: false,
    });
  }

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user || user.role !== ROLES.PATIENT) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const patient = await Patient.findOne({ userId: user._id, isDeleted: false });

    if (!patient) {
      return res.status(404).json({
        message: "Patient profile not found",
        success: false,
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        name: patient.name,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful",
      success: true,
      token,
      patient: {
        id: patient._id,
        userId: user._id,
        name: patient.name,
        email: user.email,
        age: patient.age,
        bloodGroup: patient.bloodGroup,
      },
    });
  } catch (error) {
    console.error("Patient login error:", error.message);
    return res.status(500).json({
      message: "Login failed",
      success: false,
    });
  }
};

export { registerHospital, loginHospital, registerPatient, loginPatient };
