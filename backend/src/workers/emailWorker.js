import { Worker } from "bullmq";
import { getRedisConnectionForWorkers } from "../config/bullmq.js";
import EmailService from "../services/emailService.js";
import { EMAIL_TYPES } from "../constants/emailConstants.js";
import { generateWelcomeEmail } from "../templates/welcomeEmail.js";
import { generatePasswordResetEmail } from "../templates/passwordResetEmail.js";
import {
  generateConsultationScheduledEmail,
  generateConsultationReminderEmail,
  generateConsultationCancelledEmail,
} from "../templates/consultationEmailTemplates.js";

export const createEmailWorker = () => {
  const worker = new Worker(
    "EmailQueue",
    async (job) => {
      const { type, data } = job;
      
      let emailPayload = null;

      switch (type) {
        case EMAIL_TYPES.WELCOME:
          emailPayload = generateWelcomeEmail(data);
          break;
        case EMAIL_TYPES.PASSWORD_RESET:
          emailPayload = generatePasswordResetEmail(data);
          break;
        case EMAIL_TYPES.CONSULTATION_SCHEDULED:
          emailPayload = generateConsultationScheduledEmail(data);
          break;
        case EMAIL_TYPES.CONSULTATION_REMINDER:
          emailPayload = generateConsultationReminderEmail(data);
          break;
        case EMAIL_TYPES.CONSULTATION_CANCELLED:
          emailPayload = generateConsultationCancelledEmail(data);
          break;
        default:
          throw new Error(`Unknown email job type: ${type}`);
      }

      if (emailPayload) {
        await EmailService.sendEmail({
          to: data.email,
          subject: emailPayload.subject,
          html: emailPayload.html,
        });
      }
    },
    { connection: getRedisConnectionForWorkers() }
  );

  worker.on("completed", (job) => {
    // Optionally log successful completions
  });

  worker.on("failed", (job, err) => {
    // Log failure context exactly as the user requested
    console.error(`[EMAIL WORKER ERROR] Failed to send email.`);
    console.error(`  - Job ID: ${job.id}`);
    console.error(`  - Type: ${job.name}`);
    console.error(`  - Recipient: ${job.data?.email}`);
    console.error(`  - Error: ${err.message}`);
    console.error(`  - Timestamp: ${new Date().toISOString()}`);
  });

  return worker;
};
