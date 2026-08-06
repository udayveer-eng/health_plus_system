import Notification from "../models/Notification.js";
import SocketService from "./socketService.js";
import { SOCKET_EVENTS } from "../socket/socketEvents.js";

/**
 * Service to handle internal notification creation.
 * Other controllers (like Appointment or Prescription) can call this safely.
 */
class NotificationService {
  static async createNotification({ userId, type, title, message, metadata = {} }, session = null) {
    try {
      const payload = [{ userId, type, title, message, metadata }];
      
      let createdNotification;
      if (session) {
        const result = await Notification.create(payload, { session });
        createdNotification = result[0];
      } else {
        createdNotification = await Notification.create(payload[0]);
      }

      // Emit real-time event to the user
      SocketService.emitToUser(userId, SOCKET_EVENTS.NEW_NOTIFICATION, createdNotification);

      return createdNotification;
    } catch (error) {
      console.error("NotificationService Error:", error);
      // We usually don't want a notification failure to break the main transaction,
      // so we log it, but depending on requirements we might throw it.
      throw new Error("Failed to create notification");
    }
  }
}

export default NotificationService;
