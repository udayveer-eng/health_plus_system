import { createClient } from "redis";

class RedisClient {
  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
      socket: {
        reconnectStrategy: (retries) => {
          // Reconnect automatically, wait max 3 seconds between attempts
          return Math.min(retries * 100, 3000);
        },
      },
    });

    this.client.on("error", (err) => {
      console.error("Redis Client Error (Safe to ignore if Redis is offline):", err.message);
    });

    this.client.on("connect", () => {
      console.log("Redis connected successfully");
    });
  }

  async connect() {
    try {
      await this.client.connect();
    } catch (error) {
      console.error("Failed to connect to Redis on startup. API will bypass cache.");
    }
  }

  getClient() {
    return this.client;
  }
}

// Export a singleton instance
export const redisInstance = new RedisClient();
export const redisClient = redisInstance.getClient();
