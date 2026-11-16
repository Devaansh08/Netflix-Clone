/**
 * @file ProtectedRoute.jsx
 * @description Route guard component ensuring only authenticated users access private views.
 * 
 * DATA FLOW:
 * [Browser URL Change (e.g. /my-list)]
 *      │
 *      ▼
 * [ProtectedRoute Component]
 *      │
 *      ├──► If `isLoading: true` ──► Render Netflix Fullscreen Spinner (No redirect flash)
 *      ├──► If `!user` ───────────► Redirect to `/login` (with current location in state)
 *      └──► If `user` exists ─────► Render protected `<Outlet />`
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Deep-Linking Preservation (`state={{ from: location }}`):
 *    Passing the attempted location state into the Navigate component allows the login page
 *    to redirect users back to the exact video (`/watch/157336`) they initially clicked after signing in.
 * 2. Clean Routing Separation:
 *    Using react-router-dom's `<Outlet />` allows grouping all protected paths inside a single parent
 *    `<Route element={<ProtectedRoute />}>` block in `App.jsx`, preventing duplicated auth guards.
 */

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Render centered Netflix loading animation during session hydration
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#141414]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#E50914] border-t-transparent"></div>
          <span className="text-sm font-semibold tracking-wider text-neutral-400">NETFLIX</span>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login while preserving attempted route
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
