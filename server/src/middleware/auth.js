/**
 * @file auth.js
 * @description JWT authentication and route guard middleware.
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Mitigation of XSS Token Exfiltration (httpOnly Cookies vs localStorage):
 *    - In localStorage, any Cross-Site Scripting (XSS) vulnerability or malicious script can execute
 *      `window.localStorage.getItem('token')` and instantly exfiltrate the user's session token to an attacker.
 *    - With `httpOnly` cookies, the browser's JavaScript engine is strictly prohibited from accessing `document.cookie`.
 *      Even if an attacker executes arbitrary client-side JS, they CANNOT steal the JWT token.
 * 2. Defense-in-Depth Cookie Attributes:
 *    - `httpOnly: true`: Blocks client-side JS access.
 *    - `secure: true`: Transmits cookie exclusively over encrypted HTTPS connections (enabled in production).
 *    - `sameSite: 'lax'` (or `'none'` with secure in cross-site prod): Mitigates Cross-Site Request Forgery (CSRF).
 * 3. Graceful Fallback for API Tools:
 *    - Checks `req.cookies.token` first (browser standard).
 *    - Falls back to `req.headers.authorization` (`Bearer <token>`) so automated cURL scripts, Postman,
 *      and mobile clients can authenticate without custom cookie handling.
 */

import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import User from '../models/User.js';
import { AppError } from './errorHandler.js';

/**
 * Authentication middleware to verify user identity before accessing protected endpoints.
 */
export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1. Extract token from httpOnly cookie (primary security mechanism)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Fallback to Authorization Header for headless tools / testing (Bearer <token>)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Authentication required. Please log in to access this resource.', 401));
    }

    // 3. Verify token signature and expiration
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // 4. Check if the user still exists in the database
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // 5. Attach authenticated user object to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid authentication token.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Authentication token has expired. Please log in again.', 401));
    }
    next(error);
  }
};

export default authenticate;
