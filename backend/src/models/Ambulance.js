import mongoose from "mongoose";

const ambulanceSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      index: true,
    },
    vehicleNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true, // A vehicle number should be unique across the platform
    },
    driverName: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "EN_ROUTE", "MAINTENANCE"],
      default: "AVAILABLE",
    },
    equipmentLevel: {
      type: String,
      enum: ["BASIC", "ADVANCED_ALS"],
      default: "BASIC",
    },
    currentLocation: {
      // Future-proofing for GPS integration
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    destinationZone: {
      type: String,
      default: null,
    },
    etaMinutes: {
      type: Number,
      default: null,
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

// Indexes for faster lookups and geo-spatial queries
ambulanceSchema.index({ hospitalId: 1, status: 1 });
ambulanceSchema.index({ currentLocation: "2dsphere" });

const Ambulance = mongoose.model("Ambulance", ambulanceSchema);

export default Ambulance;
