/**
 * @file env.js
 * @description Centralized environment configuration and validation module.
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Single Source of Truth: Scattering `process.env.VAR_NAME` across hundreds of files
 *    makes it difficult to audit configuration, causes silent `undefined` bugs at runtime,
 *    and complicates unit testing.
 * 2. Fail-Fast Principle: By validating critical variables (e.g. MONGO_URI, JWT_SECRET) at boot time,
 *    the service fails immediately upon startup if misconfigured, rather than crashing during
 *    an active user request hours later in production.
 * 3. Immutability: Freezing the exported configuration object prevents accidental or malicious
 *    runtime mutations by third-party packages.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ES modules environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env file from the server root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];

// In production, enforce that all essential secrets are configured
if (process.env.NODE_ENV === 'production') {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`[CRITICAL] Missing required environment variable: ${envVar}`);
      process.exit(1);
    }
  }
}

export const env = Object.freeze({
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/streamverse',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_jwt_secret_streamverse_production_grade_app_key_32chars',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  TMDB_API_KEY: process.env.TMDB_API_KEY || ''
});

export default env;
