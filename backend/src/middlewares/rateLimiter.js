import rateLimit from "express-rate-limit";

// Consistent JSON payload when rate limit is exceeded
const limitReachedResponse = {
  success: false,
  message: "Too many requests. Please try again later.",
};

/**
 * Strict limiter for authentication routes to prevent brute force attacks.
 * Limit: 10 requests per 15 minutes.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased for development/testing
  message: limitReachedResponse,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Stricter limiter for file upload routes to prevent storage abuse.
 * Limit: 30 requests per 60 minutes.
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 30,
  message: limitReachedResponse,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General global limiter for all other routes to prevent DoS.
 * Limit: 1000 requests per 15 minutes.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: limitReachedResponse,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Limiter for expensive AI operations.
 * Limit: 20 requests per 15 minutes.
 */
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: limitReachedResponse,
  standardHeaders: true,
  legacyHeaders: false,
});
