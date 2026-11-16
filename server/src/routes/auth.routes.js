/**
 * @file auth.routes.js
 * @description Authentication routing endpoints for user signup, login, logout, and session check.
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Clean Controller-Route Segregation: Routes define the endpoint contract, HTTP verbs, and middleware chaining,
 *    delegating business logic entirely to controllers. This allows unit testing controllers in isolation.
 * 2. Route Protection Boundary: `/me` is guarded by the `authenticate` middleware, ensuring unauthenticated
 *    requests are terminated at the routing tier before reaching the controller.
 */

import { Router } from 'express';
import { signup, login, demoLogin, logout, getMe } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user account
 * @access  Public
 */
router.post('/signup', signup);

/**
 * @route   POST /api/auth/login
 * @desc    Log in with email and password
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/demo
 * @desc    Instant 1-Click Guest & Recruiter Demo Login
 * @access  Public
 */
router.post('/demo', demoLogin);

/**
 * @route   POST /api/auth/logout
 * @desc    Log out and clear session cookie
 * @access  Public
 */
router.post('/logout', logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged in user profile
 * @access  Private
 */
router.get('/me', authenticate, getMe);

export default router;
