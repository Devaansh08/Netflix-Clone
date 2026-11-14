/**
 * @file rateLimiter.js
 * @description API rate limiting middleware using express-rate-limit.
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Denial of Service (DoS) Prevention: Without rate limiting, a single rogue client or script
 *    could flood the server with thousands of requests per second, exhausting CPU, memory, and database connections.
 * 2. Brute-Force & Credential Stuffing Defense: Rate limits drastically slow down automated password guessing
 *    and endpoint probing.
 * 3. Downstream API Cost Protection: Third-party APIs like TMDB impose strict rate limits. Throttling incoming
 *    traffic protects our server from exceeding external quotas or incurring billing spikes.
 * 4. Standardized Headers: Using `standardHeaders: true` sends `RateLimit-*` headers (RFC draft), allowing clients
 *    to gracefully handle backoff and understand their remaining request budget.
 */

import rateLimit from 'express-rate-limit';

/**
 * Global rate limiter: restricts each IP to 100 requests per 15-minute window.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return standard RateLimit-* headers in response
  legacyHeaders: false, // Disable X-RateLimit-* deprecated headers
  message: {
    success: false,
    message: 'Too many requests from this IP address. Please try again after 15 minutes.'
  },
  // Skip rate limiting in test environments to avoid flaky integration tests
  skip: () => process.env.NODE_ENV === 'test'
});

export default globalLimiter;
