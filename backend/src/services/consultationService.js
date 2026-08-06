import Consultation from "../models/Consultation.js";
import Appointment from "../models/Appointment.js";
import VideoService from "./videoService.js";
import NotificationService from "./notificationService.js";
import SocketService from "./socketService.js";
import QueueService from "./queueService.js";
import AuditService from "./auditService.js";
import { AUDIT_ACTIONS } from "../constants/auditConstants.js";
import { SOCKET_EVENTS } from "../socket/socketEvents.js";
import { EMAIL_TYPES } from "../constants/emailConstants.js";
import ROLES from "../constants/roles.js";
import mongoose from "mongoose";

class ConsultationService {
  /**
   * Orchestrates the creation of a consultation.
   */
  static async createConsultation({ appointmentId, createdBy, createdByRole }) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Validate Appointment
      const appointment = await Appointment.findById(appointmentId).populate("patientId doctorId").session(session);
      if (!appointment) {
        throw new Error("Appointment not found");
      }

      // Check if consultation already exists
      const existing = await Consultation.findOne({ appointmentId }).session(session);
      if (existing) {
        throw new Error("Consultation already exists for this appointment");
      }

      // 2. Generate Meeting via VideoService
      const meetingDetails = await VideoService.createMeeting({
        scheduledStartTime: appointment.appointmentDate,
        scheduledEndTime: new Date(new Date(appointment.appointmentDate).getTime() + 30 * 60000), // Assuming 30min slots
      });

      // 3. Create Consultation Record
      const [consultation] = await Consultation.create(
        [
          {
            appointmentId: appointment._id,
            doctorId: appointment.doctorId._id,
            patientId: appointment.patientId._id,
            meetingId: meetingDetails.meetingId,
            meetingUrl: meetingDetails.meetingUrl,
            meetingProvider: meetingDetails.provider,
            scheduledStartTime: appointment.appointmentDate,
            scheduledEndTime: new Date(new Date(appointment.appointmentDate).getTime() + 30 * 60000),
            createdBy,
          },
        ],
        { session }
      );

      // 4. Audit Log
      await AuditService.logEvent(
        createdBy,
        createdByRole,
        AUDIT_ACTIONS.CONSULTATION_CREATED,
        "Consultation",
        consultation._id,
        { meetingProvider: meetingDetails.provider },
        session
      );

      await session.commitTransaction();
      session.endSession();

      // 5. Asynchronous Side Effects
      
      // A. Real-time Events
      SocketService.emitToUser(consultation.patientId, SOCKET_EVENTS.CONSULTATION_CREATED, consultation);
      SocketService.emitToUser(consultation.doctorId, SOCKET_EVENTS.CONSULTATION_CREATED, consultation);

      // B. Email Job
      await QueueService.addEmailJob(EMAIL_TYPES.CONSULTATION_SCHEDULED, {
        email: appointment.patientId.email, // Patient email
        patientName: appointment.patientId.name,
        doctorName: appointment.doctorId.name,
        scheduledTime: consultation.scheduledStartTime.toISOString(),
        meetingUrl: consultation.meetingUrl,
      });

      // C. Reminder Jobs
      const timeUntilStart = new Date(consultation.scheduledStartTime).getTime() - Date.now();
      
      if (timeUntilStart > 30 * 60000) {
        await QueueService.addReminderJob("CONSULTATION_REMINDER", {
          consultationId: consultation._id,
          minutesLeft: 30,
        }, timeUntilStart - (30 * 60000));
      }

      if (timeUntilStart > 10 * 60000) {
        await QueueService.addReminderJob("CONSULTATION_REMINDER", {
          consultationId: consultation._id,
          minutesLeft: 10,
        }, timeUntilStart - (10 * 60000));
      }

      // D. In-app Notification
      await NotificationService.createNotification({
        userId: consultation.patientId,
        type: "CONSULTATION_CREATED",
        title: "Consultation Scheduled",
        message: `Your video consultation with Dr. ${appointment.doctorId.name} has been scheduled.`,
        metadata: { consultationId: consultation._id }
      });

      return consultation;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("ConsultationService.createConsultation Error:", error.message);
      throw error;
    }
  }

  static async startConsultation(consultationId, userId, role) {
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) throw new Error("Consultation not found");

    if (consultation.status === "cancelled" || consultation.status === "completed") {
      throw new Error("Cannot start a cancelled or completed consultation");
    }

    consultation.status = "active";
    if (!consultation.actualStartTime) {
      consultation.actualStartTime = new Date();
    }
    await consultation.save();

    await AuditService.logEvent(userId, role, AUDIT_ACTIONS.CONSULTATION_STARTED, "Consultation", consultation._id);
    
    // Broadcast
    SocketService.emitToUser(consultation.patientId, SOCKET_EVENTS.CONSULTATION_STARTED, { consultationId });
    SocketService.emitToUser(consultation.doctorId, SOCKET_EVENTS.CONSULTATION_STARTED, { consultationId });

    if (role === ROLES.DOCTOR) {
      SocketService.emitToUser(consultation.patientId, SOCKET_EVENTS.DOCTOR_JOINED, { consultationId });
    } else if (role === ROLES.PATIENT) {
      SocketService.emitToUser(consultation.doctorId, SOCKET_EVENTS.PATIENT_JOINED, { consultationId });
    }

    return consultation;
  }

  static async endConsultation(consultationId, userId, role) {
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) throw new Error("Consultation not found");

    consultation.status = "completed";
    consultation.actualEndTime = new Date();
    await consultation.save();

    // Call VideoService to clean up
    await VideoService.endMeeting(consultation.meetingId);

    await AuditService.logEvent(userId, role, AUDIT_ACTIONS.CONSULTATION_ENDED, "Consultation", consultation._id);

    SocketService.emitToUser(consultation.patientId, SOCKET_EVENTS.CONSULTATION_ENDED, { consultationId });
    SocketService.emitToUser(consultation.doctorId, SOCKET_EVENTS.CONSULTATION_ENDED, { consultationId });

    return consultation;
  }
}

export default ConsultationService;
