/**
 * @file db.js
 * @description MongoDB connection manager utilizing Mongoose.
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Connection Pooling: Mongoose manages an internal pool of sockets (default maxPoolSize: 100).
 *    Opening and closing a connection per request would destroy throughput due to TCP/TLS handshake latency.
 * 2. Event-Driven Reliability: Listening to `error`, `disconnected`, and `reconnected` events ensures
 *    transient network blips are logged and handled without silently leaving the app in a zombie state.
 * 3. Graceful Teardown: Closing the database connection on process termination signals (SIGINT, SIGTERM)
 *    ensures in-flight queries complete and MongoDB does not hold abandoned client sockets.
 */

import mongoose from 'mongoose';
import env from './env.js';

/**
 * Connect to MongoDB database instance.
 * @returns {Promise<typeof mongoose>} The Mongoose instance upon successful connection.
 */
export const connectDB = async () => {
  try {
    // Configure Mongoose options for optimal production performance
    const options = {
      autoIndex: !env.isProduction, // In production, disabling autoIndex avoids index builds degrading startup speed
      serverSelectionTimeoutMS: 5000, // Fail fast (5s) instead of hanging indefinitely if DB is unreachable
      maxPoolSize: 50, // Limits maximum concurrent connections to prevent exhausting DB memory
    };

    const connection = await mongoose.connect(env.MONGO_URI, options);

    // Sanitize host display to avoid leaking database cluster credentials in application logs
    const host = connection.connection.host;
    const dbName = connection.connection.name;
    console.log(`[Database] MongoDB connected successfully -> Host: ${host} | Database: ${dbName}`);

    // Register runtime event listeners for connection monitoring
    mongoose.connection.on('error', (err) => {
      console.error(`[Database Error] Runtime MongoDB connection error:`, err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn(`[Database Warning] MongoDB connection lost. Attempting reconnection...`);
    });

    mongoose.connection.on('reconnected', () => {
      console.log(`[Database] MongoDB connection re-established.`);
    });

    return connection;
  } catch (error) {
    console.error(`[Database Critical] Failed to connect to MongoDB: ${error.message}`);
    // In production or CI, if the database cannot be reached, the server cannot fulfill stateful requests.
    // However, in local dev, allow developer to see clear error while server may still run health checks.
    if (env.isProduction) {
      process.exit(1);
    }
  }
};

/**
 * Gracefully close the MongoDB connection.
 * Used during graceful shutdown and integration testing teardown.
 */
export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('[Database] MongoDB connection closed gracefully.');
  } catch (error) {
    console.error('[Database Error] Error during MongoDB disconnect:', error.message);
  }
};

export default connectDB;
