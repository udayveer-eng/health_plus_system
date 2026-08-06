import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // Optional: Future-proofing for when doctors get their own logins
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    specialty: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["ONLINE", "OFFLINE", "ON_CALL", "IN_SURGERY"],
      default: "OFFLINE",
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster lookups during telemetry polling
doctorSchema.index({ hospitalId: 1, status: 1 });

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
