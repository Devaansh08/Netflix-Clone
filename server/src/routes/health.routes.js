/**
 * @file health.routes.js
 * @description Health check endpoint for system observability, deployment pipelines, and uptime monitoring.
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Cloud Readiness & Liveness Probes: Cloud platforms (Render, Kubernetes, AWS ECS) ping `/api/health`
 *    to determine if a container is alive and ready to accept incoming user traffic. If unhealthy, the orchestrator
 *    can restart the container or drain traffic gracefully.
 * 2. Database Status Transparency: Checking `mongoose.connection.readyState` surfaces whether the app is running
 *    in a degraded state (e.g. connected to HTTP network, but severed from the database).
 * 3. Zero Authentication Barrier: Health endpoints are intentionally public so external monitors do not need
 *    to manage rotating API tokens or user sessions.
 */

import { Router } from 'express';
import mongoose from 'mongoose';
import env from '../config/env.js';

const router = Router();

// Mapping for Mongoose readyState values
const dbStateMap = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

/**
 * @route   GET /api/health
 * @desc    Returns server health, uptime, environment, and database connection state
 * @access  Public
 */
router.get('/', (req, res) => {
  const dbStateCode = mongoose.connection.readyState;
  const dbStatus = dbStateMap[dbStateCode] || 'unknown';
  const isHealthy = dbStateCode === 1; // 1 = connected

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    message: isHealthy ? 'StreamVerse API is healthy and operational' : 'StreamVerse API is running in degraded mode',
    environment: env.NODE_ENV,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      host: mongoose.connection.host || 'unconnected',
      name: mongoose.connection.name || 'unconnected'
    }
  });
});

export default router;
