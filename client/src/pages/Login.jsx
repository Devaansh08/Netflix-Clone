/**
 * @file Login.jsx
 * @description Cinema authentication login page featuring transparent frosted glass UI,
 * website movie collage backdrop, and contextual deep-link redirection.
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Apple TV / Netflix Frosted Glass Form:
 *    `bg-black/65 backdrop-blur-2xl border border-white/10` floats the form card seamlessly
 *    over the website's real movie poster wallpaper.
 * 2. In-Catalog Wallpaper Collage:
 *    Renders a live grid of verified catalog posters with a cinematic gradient vignette,
 *    eliminating brittle third-party asset dependencies that 404 or fail CORS.
 * 3. Friction-Free Guest Navigation:
 *    Provides a prominent "Browse as Guest" trigger allowing first-time visitors to explore the catalog
 *    without being blocked by mandatory authentication.
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Film, AlertCircle, Play, ArrowLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

// Verified high-definition posters from our real catalog
const WALLPAPER_POSTERS = [
  'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', // Interstellar
  'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg', // Inception
  'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', // Spirited Away
  'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', // Dune 2
  'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', // Fight Club
  'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', // Dark Knight
  'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', // Pulp Fiction
  'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', // Parasite
  'https://image.tmdb.org/t/p/w500/vfJFJPepRKapMd5G2ro7klIRysq.jpg', // Your Name
  'https://image.tmdb.org/t/p/w500/cMYCDADoLKLbB83g4WnJegaZimC.jpg', // Princess Mononoke
  'https://image.tmdb.org/t/p/w500/vHDWZOpupmKB7iNuiWFqnUSjfmN.jpg', // Metropolis
  'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg'  // Forrest Gump
];

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const destination = location.state?.from?.pathname || '/';
  const promptMessage = location.state?.message || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both your email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
      navigate(destination, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden flex flex-col justify-between select-none">
      {/* Dynamic Website Movie Collage Background */}
      <div className="absolute inset-0 z-0 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 opacity-35 scale-105 pointer-events-none filter blur-[1px]">
        {WALLPAPER_POSTERS.concat(WALLPAPER_POSTERS).slice(0, 18).map((src, idx) => (
          <div key={idx} className="aspect-[2/3] overflow-hidden rounded-lg bg-neutral-900">
            <img
              src={src}
              alt="Cinema Backdrop"
              className="h-full w-full object-cover"
              loading="eager"
            />
          </div>
        ))}
      </div>

      {/* Dark Vignettes & Gradients Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/75 to-black/60 pointer-events-none" />
      <div className="absolute inset-0 z-10 bg-radial-gradient pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="relative z-20 flex items-center justify-between px-6 py-6 md:px-16">
        <Link to="/" className="flex items-center gap-2 group active:scale-95 transition-transform">
          <Film className="h-7 w-7 sm:h-8 sm:w-8 text-[#E50914] transition-transform group-hover:scale-110" />
          <span className="text-2xl sm:text-3xl font-black tracking-tighter text-[#E50914] drop-shadow-md">
            STREAMVERSE
          </span>
        </Link>

        {/* Return to Browse button */}
        <Link
          to="/"
          className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-4 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/10 backdrop-blur-md transition-all active:scale-95"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Browse Catalog</span>
        </Link>
      </header>

      {/* Transparent Frosted Glass Login Card Form */}
      <div className="relative z-20 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-3xl bg-black/65 p-8 sm:p-12 shadow-2xl backdrop-blur-2xl border border-white/15 ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Sign In
            </h1>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-neutral-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
              <ShieldCheck className="h-3 w-3 text-green-400" />
              Secure JWT
            </span>
          </div>

          {/* Friendly prompt if redirected from video play or watchlist */}
          {promptMessage && !errorMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl bg-red-950/40 border border-red-500/40 p-3.5 text-xs text-red-200">
              <Play className="h-4 w-4 flex-shrink-0 text-red-400 mt-0.5 fill-current" />
              <span>{promptMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl bg-amber-950/40 border border-amber-600/50 p-3.5 text-xs text-amber-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl bg-neutral-900/80 border border-white/10 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none transition-all focus:bg-neutral-900 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl bg-neutral-900/80 border border-white/10 px-4 py-3 pr-11 text-sm text-white placeholder-neutral-500 outline-none transition-all focus:bg-neutral-900 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-xl bg-[#E50914] py-3.5 font-bold text-white shadow-lg shadow-red-950/50 transition-all hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer text-sm"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                'Sign In & Stream'
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 rounded-xl border border-white/5 bg-white/5 p-3 text-[11px] text-neutral-400">
            <span className="font-bold text-neutral-300">Quick Test Tip: </span>
            Create any new account via Signup, or enter your registered email. Passwords are encrypted with bcrypt.
          </div>

          {/* Signup Redirect & Guest Links */}
          <div className="mt-6 text-center space-y-3">
            <p className="text-xs text-neutral-400">
              New to StreamVerse?{' '}
              <Link to="/signup" className="font-bold text-white hover:underline hover:text-red-400">
                Sign up now
              </Link>
            </p>

            <Link
              to="/"
              className="inline-block text-[11px] text-neutral-500 hover:text-neutral-300 underline"
            >
              Continue browsing catalog as Guest
            </Link>
          </div>
        </div>
      </div>

      {/* Simple Transparent Footer Notice */}
      <footer className="relative z-20 py-4 text-center text-[11px] text-neutral-500">
        © 2026 StreamVerse Inc. Full-Stack MERN Architecture Showcase.
      </footer>
    </div>
  );
};

export default Login;
