import mongoose from "mongoose";
import EmergencyRequest from "../models/EmergencyRequest.js";
import Hospital from "../models/Hospital.js";
import User from "../models/User.js";
import QueueService from "../services/queueService.js";
import SocketService from "../services/socketService.js";
import AuditService from "../services/auditService.js";
import MatchEngine from "../utils/MatchEngine.js";
import { AUDIT_ACTIONS } from "../constants/auditConstants.js";
import { EMAIL_TYPES } from "../constants/emailConstants.js";
import redlock from "../config/redlock.js";

export const createEmergencyRequest = async (req, res) => {
  try {
    const {
      patientName,
      phone,
      city,
      resourceType,
      bedType,
      bloodGroup,
      quantity = 1,
      priority = "medium",
      message,
    } = req.body;

    const patientId = req.user.userId;

    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now

    const emergencyRequest = await EmergencyRequest.create({
      patientId,
      patientName,
      phone,
      city,
      resourceType,
      bedType,
      bloodGroup,
      quantity,
      priority,
      message,
      expiresAt,
    });

    AuditService.logEvent(AUDIT_ACTIONS.EMERGENCY_CREATED, patientId, { requestId: emergencyRequest._id });

    // Queue Expiration Job
    QueueService.addReminderJob("EXPIRE_EMERGENCY_REQUEST", { requestId: emergencyRequest._id }, 2 * 60 * 60 * 1000);
    
    // Queue Unaccepted Notification (e.g., 15 minutes)
    QueueService.addReminderJob("NOTIFY_UNACCEPTED_EMERGENCY", { requestId: emergencyRequest._id, city }, 15 * 60 * 1000);

    // Intelligent Matching Engine: Filter hospitals by capability to fulfill
    let resourceQuery = {};
    if (resourceType === 'bed') {
      resourceQuery[`beds.${bedType}.available`] = { $gte: quantity };
    } else if (resourceType === 'blood') {
      resourceQuery[`bloodInventory.${bloodGroup}`] = { $gte: quantity };
    } else if (resourceType === 'oxygen') {
      resourceQuery[`oxygenInventory.available`] = { $gte: quantity };
    }

    const hospitals = await Hospital.find({ 
      city: new RegExp(`^${city}$`, "i"), 
      isDeleted: false,
      ...resourceQuery 
    });

    for (const h of hospitals) {
      SocketService.emitToUser(h.userId.toString(), "NEW_EMERGENCY_REQUEST", emergencyRequest);
    }

    return res.status(201).json({
      success: true,
      message: "Emergency request created successfully",
      emergencyRequest,
    });
  } catch (error) {
    console.error("Create Emergency Request Error:", error);
    return res.status(500).json({ success: false, message: "Failed to create Emergency Request" });
  }
};

export const getHospitalEmergencyRequests = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user.userId });
    if (!hospital) return res.status(404).json({ success: false, message: "Hospital not found" });

    // Fetch all pending requests in the city (case-insensitive)
    const allPendingInCity = await EmergencyRequest.find({ 
      city: new RegExp(`^${hospital.city}$`, "i"), 
      status: { $in: ["pending", "PENDING"] } 
    });
    
    // Rank and filter requests using the MatchEngine
    const pendingRequests = MatchEngine.rankRequestsForHospital(hospital, allPendingInCity);

    const myRequests = await EmergencyRequest.find({ acceptedBy: hospital._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      pendingRequests,
      myRequests,
      hospitalInventory: {
        beds: hospital.beds,
        bloodInventory: hospital.bloodInventory,
        oxygenInventory: hospital.oxygenInventory
      }
    });
  } catch (error) {
    console.error("Get Emergency Requests Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch emergency requests" });
  }
};

export const getPatientEmergencyRequests = async (req, res) => {
  try {
    const emergencyRequests = await EmergencyRequest.find({ patientId: req.user.userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, emergencyRequests });
  } catch (error) {
    console.error("Get Patient Emergency Requests Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch patient emergency requests" });
  }
};

export const acceptEmergencyRequest = async (req, res) => {
  let lock;
  try {
    const { id } = req.params;
    const hospital = await Hospital.findOne({ userId: req.user.userId });
    if (!hospital) throw new Error("Hospital not found");

    // Acquire a distributed lock to prevent double-allocation of hospital resources
    try {
      lock = await redlock.acquire([`locks:hospital:${hospital._id}:inventory`], 1000);
    } catch (err) {
      return res.status(429).json({ success: false, message: "High concurrency: Hospital inventory is currently locked. Please retry." });
    }

    // 1. Atomically lock the emergency request first to prevent duplicate acceptance
    const reqDoc = await EmergencyRequest.findOneAndUpdate(
      { _id: id, status: { $in: ["pending", "PENDING"] } },
      { $set: { status: "ACCEPTED", acceptedBy: hospital._id, acceptedAt: new Date() } },
      { new: true }
    );
    
    if (!reqDoc) {
      return res.status(409).json({ success: false, message: "Request has already been accepted by another hospital or is no longer available." });
    }

    // 2. Atomically deduct inventory with strict conditions
    let updateQuery = {};
    let filterQuery = { _id: hospital._id };

    if (reqDoc.resourceType === "oxygen") {
      filterQuery["oxygenInventory.available"] = { $gte: reqDoc.quantity };
      updateQuery = { $inc: { "oxygenInventory.available": -reqDoc.quantity } };
    } else if (reqDoc.resourceType === "bed") {
      filterQuery[`beds.${reqDoc.bedType}.available`] = { $gte: reqDoc.quantity };
      updateQuery = { $inc: { [`beds.${reqDoc.bedType}.available`]: -reqDoc.quantity } };
    } else if (reqDoc.resourceType === "blood") {
      const bestBloodGroup = MatchEngine.getBestCompatibleBloodGroup(hospital, reqDoc.bloodGroup, reqDoc.quantity);
      if (!bestBloodGroup) {
        // Rollback request if inventory is actually insufficient (e.g. consumed right before this)
        await EmergencyRequest.updateOne({ _id: id }, { $set: { status: "PENDING", acceptedBy: null, acceptedAt: null } });
        return res.status(409).json({ success: false, message: "Insufficient blood available for this request." });
      }
      filterQuery[`bloodInventory.${bestBloodGroup}`] = { $gte: reqDoc.quantity };
      updateQuery = { $inc: { [`bloodInventory.${bestBloodGroup}`]: -reqDoc.quantity } };
    }

    const hospitalUpdateResult = await Hospital.updateOne(filterQuery, updateQuery);

    if (hospitalUpdateResult.modifiedCount === 0) {
      // Rollback request if hospital update failed (e.g. inventory dipped below required amount concurrently)
      await EmergencyRequest.updateOne({ _id: id }, { $set: { status: "PENDING", acceptedBy: null, acceptedAt: null } });
      return res.status(409).json({ success: false, message: "Failed to allocate resources. Inventory may have just depleted." });
    }

    AuditService.logStateTransition(
      req.user.userId, 
      req.user.role, 
      "EMERGENCY_ACCEPTED", 
      "EmergencyRequest", 
      reqDoc._id, 
      { status: "PENDING" }, 
      { status: "ACCEPTED", acceptedBy: hospital._id }
    );
    
    // Notify Patient
    SocketService.emitToUser(reqDoc.patientId.toString(), "EMERGENCY_STATUS_UPDATED", reqDoc);
    
    // Send Email
    const patientUser = await User.findById(reqDoc.patientId);
    if (patientUser) {
      QueueService.addEmailJob(EMAIL_TYPES.EMERGENCY_ACCEPTED, {
        email: patientUser.email,
        patientName: reqDoc.patientName,
        hospitalName: hospital.name,
        resourceType: reqDoc.resourceType
      });
    }

    return res.status(200).json({ success: true, message: "Request accepted successfully", emergencyRequest: reqDoc });
  } catch (error) {
    console.error("Accept Emergency Request Error:", error);
    return res.status(400).json({ success: false, message: error.message || "Failed to accept Request" });
  } finally {
    if (lock) {
      try {
        await lock.release();
      } catch (err) {
        console.error("Failed to release Redlock:", err.message);
      }
    }
  }
};

export const completeEmergencyRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const reqDoc = await EmergencyRequest.findById(id);
    if (!reqDoc) return res.status(404).json({ success: false, message: "Request not found" });

    reqDoc.status = "COMPLETED";
    reqDoc.completedAt = new Date();
    await reqDoc.save();

    AuditService.logEvent(AUDIT_ACTIONS.EMERGENCY_COMPLETED, req.user.userId, { requestId: reqDoc._id });
    SocketService.emitToUser(reqDoc.patientId.toString(), "EMERGENCY_STATUS_UPDATED", reqDoc);

    const patientUser = await User.findById(reqDoc.patientId);
    if (patientUser) {
      QueueService.addEmailJob(EMAIL_TYPES.EMERGENCY_COMPLETED, {
        email: patientUser.email,
        patientName: reqDoc.patientName,
        resourceType: reqDoc.resourceType
      });
    }

    return res.status(200).json({ success: true, emergencyRequest: reqDoc });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to complete Request" });
  }
};

export const cancelEmergencyRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const reqDoc = await EmergencyRequest.findById(id);
    if (!reqDoc) return res.status(404).json({ success: false, message: "Request not found" });

    // Restore inventory if it was accepted
    if (reqDoc.status === "ACCEPTED" || reqDoc.status === "IN_PROGRESS" || reqDoc.status === "accepted") {
      const hospital = await Hospital.findById(reqDoc.acceptedBy);
      if (hospital) {
        if (reqDoc.resourceType === "oxygen") hospital.oxygenInventory.available += reqDoc.quantity;
        else if (reqDoc.resourceType === "bed") hospital.beds[reqDoc.bedType].available += reqDoc.quantity;
        else if (reqDoc.resourceType === "blood") hospital.bloodInventory[reqDoc.bloodGroup] += reqDoc.quantity;
        await hospital.save();
      }
    }

    reqDoc.status = "CANCELLED";
    reqDoc.cancelledAt = new Date();
    await reqDoc.save();

    AuditService.logEvent(AUDIT_ACTIONS.EMERGENCY_CANCELLED, req.user.userId, { requestId: reqDoc._id });
    SocketService.emitToUser(reqDoc.patientId.toString(), "EMERGENCY_STATUS_UPDATED", reqDoc);
    if (reqDoc.acceptedBy) {
      const hospital = await Hospital.findById(reqDoc.acceptedBy);
      if (hospital) SocketService.emitToUser(hospital.userId.toString(), "EMERGENCY_STATUS_UPDATED", reqDoc);
    }

    return res.status(200).json({ success: true, emergencyRequest: reqDoc });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to cancel Request" });
  }
};
