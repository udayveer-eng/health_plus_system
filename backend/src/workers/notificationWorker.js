import { Worker } from "bullmq";
import { getRedisConnectionForWorkers } from "../config/bullmq.js";
import NotificationService from "../services/notificationService.js";

export const createNotificationWorker = () => {
  const worker = new Worker(
    "NotificationQueue",
    async (job) => {
      const { type, data } = job;
      const { userId, title, message, metadata } = data;
      
      // We delegate to the existing NotificationService
      // NotificationService creates a record in the database
      await NotificationService.createNotification(
        userId,
        type,
        title,
        message,
        metadata
      );
      
      // In the future, Socket.IO can emit events from here or from NotificationService
    },
    { connection: getRedisConnectionForWorkers() }
  );

  worker.on("completed", (job) => {
    console.log(`[NOTIF WORKER] Job ${job.id} completed!`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[NOTIF WORKER] Job ${job.id} failed:`, err.message);
  });

  return worker;
};
