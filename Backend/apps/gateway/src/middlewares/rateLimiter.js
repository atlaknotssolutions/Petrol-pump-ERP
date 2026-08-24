const rateLimit = require('express-rate-limit');
const config = require('../config');

/**
 * Global rate limiter applied to all /api routes. Keyed by authenticated
 * user id when available (post gatewayAuth), else by IP — so logged-in
 * users get a fair per-account budget instead of sharing an office IP's
 * limit.
 */
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});

/**
 * Stricter limiter for unauthenticated auth endpoints (login/register) to
 * slow down credential-stuffing / brute-force attempts.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
});

module.exports = { apiLimiter, authLimiter };
