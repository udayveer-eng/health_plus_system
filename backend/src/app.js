import express from "express";
import cors from "cors";
import helmet from "helmet";
// import mongoSanitize from "express-mongo-sanitize"; // Incompatible with Express 5
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import hospitalProfileRoutes from "./routes/hospitalProfileRoutes.js";
import hospitalResourceRoutes from "./routes/hospitalResourceRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import emergencyRequestRoutes from "./routes/emergencyRequestRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import opsRoutes from "./routes/opsRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import ambulanceRoutes from "./routes/ambulanceRoutes.js";
import errorHandler from "./middlewares/errorMiddleware.js";
import { globalLimiter } from "./middlewares/rateLimiter.js";

const app = express();
app.use(
  cors({
    origin: "*", // Adjust in production depending on frontend URL
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(mongoSanitize()); // Prevent NoSQL injection - REMOVED: Throws Express 5 getter error. We rely on Zod validation instead.

// Request Logging
app.use(morgan("dev"));

// API Rate Limiting
app.use("/api", globalLimiter);

app.get("/rebel", (req, res) => {
  res.send("HealthPulse is  Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/hospital", hospitalProfileRoutes);
app.use("/api/hospital", hospitalResourceRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/emergency-requests", emergencyRequestRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/ops", opsRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/ambulances", ambulanceRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
