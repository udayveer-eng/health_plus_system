import AuditLog from "../models/AuditLog.js";
import QueryBuilder from "../utils/QueryBuilder.js";

export const getAuditLogs = async (req, res, next) => {
  try {
    const builder = new QueryBuilder(AuditLog.find(), req.query)
      .search(["action", "resourceType", "description"])
      .filter()
      .sort("-createdAt") // Default to newest first
      .paginate();

    builder.query = builder.query.populate("userId", "name email");

    const result = await builder.execute();

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogById = async (req, res, next) => {
  try {
    const log = await AuditLog.findById(req.params.id).populate("userId", "name email");
    
    if (!log) {
      const error = new Error("Audit log not found");
      error.status = 404;
      return next(error);
    }

    return res.status(200).json({
      success: true,
      log,
    });
  } catch (error) {
    next(error);
  }
};
