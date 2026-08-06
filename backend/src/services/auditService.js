import AuditLog from "../models/AuditLog.js";

class AuditService {
  /**
   * Log an event to the AuditLog collection
   * @param {Object} logData
   * @param {string} logData.userId - User who performed the action
   * @param {string} logData.role - Role of the user
   * @param {string} logData.action - Action constant (e.g., AUTH_LOGIN)
   * @param {string} [logData.resourceType] - e.g. "Appointment"
   * @param {string} [logData.resourceId] - ID of the resource
   * @param {string} [logData.description] - Human readable summary
   * @param {string} [logData.ipAddress] - Captured from req.ip
   * @param {string} [logData.userAgent] - Captured from req.get("User-Agent")
   * @param {Object} [logData.metadata] - Extra contextual info
   */
  static async log(logData) {
    try {
      const log = new AuditLog(logData);
      await log.save();
      // NOTE: In the future, this is where we could also publish to a BullMQ queue
      // or Redis stream for real-time monitoring/AI analysis
    } catch (error) {
      console.error("AuditService: Failed to write audit log", error.message);
      // We don't throw here to avoid failing the main user request
    }
  }

  static async logEvent(userId, role, action, resourceType = null, resourceId = null, metadata = {}, session = null) {
    try {
      const log = new AuditLog({
        userId,
        role,
        action,
        resourceType,
        resourceId,
        metadata
      });
      
      if (session) {
        await log.save({ session });
      } else {
        await log.save();
      }
    } catch (error) {
      console.error(`AuditService: Failed to write audit log for action ${action}`, error.message);
    }
  }

  /**
   * Log a state transition with previous and new states
   */
  static async logStateTransition(userId, role, action, resourceType, resourceId, previousState, newState) {
    try {
      const log = new AuditLog({
        userId,
        role: role || "SYSTEM",
        action,
        resourceType,
        resourceId,
        metadata: {
          previousState,
          newState
        }
      });
      await log.save();
    } catch (error) {
      console.error(`AuditService: Failed to log state transition for ${action}`, error.message);
    }
  }
}

export default AuditService;
