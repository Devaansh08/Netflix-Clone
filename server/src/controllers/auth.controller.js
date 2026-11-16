/**
 * @file auth.controller.js
 * @description Controllers for user registration, authentication, session termination, and profile retrieval.
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Token Dispatch via httpOnly Cookies:
 *    Setting cookies server-side using `res.cookie()` with `httpOnly: true` guarantees tokens are never
 *    accessible to untrusted client-side scripts.
 * 2. Cross-Site Production Handling:
 *    In production setups where the frontend (Vercel) and backend (Render) reside on different domains,
 *    `sameSite: 'none'` together with `secure: true` allows cross-origin credential sharing. In local development,
 *    `sameSite: 'lax'` provides robust CSRF protection over HTTP.
 * 3. Sanitized User Payloads:
 *    Passwords and internal hashes are never returned in JSON payloads. The controller formats user objects
 *    explicitly before responding.
 */

import User from '../models/User.js';
import env from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Helper to compute cookie security attributes based on the current deployment environment.
 */
export const getCookieOptions = () => ({
  httpOnly: true, // Prevents client-side JS from reading the cookie (anti-XSS)
  secure: env.isProduction, // Required for HTTPS in production
  sameSite: env.isProduction ? 'none' : 'lax', // 'none' enables cross-origin cookies between Vercel and Render
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  path: '/'
});

/**
 * Formats a clean user response object without leaking sensitive fields.
 */
const formatUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  myList: user.myList || [],
  createdAt: user.createdAt
});

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user account, hash password, and set authentication cookie
 * @access  Public
 */
export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // 1. Basic validation
    if (!name || !email || !password) {
      return next(new AppError('Please provide name, email, and password', 400));
    }

    if (password.length < 6) {
      return next(new AppError('Password must be at least 6 characters long', 400));
    }

    // 2. Check for existing user with identical email
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return next(new AppError('An account with this email address already exists', 409));
    }

    // 3. Create user (password is automatically hashed via Mongoose pre-save hook)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    // 4. Generate JWT
    const token = user.generateAuthToken();

    // 5. Send cookie & response
    res.cookie('token', token, getCookieOptions());

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token, // Also returned in body for non-browser clients (cURL/Postman)
      user: formatUserResponse(user)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user credentials, return user profile, and set auth cookie
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate presence of credentials
    if (!email || !password) {
      return next(new AppError('Please provide both email and password', 400));
    }

    // 2. Find user and explicitly select password field (which is select: false by default)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    // 3. Verify password via bcrypt hash comparison
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return next(new AppError('Invalid email or password', 401));
    }

    // 4. Generate JWT
    const token = user.generateAuthToken();

    // 5. Send cookie & response
    res.cookie('token', token, getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token, // Also returned in body for non-browser clients (cURL/Postman)
      user: formatUserResponse(user)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/demo
 * @desc    Instant 1-Click Guest & Recruiter Demo Login. Automatically provisions demo user.
 * @access  Public
 */
export const demoLogin = async (req, res, next) => {
  try {
    const demoEmail = 'demo@streamverse.com';
    let user = await User.findOne({ email: demoEmail }).select('+password');

    if (!user) {
      user = await User.create({
        name: 'StreamVerse Guest Demo',
        email: demoEmail,
        password: 'DemoPassword2026!'
      });
    }

    const token = user.generateAuthToken();
    res.cookie('token', token, getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Logged in as Demo User successfully',
      token,
      user: formatUserResponse(user)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Clear authentication cookie and invalidate client session
 * @access  Public
 */
export const logout = async (req, res, next) => {
  try {
    // Clear the cookie by setting an expired date and matching options
    res.clearCookie('token', {
      ...getCookieOptions(),
      maxAge: 0
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated user's profile and watchlist
 * @access  Private (Authenticated users only)
 */
export const getMe = async (req, res, next) => {
  try {
    // req.user was populated by authenticate middleware
    res.status(200).json({
      success: true,
      user: formatUserResponse(req.user)
    });
  } catch (error) {
    next(error);
  }
};
