// src/middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';

// Generic API rate limiter
export const createApiLimiter = (windowMinutes = 15, max = 300) => rateLimit({
  windowMs: Number(windowMinutes) * 60 * 1000 || 15 * 60 * 1000,
  max: Number(max) || 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => req.method === 'GET' && req.path.includes('/api/public')
});

// Strict login rate limiter
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 12, // Allow 12 login attempts per window
  skipSuccessfulRequests: true, // Don't count successful logins
  message: 'Too many login attempts. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false
});

// Password reset rate limiter
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Only 3 password reset requests per hour
  message: 'Too many password reset requests. Please try again after 1 hour.',
  standardHeaders: true,
  legacyHeaders: false
});

// Account creation rate limiter
export const accountCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Maximum 10 account creations per hour
  message: 'Too many account creation attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Write operation rate limiter
export const writeOperationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 write operations per window
  message: 'Too many write operations. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'GET' // Skip GET requests
});

// Combined security middleware for authentication endpoints
export const authSecurityLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests to auth endpoints per window
  message: 'Too many authentication requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// General API protection
export const generalApiLimiter = createApiLimiter(15, 300);