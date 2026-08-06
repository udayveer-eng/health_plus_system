import mongoose from "mongoose";
import {
  BED_TYPES,
  BLOOD_GROUPS,
  REQUEST_STATUSES,
  RESOURCE_TYPES,
  PRIORITY_LEVELS,
} from "../constants/resourceConstants.js";

const emergencyRequestSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    resourceType: {
      type: String,
      required: true,
      enum: RESOURCE_TYPES,
    },

    quantity: {
      type: Number,
      min: 1,
      default: 1,
    },

    priority: {
      type: String,
      enum: PRIORITY_LEVELS,
      default: "medium",
    },

    bedType: {
      type: String,
      enum: BED_TYPES,
      required: function () {
        return this.resourceType === "bed"; // conditional validation
      },
    },

    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: function () {
        return this.resourceType === "blood"; // conditional validation
      },
    },

    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      default: null,
    },

    status: {
      type: String,
      enum: REQUEST_STATUSES,
      default: "pending",
    },

    expiresAt: {
      type: Date,
    },
    acceptedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },

    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  },
);

// Optimizes fetching pending requests for a specific city
emergencyRequestSchema.index({ city: 1, status: 1 });

const EmergencyRequest = mongoose.model(
  "EmergencyRequest",
  emergencyRequestSchema,
);

export default EmergencyRequest;
