import { redisClient } from "../config/redis.js";

class CacheService {
  /**
   * Safe getter that bypasses cache if Redis is down
   */
  static async get(key) {
    try {
      if (!redisClient.isOpen) return null;
      const data = await redisClient.get(key);
      if (data) {
        // Increment hit counter silently (fire and forget)
        redisClient.incr("metrics:cache:hits").catch(() => {});
        return JSON.parse(data);
      }
      
      // Increment miss counter silently
      redisClient.incr("metrics:cache:misses").catch(() => {});
      return null;
    } catch (error) {
      console.error(`CacheService GET error for key ${key}:`, error.message);
      return null;
    }
  }

  /**
   * Safe setter that bypasses cache if Redis is down
   * @param {string} key
   * @param {any} value
   * @param {number} ttlSeconds
   */
  static async set(key, value, ttlSeconds = 300) {
    try {
      if (!redisClient.isOpen) return;
      await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.error(`CacheService SET error for key ${key}:`, error.message);
    }
  }

  /**
   * Safe deletion (invalidation)
   */
  static async del(key) {
    try {
      if (!redisClient.isOpen) return;
      await redisClient.del(key);
    } catch (error) {
      console.error(`CacheService DEL error for key ${key}:`, error.message);
    }
  }
  /**
   * Get cache metrics
   */
  static async getMetrics() {
    if (!redisClient.isOpen) {
      return { hits: 0, misses: 0 };
    }
    try {
      const [hits, misses] = await Promise.all([
        redisClient.get("metrics:cache:hits"),
        redisClient.get("metrics:cache:misses")
      ]);
      return {
        hits: hits ? parseInt(hits, 10) : 0,
        misses: misses ? parseInt(misses, 10) : 0
      };
    } catch (error) {
      return { hits: 0, misses: 0 };
    }
  }
}

export default CacheService;
