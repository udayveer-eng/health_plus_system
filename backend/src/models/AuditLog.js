import mongoose from "mongoose";
import { AUDIT_ACTIONS } from "../constants/auditConstants.js";

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: Object.values(AUDIT_ACTIONS),
      required: true,
      index: true,
    },
    resourceType: {
      type: String, // e.g., "Appointment", "Prescription"
      index: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId, // Generic reference
    },
    description: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // Flexible payload
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } } // Audit logs are append-only
);

// Create compound index for timeline sorting
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
