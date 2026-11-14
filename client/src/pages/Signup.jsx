/**
 * @file Signup.jsx
 * @description User registration screen with instant session initialization.
 * 
 * DATA FLOW:
 * [User enters name, email, password]
 *      │
 *      ▼
 * [Submit Form] ──► Calls `signup(name, email, password)` via `useAuth()`
 *      │
 *      ├──► Success ──► Automatic cookie set & redirects to `/`
 *      └──► Failure ──► Displays validation or duplicate email error
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name || !email || !password) {
      setErrorMessage('Please fill in all registration fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    try {
      setIsSubmitting(true);
      await signup(name, email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try another email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black md:bg-cover md:bg-center" style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.85)), url('https://assets.nflxext.com/ffe/siteui/vlv3/d80f8398-e4b2-4d24-814b-285642c22883/f1d7d0a6-5fa4-49c5-84dc-5c5cbcfb9409/US-en-20240729-POP_SIGNUP_TWO_WEEKS-perspective_WEB_df0e7b8f-3ee0-449e-88ec-d68a9f6261f9_large.jpg')" }}>
      {/* Brand Header */}
      <header className="px-6 py-6 md:px-16">
        <Link to="/" className="flex items-center gap-2">
          <Film className="h-8 w-8 text-[#E50914]" />
          <span className="text-3xl font-black tracking-tighter text-[#E50914]">STREAMVERSE</span>
        </Link>
      </header>

      {/* Signup Form Container */}
      <div className="flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md rounded-lg bg-black/75 p-8 sm:p-14 shadow-2xl backdrop-blur-md border border-neutral-800">
          <h1 className="mb-7 text-3xl font-bold text-white">Create Account</h1>

          {errorMessage && (
            <div className="mb-6 flex items-start gap-3 rounded bg-amber-900/40 border border-amber-600/50 p-3 text-sm text-amber-200">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded bg-neutral-800/90 px-4 py-3.5 text-white placeholder-neutral-400 outline-none transition-all focus:bg-neutral-800 focus:ring-2 focus:ring-[#E50914]"
              />
            </div>

            <div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded bg-neutral-800/90 px-4 py-3.5 text-white placeholder-neutral-400 outline-none transition-all focus:bg-neutral-800 focus:ring-2 focus:ring-[#E50914]"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Create Password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded bg-neutral-800/90 px-4 py-3.5 text-white placeholder-neutral-400 outline-none transition-all focus:bg-neutral-800 focus:ring-2 focus:ring-[#E50914]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded bg-[#E50914] py-3 text-base font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50 mt-4 cursor-pointer"
            >
              {isSubmitting ? 'Creating Account...' : 'Get Started'}
            </button>
          </form>

          <div className="mt-8 text-sm text-neutral-400">
            Already have an account?{' '}
            <Link to="/login" className="text-white font-semibold hover:underline">
              Sign in
            </Link>
            .
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
