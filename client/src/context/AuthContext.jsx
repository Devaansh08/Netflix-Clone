/**
 * @file AuthContext.jsx
 * @description React Context and custom hook for user authentication state and session lifecycle.
 * 
 * DATA FLOW:
 * [AuthContext Provider Mount]
 *      │
 *      ▼
 * [Check Session: GET /api/auth/me]
 *      │ (Checks httpOnly cookie on backend)
 *      ▼
 * [User Hydrated or Set to null] ──► [Consumed by ProtectedRoute & Navbar]
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Session Hydration without LocalStorage:
 *    Because the JWT resides in an httpOnly cookie, the client cannot read the token on page load.
 *    Instead, the app dispatches an initial `GET /api/auth/me` request upon mount. If the cookie is valid,
 *    the user profile is hydrated immediately; if expired or absent, `user` resolves to `null`.
 * 2. Avoiding Unauthenticated Flash:
 *    Maintaining an `isLoading: true` flag during hydration prevents the app from momentarily flashing
 *    the `/login` page when an authenticated user reloads a protected route.
 * 3. Unified Global Interface:
 *    Components access `{ user, login, signup, logout, isLoading }` through `useAuth()`, decoupling UI from
 *    HTTP request details.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Hydrates the authenticated user profile from backend on application mount.
   */
  const checkAuth = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success && response.data.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch {
      // Cookie is either missing, expired, or invalid
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Authenticate with email and password.
   */
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success && response.data.user) {
      setUser(response.data.user);
    }
    return response.data;
  };

  /**
   * Register a new user account.
   */
  const signup = async (name, email, password) => {
    const response = await api.post('/auth/signup', { name, email, password });
    if (response.data.success && response.data.user) {
      setUser(response.data.user);
    }
    return response.data;
  };

  /**
   * 1-Click Guest & Recruiter Instant Demo Login.
   */
  const loginAsDemo = async () => {
    const response = await api.post('/auth/demo');
    if (response.data.success && response.data.user) {
      setUser(response.data.user);
    }
    return response.data;
  };

  /**
   * End current session and clear auth cookie.
   */
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err.message);
    } finally {
      setUser(null);
    }
  };

  /**
   * Optimistically update the user's myList in local context.
   */
  const updateLocalMyList = (newMyList) => {
    setUser((prev) => prev ? { ...prev, myList: newMyList } : null);
  };

  const value = {
    user,
    isLoading,
    login,
    signup,
    loginAsDemo,
    logout,
    checkAuth,
    updateLocalMyList,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to consume authentication context.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
