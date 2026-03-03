import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const apiRateLimiter = rateLimit({
  windowMs: env.apiRateLimitWindowMs,
  max: env.apiRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests, please try again shortly.'
  }
});

export const authRateLimiter = rateLimit({
  windowMs: env.apiRateLimitWindowMs,
  max: env.authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many auth attempts. Please wait before trying again.'
  }
});

/**
 * Per-user rate limit for manual price checks.
 * Each user can trigger at most 10 manual checks per hour.
 * The key is req.userId which is set by the requireUserId middleware
 * before this limiter runs.
 */
export const manualCheckRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  keyGenerator: (req) => req.userId || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Manual check limit reached. You can trigger up to 10 manual checks per hour.'
  }
});

/**
 * Strict rate limit for password reset routes.
 * Maximum 5 requests per 15 minutes per IP.
 * Prevents email enumeration and SendGrid quota abuse.
 */
export const passwordResetRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many password reset attempts. Please wait 15 minutes before trying again.'
  }
});
