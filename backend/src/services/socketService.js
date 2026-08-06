import { getIo } from "../socket/socket.js";
import { SOCKET_EVENTS } from "../socket/socketEvents.js";

class SocketService {
  /**
   * Safely emit an event to a specific user
   */
  static emitToUser(userId, event, payload) {
    try {
      const io = getIo();
      if (io) {
        io.to(`user:${userId}`).emit(event, payload);
      }
    } catch (error) {
      console.error(`SocketService: Failed to emit ${event} to user ${userId}`, error);
    }
  }

  /**
   * Safely emit an event to a specific role
   */
  static emitToRole(role, event, payload) {
    try {
      const io = getIo();
      if (io) {
        io.to(`role:${role}`).emit(event, payload);
      }
    } catch (error) {
      console.error(`SocketService: Failed to emit ${event} to role ${role}`, error);
    }
  }

  /**
   * Safely emit an event to a specific geographic region
   */
  static emitToRegion(region, event, payload) {
    try {
      const io = getIo();
      if (io && region) {
        io.to(`region:${region.toLowerCase()}`).emit(event, payload);
      }
    } catch (error) {
      console.error(`SocketService: Failed to emit ${event} to region ${region}`, error);
    }
  }
}

export default SocketService;
