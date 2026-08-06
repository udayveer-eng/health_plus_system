import dotenv from "dotenv";
import mongoose from "mongoose";
import AuditService from "./src/services/auditService.js";
import { AUDIT_ACTIONS } from "./src/constants/auditConstants.js";

import app from "./src/app.js";

dotenv.config();

import validateEnv from "./src/config/envValidator.js";
validateEnv();

import connectDB from "./src/utils/db.js";
connectDB();

import { redisInstance, redisClient } from "./src/config/redis.js";
redisInstance.connect();

// Infrastructure Observers
mongoose.connection.on("disconnected", () => {
  AuditService.logEvent(null, "SYSTEM", AUDIT_ACTIONS.DB_DISCONNECT, "System", null, { time: new Date().toISOString() })
    .catch(err => console.error(err));
});

redisClient.on("error", (err) => {
  AuditService.logEvent(null, "SYSTEM", AUDIT_ACTIONS.REDIS_DISCONNECT, "System", null, { error: err.message })
    .catch(e => console.error(e));
});

import { createEmailWorker } from "./src/workers/emailWorker.js";
import { createNotificationWorker } from "./src/workers/notificationWorker.js";
import { createReminderWorker } from "./src/workers/reminderWorker.js";

createEmailWorker();
createNotificationWorker();
createReminderWorker();

import { initSocket } from "./src/socket/socket.js";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server runnig on port ${PORT}`);
});

// Initialize Socket.IO
initSocket(server);

// Start Command Center Telemetry Broadcast
import TelemetryService from "./src/services/telemetryService.js";
TelemetryService.start();

// Log Server Restart
AuditService.logEvent(null, "SYSTEM", AUDIT_ACTIONS.SERVER_RESTART, "System", null, { port: PORT })
  .catch(err => console.error("Failed to log server restart:", err));
