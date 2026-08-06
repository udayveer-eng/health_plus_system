import Hospital from "../models/Hospital.js";
import Patient from "../models/Patient.js";
import EmergencyRequest from "../models/EmergencyRequest.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import HealthService from "./healthService.js";
import CacheService from "./cacheService.js";

/**
 * Service to aggregate dashboard data
 */
class DashboardService {
  static async getHospitalDashboard(hospitalId) {
    const cacheKey = `dashboard:hospital:${hospitalId}`;
    const cachedData = await CacheService.get(cacheKey);
    if (cachedData) return cachedData;

    const [
      activeEmergencyRequests,
      completedEmergencyRequests,
    ] = await Promise.all([
      EmergencyRequest.countDocuments({ acceptedBy: hospitalId, status: { $in: ["ACCEPTED", "IN_PROGRESS"] } }),
      EmergencyRequest.countDocuments({ acceptedBy: hospitalId, status: "COMPLETED" }),
    ]);

    const result = {
      activeEmergencyRequests,
      completedEmergencyRequests,
    };

    await CacheService.set(cacheKey, result, 300); // Cache for 5 mins
    return result;
  }

  static async getPatientDashboard(patientId, userId) {
    const cacheKey = `dashboard:patient:${patientId}`;
    const cachedData = await CacheService.get(cacheKey);
    if (cachedData) return cachedData;

    const [
      activeEmergencyRequests,
      pastEmergencyRequests,
      notificationsCount,
    ] = await Promise.all([
      EmergencyRequest.find({ patientId: userId, status: { $in: ["PENDING", "ACCEPTED", "IN_PROGRESS"] } })
        .sort({ createdAt: -1 })
        .limit(3),
      EmergencyRequest.find({ patientId: userId, status: { $in: ["COMPLETED", "CANCELLED", "EXPIRED"] } })
        .sort({ createdAt: -1 })
        .limit(3),
      Notification.countDocuments({ userId, isRead: false }),
    ]);

    const result = {
      activeEmergencyRequests,
      pastEmergencyRequests,
      unreadNotificationsCount: notificationsCount,
    };

    await CacheService.set(cacheKey, result, 300);
    return result;
  }

  static async getAdminDashboard() {
    const cacheKey = `dashboard:admin`;
    const cachedData = await CacheService.get(cacheKey);
    if (cachedData) return cachedData;

    const [
      totalHospitals,
      totalPatients,
      totalActiveUsers,
      totalEmergencyRequests,
      systemHealth,
    ] = await Promise.all([
      Hospital.countDocuments({ isDeleted: false }),
      Patient.countDocuments({ isDeleted: false }),
      User.countDocuments({ isActive: true }),
      EmergencyRequest.countDocuments(),
      HealthService.getSystemHealth(),
    ]);

    const result = {
      totalHospitals,
      totalPatients,
      totalActiveUsers,
      totalEmergencyRequests,
      systemHealth,
    };

    await CacheService.set(cacheKey, result, 300);
    return result;
  }
}

export default DashboardService;
