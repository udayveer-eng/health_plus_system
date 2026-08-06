import HealthService from "../services/healthService.js";
import ROLES from "../constants/roles.js";

/**
 * Controller for Operational Endpoints
 */
export const getHealth = async (req, res, next) => {
  try {
    // Only super-admins should see full telemetry
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const health = await HealthService.getSystemHealth();
    
    // HTTP status could reflect overall health, but 200 is fine for an admin dashboard fetching data
    const statusCode = health.status === "ok" ? 200 : 503;

    return res.status(statusCode).json({
      success: true,
      data: health,
    });
  } catch (error) {
    next(error);
  }
};
