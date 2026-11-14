/**
 * @file App.jsx
 * @description Root application shell configuring routing, code-splitting, QueryClient, and AuthProvider.
 * 
 * DATA FLOW & COMPONENT TREE:
 * [QueryClientProvider (TanStack Query)]
 *      │
 *      ▼
 * [AuthProvider (Global Auth State)]
 *      │
 *      ▼
 * [BrowserRouter]
 *      │
 *      ├── Public Routes: /login, /signup
 *      │
 *      └── Protected Routes (<ProtectedRoute />):
 *              ├── /           (Home Feed)
 *              ├── /search     (Catalog Search)
 *              ├── /my-list    (User Watchlist)
 *              └── /watch/:id  (HLS Adaptive Player)
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION (PHASE 8 PERFORMANCE PASS):
 * 1. Route-Level Code Splitting (`React.lazy` + `Suspense`):
 *    Rather than bundling the heavy Hls.js video player and all pages into one massive initial bundle,
 *    `React.lazy()` splits each route into an independent JS chunk. First-time visitors only download
 *    the lightweight login chunk, reducing Time to Interactive (TTI) and First Contentful Paint (FCP).
 * 2. Optimized QueryClient Config:
 *    - `staleTime: 5 minutes`: Prevents redundant network refetches when switching browser tabs.
 *    - `refetchOnWindowFocus: false`: Eliminates disruptive re-renders during active user browsing.
 *    - `retry: 1`: Recovers gracefully from transient network drops without infinite retry loops.
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Route-level code splitting (Lazy Loading)
const Home = lazy(() => import('./pages/Home.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Signup = lazy(() => import('./pages/Signup.jsx'));
const Search = lazy(() => import('./pages/Search.jsx'));
const MyList = lazy(() => import('./pages/MyList.jsx'));
const Watch = lazy(() => import('./pages/Watch.jsx'));

// Configure TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes fresh window
      gcTime: 15 * 60 * 1000, // 15 minutes garbage collection cache retention
      refetchOnWindowFocus: false, // Prevents sudden UI shifts on window focus
      retry: 1 // Single retry on transient network failures
    }
  }
});

// Fallback spinner while lazy route chunk is being downloaded
const PageFallback = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-[#141414]">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#E50914] border-t-transparent" />
  </div>
);

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              {/* Public Catalog & Authentication Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Viewing & User Feature Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/my-list" element={<MyList />} />
                <Route path="/watch/:id" element={<Watch />} />
              </Route>

              {/* Catch-all Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
