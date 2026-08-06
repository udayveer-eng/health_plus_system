import { Queue } from "bullmq";

// Re-use standard redis config string for BullMQ connections
// BullMQ requires an explicit connection object or IORedis instance
const redisConnection = {
  url: process.env.REDIS_URL || "redis://localhost:6379",
};

const defaultJobOptions = {
  attempts: 3, // Retry failed jobs 3 times
  backoff: {
    type: "exponential",
    delay: 5000, // Wait 5s, then 25s, then 125s
  },
  removeOnComplete: true, // Keep Redis clean
  removeOnFail: false, // Keep failures for manual inspection/retry
};

// Independent Queues
export const emailQueue = new Queue("EmailQueue", {
  connection: redisConnection,
  defaultJobOptions,
});

export const notificationQueue = new Queue("NotificationQueue", {
  connection: redisConnection,
  defaultJobOptions,
});

export const reminderQueue = new Queue("ReminderQueue", {
  connection: redisConnection,
  defaultJobOptions,
});

export const aiQueue = new Queue("AIQueue", {
  connection: redisConnection,
  defaultJobOptions,
});

export const getRedisConnectionForWorkers = () => redisConnection;
