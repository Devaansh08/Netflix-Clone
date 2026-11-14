/**
 * @file server.js
 * @description Entry point for the StreamVerse HTTP server application.
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Decoupled Architecture: Keeping server initialization (listening on port) separate from
 *    Express configuration (`app.js`) allows Supertest to test HTTP controllers without port collisions.
 * 2. Graceful Shutdown: In containerized environments like Docker, Kubernetes, or Render, instances are
 *    frequently stopped or scaled down. Capturing `SIGTERM` and `SIGINT` guarantees that active HTTP
 *    connections are drained and MongoDB connection pools are safely closed before the process exits,
 *    preventing half-written transactions or dropped client requests.
 * 3. Global Exception Trapping: Catching `uncaughtException` and `unhandledRejection` prevents silent
 *    process death and records the exact stack trace before exiting cleanly.
 */

import app from './app.js';
import env from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';

let server;

/**
 * Initializes database connection and launches HTTP listener.
 */
const startServer = async () => {
  // 1. Establish database connection before accepting traffic
  await connectDB();

  // 2. Bind HTTP server to configured port
  server = app.listen(env.PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 StreamVerse API Server running in [${env.NODE_ENV}] mode`);
    console.log(`📡 Listening on: http://localhost:${env.PORT}`);
    console.log(`🔗 Health Check: http://localhost:${env.PORT}/api/health`);
    console.log(`🌐 Allowed Client Origin: ${env.CLIENT_URL}`);
    console.log(`====================================================`);
  });
};

/**
 * Gracefully shuts down the HTTP server and database connection pool.
 * @param {string} signal - Triggering termination signal (e.g. SIGINT, SIGTERM)
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Starting graceful shutdown procedure...`);

  if (server) {
    // Stop accepting new incoming HTTP connections
    server.close(async () => {
      console.log('[Server] HTTP server closed. Disconnecting from database...');
      // Close database connection pool
      await disconnectDB();
      console.log('[Server] Graceful shutdown completed cleanly. Exiting process.');
      process.exit(0);
    });

    // Force termination if cleanup takes longer than 10 seconds (failsafe timeout)
    setTimeout(() => {
      console.error('[Server Critical] Graceful shutdown timed out after 10s. Forcing exit.');
      process.exit(1);
    }, 10000).unref();
  } else {
    process.exit(0);
  }
};

// Listen for termination signals from host environment
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Trap unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server Critical] Unhandled Rejection at:', promise, 'reason:', reason);
  // In production, unhandled rejections put the process in an undefined state; restart container
  if (env.isProduction) {
    gracefulShutdown('unhandledRejection');
  }
});

// Trap synchronous uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('[Server Critical] Uncaught Exception thrown:', error);
  // Uncaught exceptions leave the application in an unstable state; always exit
  process.exit(1);
});

// Launch server
startServer();
