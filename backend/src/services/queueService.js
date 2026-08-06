import { emailQueue, notificationQueue, reminderQueue, aiQueue } from "../config/bullmq.js";

class QueueService {
  /**
   * Add a transactional email job to the queue
   * @param {string} type - e.g., 'WELCOME_EMAIL', 'PASSWORD_RESET'
   * @param {Object} payload - Data for the email template
   */
  static async addEmailJob(type, payload) {
    try {
      await emailQueue.add(type, payload);
    } catch (error) {
      console.error(`QueueService: Failed to enqueue Email Job [${type}]`, error.message);
    }
  }

  /**
   * Add an in-app system notification job to the queue
   * @param {string} type - e.g., 'LAB_REPORT_READY', 'PRESCRIPTION_READY'
   * @param {Object} payload - Notification data (userId, title, message)
   */
  static async addNotificationJob(type, payload) {
    try {
      await notificationQueue.add(type, payload);
    } catch (error) {
      console.error(`QueueService: Failed to enqueue Notification Job [${type}]`, error.message);
    }
  }

  /**
   * Add a reminder to be executed later (or immediately if overdue)
   * @param {string} type - e.g., 'APPOINTMENT_REMINDER'
   * @param {Object} payload - Reminder data
   * @param {number} delayMs - Optional delay in milliseconds
   */
  static async addReminderJob(type, payload, delayMs = 0) {
    try {
      await reminderQueue.add(type, payload, { delay: delayMs });
    } catch (error) {
      console.error(`QueueService: Failed to enqueue Reminder Job [${type}]`, error.message);
    }
  }

  /**
   * Get overall queue metrics for operations dashboard
   */
  static async getMetrics() {
    try {
      const queues = [emailQueue, notificationQueue, reminderQueue, aiQueue];
      let waiting = 0, active = 0, delayed = 0, completed = 0, failed = 0;

      for (const queue of queues) {
        const counts = await queue.getJobCounts();
        waiting += counts.waiting || 0;
        active += counts.active || 0;
        delayed += counts.delayed || 0;
        completed += counts.completed || 0;
        failed += counts.failed || 0;
      }

      return { waiting, active, delayed, completed, failed };
    } catch (error) {
      console.error("QueueService: Failed to get metrics", error.message);
      return { waiting: 0, active: 0, delayed: 0, completed: 0, failed: 0 };
    }
  }
}

export default QueueService;
