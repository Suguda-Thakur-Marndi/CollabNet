import rateLimit from "express-rate-limit"

/**
 * Shared rate limit options.
 * Uses in-memory store (single-instance dev). 
 * In production: swap with RedisStore from 'rate-limit-redis'.
 */

/** Auth routes: 20 attempts per 15 minutes per IP */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "RATE_LIMITED",
    message: "Too many authentication attempts. Please try again later.",
  },
})

/** AI Copilot: 30 requests per minute per IP */
export const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "AI_RATE_LIMITED",
    message: "AI request rate limit exceeded. Please wait before trying again.",
  },
})

/** General API: 200 requests per minute per IP */
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "RATE_LIMITED",
    message: "Too many requests. Please slow down.",
  },
})
