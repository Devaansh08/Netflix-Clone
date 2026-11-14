/**
 * @file errorHandler.js
 * @description Centralized error-handling middleware and 404 Route Not Found handler.
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Information Leakage Prevention: In production, unhandled exceptions can dump database query structures,
 *    filesystem paths, or internal tokens in stack traces. The centralized handler intercepts all errors and
 *    ensures clients receive clean, uniform JSON responses without exposing internal server architecture.
 * 2. Uniform API Contract: The frontend team can rely on a consistent response structure:
 *    `{ success: false, message: string, errors?: Array }`, simplifying error rendering in UI notifications/toasts.
 * 3. Centralized Observability: Provides a single funnel point to log errors, measure error rates, or pipe
 *    diagnostics to application monitoring platforms (e.g., Sentry, Datadog) without polluting controller code.
 */

import env from '../config/env.js';

/**
 * Custom application error class with HTTP status code support.
 */
export class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message.
   * @param {number} statusCode - HTTP status code (default: 500).
   * @param {Array|null} errors - Optional array of granular validation issues.
   */
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Operational errors are expected runtime errors (validation, auth, not found)
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Handler for unmatched routes.
 * Ensures that undefined endpoints return structured JSON rather than default HTML error pages.
 */
export const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Cannot ${req.method} ${req.originalUrl} - Route not found`, 404);
  next(error);
};

/**
 * Central Error-Handling Middleware (Express signature: 4 parameters: err, req, res, next).
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with specified identifier: ${err.value}`;
  }

  // Handle Mongoose Schema Validation Errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed on input data';
    errors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message
    }));
  }

  // Handle MongoDB Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    const duplicateField = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value entered for ${duplicateField}. Please choose another.`;
  }

  // Handle JWT Malformed / Expired Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token. Please log in again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired. Please log in again.';
  }

  // Log server errors for developer visibility (non-operational or 500 errors)
  if (!err.isOperational && statusCode === 500) {
    console.error(`[Unhandled Internal Server Error] ${req.method} ${req.url}:`, err);
  }

  // Construct standardized JSON payload
  const responsePayload = {
    success: false,
    message,
    ...(errors && { errors }),
    // Include stack trace only in development to aid debugging; NEVER in production
    ...(env.isDevelopment && { stack: err.stack })
  };

  res.status(statusCode).json(responsePayload);
};

export default errorHandler;
