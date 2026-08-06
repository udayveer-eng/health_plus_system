import mongoose from "mongoose";
import ROLES from "../constants/roles.js";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Prevents password from being returned in queries by default
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Removed explicit email index because unique: true already creates one

const User = mongoose.model("User", userSchema);

export default User;
