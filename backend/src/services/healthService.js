import mongoose from "mongoose";
import { redisClient } from "../config/redis.js";
import QueueService from "./queueService.js";
import { getSocketMetrics } from "../socket/socket.js";
import CacheService from "./cacheService.js";
import os from "os";

class HealthService {
  static async getSystemHealth() {
    const mongoStatus = mongoose.connection.readyState === 1 ? "ok" : "down";
    const redisStatus = redisClient.isOpen ? "ok" : "down";
    
    // Uptime & Memory
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    // Queue Status
    const queueMetrics = await QueueService.getMetrics();
    const queueStatus = queueMetrics.failed > 50 ? "degraded" : "ok";

    // Socket Status
    const socketMetrics = getSocketMetrics();
    const socketStatus = "ok"; // Assuming OK if process is running

    // Cache Metrics
    const cacheMetrics = await CacheService.getMetrics();

    return {
      status: [mongoStatus, redisStatus].includes("down") ? "degraded" : "ok",
      timestamp: new Date().toISOString(),
      services: {
        mongodb: mongoStatus,
        redis: redisStatus,
        bullmq: queueStatus,
        socketio: socketStatus,
      },
      metrics: {
        uptime,
        memoryUsage: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        },
        cpuLoad: os.loadavg(),
        queues: queueMetrics,
        sockets: socketMetrics,
        cache: cacheMetrics,
      },
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
    };
  }
}

export default HealthService;
