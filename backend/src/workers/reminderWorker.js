import { Worker } from "bullmq";
import { getRedisConnectionForWorkers } from "../config/bullmq.js";
import NotificationService from "../services/notificationService.js";
import EmergencyRequest from "../models/EmergencyRequest.js";
import Hospital from "../models/Hospital.js";
import AuditService from "../services/auditService.js";
import { AUDIT_ACTIONS } from "../constants/auditConstants.js";

export const createReminderWorker = () => {
  const worker = new Worker(
    "ReminderQueue",
    async (job) => {
      const { type, data } = job;
      
      switch (type) {
        case "APPOINTMENT_REMINDER":
          // A reminder might just be sending a notification and an email
          await NotificationService.createNotification(
            data.userId,
            type,
            "Upcoming Appointment",
            `You have an appointment coming up at ${data.appointmentTime}`,
            data.metadata
          );
          // If we want an email, we could push back to QueueService.addEmailJob() here
          break;
        case "CONSULTATION_REMINDER":
          // Enqueue an email job for the consultation reminder
          // We would typically fetch the consultation here, but assuming `data` has what we need:
          const { consultationId, minutesLeft } = data;
          // In reality, we'd fetch Consultation and populate patient/doctor to get emails.
          // Since this is a worker, we should ideally decouple it or just use NotificationService.
          await NotificationService.createNotification({
            userId: data.patientId || null, // Best practice: query DB here
            type: "CONSULTATION_STARTING",
            title: "Consultation Starting Soon",
            message: `Your consultation is starting in ${minutesLeft} minutes.`,
            metadata: { consultationId }
          });
          break;
        case "EXPIRE_EMERGENCY_REQUEST": {
          const { requestId } = data;
          const reqDoc = await EmergencyRequest.findById(requestId);
          // If still pending, expire it
          if (reqDoc && (reqDoc.status === "pending" || reqDoc.status === "PENDING")) {
            reqDoc.status = "EXPIRED";
            reqDoc.expiresAt = new Date(); // or just keep original expiresAt
            await reqDoc.save();
            await AuditService.logEvent(AUDIT_ACTIONS.EMERGENCY_EXPIRED, "SYSTEM", { requestId: reqDoc._id });
            await NotificationService.createNotification(
              reqDoc.patientId,
              "EMERGENCY_EXPIRED",
              "Emergency Request Expired",
              "Your emergency request has expired without being accepted.",
              { requestId: reqDoc._id }
            );
          }
          break;
        }
        case "NOTIFY_UNACCEPTED_EMERGENCY": {
          const { requestId, city } = data;
          const unacceptedReq = await EmergencyRequest.findById(requestId);
          if (unacceptedReq && (unacceptedReq.status === "pending" || unacceptedReq.status === "PENDING")) {
            // Find all hospitals in the city
            const hospitals = await Hospital.find({ city: city });
            for (const h of hospitals) {
               await NotificationService.createNotification(
                 h.userId,
                 "EMERGENCY_UNACCEPTED",
                 "Urgent: Unaccepted Emergency",
                 "A critical emergency request in your city is still pending.",
                 { requestId: unacceptedReq._id }
               );
            }
          }
          break;
        }
        default:
          console.warn(`[REMINDER WORKER] Unknown job type: ${type}`);
      }
    },
    { connection: getRedisConnectionForWorkers() }
  );

  worker.on("completed", (job) => {
    console.log(`[REMINDER WORKER] Job ${job.id} completed!`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[REMINDER WORKER] Job ${job.id} failed:`, err.message);
  });

  return worker;
};
