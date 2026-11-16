/**
 * @file app.js
 * @description Express application setup, security middleware configuration, and routing assembly.
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Separation of Concerns (app.js vs server.js):
 *    Exporting `app` without binding to a network port allows supertest to run fast integration tests
 *    in-memory without competing for open network ports or colliding between test suites.
 * 2. Defense-in-Depth Middleware Pipeline:
 *    - Helmet: Hardens HTTP headers against XSS, clickjacking, and MIME-sniffing.
 *    - CORS: Restricts cross-origin resource sharing strictly to the client URL with credentials allowed.
 *    - Rate Limiting: Shields against volumetric floods and brute-force abuse.
 *    - Cookie Parser: Extracts httpOnly cookies so authentication credentials never reside in browser JS memory.
 *    - Body Limit (10kb): Prevents memory buffer allocation denial-of-service from massive JSON payloads.
 *    - Morgan: Conditionally logs HTTP requests during development without incurring disk/console I/O lag in production.
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import compression from 'compression';

import env from './config/env.js';
import globalLimiter from './middleware/rateLimiter.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import movieRoutes from './routes/movies.routes.js';
import listRoutes from './routes/list.routes.js';
import historyRoutes from './routes/history.routes.js';
import notificationRoutes from './routes/notifications.routes.js';

const app = express();

// ==============================================================================
// 1. SECURITY & INFRASTRUCTURE MIDDLEWARE
// ==============================================================================

/**
 * Helmet: Sets secure HTTP headers (Content Security Policy, X-Content-Type-Options,
 * X-Frame-Options, Strict-Transport-Security, etc.) to mitigate common web vulnerabilities.
 */
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' } // Allows streaming media and CDN assets to load safely
}));

/**
 * CORS (Cross-Origin Resource Sharing):
 * Ensures our frontend (e.g. http://localhost:5173 or 127.0.0.1) can communicate cleanly
 * with the API while enabling `credentials: true` for secure httpOnly session cookies.
 */
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, mobile apps, Supertest)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) || 
      origin.startsWith('http://localhost:') || 
      origin.startsWith('http://127.0.0.1:')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true, // Allows browser to forward httpOnly cookies across ports
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

/**
 * Compression: Gzip/Deflate compression for outgoing responses.
 * Dramatically cuts transfer size by ~60-80% for large catalog JSON payloads.
 */
app.use(compression());

/**
 * Express Rate Limit: Throttles excessive requests per IP address to safeguard server stability.
 */
app.use('/api', globalLimiter);

/**
 * Body Parsers:
 * - express.json(): Parses incoming JSON bodies. Limit of 10kb prevents malicious payload bloating.
 * - express.urlencoded(): Parses URL-encoded form submissions.
 */
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/**
 * Cookie Parser:
 * Populates `req.cookies` with parsed cookies from incoming HTTP requests.
 * Essential for reading JWTs transmitted via httpOnly cookies.
 */
app.use(cookieParser());

/**
 * HTTP Request Logger (Morgan):
 * Runs only in development mode to provide colorful console logs (`dev` format).
 * Disabled in production to maximize performance and avoid leaking user request parameters.
 */
if (env.isDevelopment) {
  app.use(morgan('dev'));
}

// ==============================================================================
// 2. APPLICATION ROUTE MOUNTING
// ==============================================================================

// Application API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/list', listRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/notifications', notificationRoutes);

// Root greeting endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'Netflix Clone API',
    version: '2.0.0',
    documentation: '/api/health'
  });
});

// ==============================================================================
// 3. ERROR HANDLING MIDDLEWARE PIPELINE
// ==============================================================================

// 404 Catch-All Handler: Intercepts all unmatched routes
app.use(notFoundHandler);

// Centralized Error-Handling Middleware
app.use(errorHandler);

export default app;
