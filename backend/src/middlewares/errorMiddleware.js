import { ZodError } from "zod";
import AuditService from "../services/auditService.js";

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Internal Server Error";
  let errors = [];

  // 1. Zod Validation Errors
  if (err.name === "ZodError") {
    statusCode = 400;
    message = "Validation failed";
    errors = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
  }

  // 2. Mongoose Validation Errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Database validation failed";
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // 3. Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate value entered";
    errors = Object.keys(err.keyValue).map((key) => ({
      field: key,
      message: `The value '${err.keyValue[key]}' already exists`,
    }));
  }

  // 4. Mongoose Cast Error (Invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Resource not found or invalid ID format";
    errors = [
      {
        field: err.path,
        message: `Invalid format for ${err.value}`,
      },
    ];
  }

  // 5. JWT Errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token, authorization denied";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired, please log in again";
  }

  // Log unhandled server errors using our Audit Logs (fire and forget)
  // We use a system ID here, or omit the user.
  AuditService.logEvent(
    null, 
    "SYSTEM", 
    "UNHANDLED_ERROR", 
    "System", 
    null, 
    { message: err.message, stack: err.stack }
  ).catch(e => console.error("Failed to log error to AuditService", e));

  // Default: Unknown server error
  res.status(err.statusCode || 500).json({
    success: false,
    message,
    errors: errors.length > 0 ? errors : undefined,
  });
};

export default errorHandler;
