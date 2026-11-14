/**
 * @file axios.js
 * @description Centralized Axios HTTP client instance with base URL and cookie credential forwarding.
 * 
 * DATA FLOW:
 * [React Component / Page]
 *      │
 *      ▼
 * [Custom Hook / React Query `useQuery`]
 *      │
 *      ▼
 * [Axios Client Instance (api/axios.js)]
 *      │  (withCredentials: true sends httpOnly JWT cookie)
 *      ▼
 * [Express Backend (/api/...)]
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Single Axios Instance: Guarantees uniform timeouts, base URL resolution, and centralized interceptors.
 * 2. `withCredentials: true`: Mandatory for cross-origin or cross-port requests when using httpOnly cookies.
 *    Without this flag, the browser silently strips cookies from outbound XMLHttpRequest/Fetch requests.
 * 3. Environment Independence: Reads `VITE_API_URL` so moving from localhost:5000 to production Vercel/Render
 *    requires zero code changes—only an environment variable adjustment.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Enables browser to include httpOnly session cookies automatically
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10-second timeout avoids hanging UI states
});

// Response interceptor for global response unwrapping or logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standardize error message extraction for UI consumption
    const customMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(customMessage));
  }
);

export default api;
