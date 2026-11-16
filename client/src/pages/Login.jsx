/**
 * @file Login.jsx
 * @description Cinema authentication login page featuring transparent frosted glass UI,
 * segmented Sign In / Create Account tabs, 1-click recruiter demo access, and movie collage backdrop.
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Apple TV / iOS 18 Frosted Glass Auth Card:
 *    `bg-black/70 backdrop-blur-2xl border border-white/15` provides seamless visual continuity
 *    over the catalog wallpaper.
 * 2. Instant Recruiter & Guest Demo Access:
 *    A 1-click button instantly authenticates recruiters with a provisioned demo account
 *    without requiring manual form entry or dummy credential memorization.
 * 3. Segmented Tab Switching:
 *    Users can toggle in place between "Sign In" and "Create Account" without jarring page jumps.
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Film, 
  AlertCircle, 
  Play, 
  ArrowLeft, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Zap, 
  CheckSquare, 
  Square,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import NetflixLogo from '../components/NetflixLogo.jsx';

// Verified high-definition posters from our real catalog
const WALLPAPER_POSTERS = [
  'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg', // Breaking Bad
  'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', // Stranger Things
  'https://image.tmdb.org/t/p/w500/uu4TgyyW259aOZHN0Ew4TEfjnUG.jpg', // Squid Game
  'https://image.tmdb.org/t/p/w500/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg', // Arcane
  'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', // Interstellar
  'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg', // Inception
  'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', // Spirited Away
  'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', // Dune 2
  'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', // Dark Knight
  'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', // Parasite
  'https://image.tmdb.org/t/p/w500/vfJFJPepRKapMd5G2ro7klIRysq.jpg', // Your Name
  'https://image.tmdb.org/t/p/w500/2zmTngn1tYC1AvfnrFLhxeD82hz.jpg'  // The Boys
];

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoSubmitting, setIsDemoSubmitting] = useState(false);

  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const destination = location.state?.from?.pathname || '/';
  const promptMessage = location.state?.message || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both your email address and password.');
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

  const handleInstantDemoLogin = async () => {
    setErrorMessage('');
    try {
      setIsDemoSubmitting(true);
      await loginAsDemo();
      navigate(destination, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to initialize instant demo login. Please try again.');
    } finally {
      setIsDemoSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden flex flex-col justify-between select-none">
      {/* Dynamic Website Movie Collage Background */}
      <div className="absolute inset-0 z-0 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 opacity-30 scale-105 pointer-events-none filter blur-[1px]">
        {WALLPAPER_POSTERS.concat(WALLPAPER_POSTERS).slice(0, 18).map((src, idx) => (
          <div key={idx} className="aspect-[2/3] overflow-hidden rounded-lg bg-neutral-900 shadow">
            <img
              src={src}
              alt="Cinema Backdrop"
              className="h-full w-full object-cover"
              loading="eager"
            />
          </div>
        ))}
      </div>

      {/* Dark Vignettes & Radial Ambient Glow Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/75 to-black/60 pointer-events-none" />
      <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-950/20 via-transparent to-black pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="relative z-20 flex items-center justify-between px-6 py-6 md:px-16">
        <Link to="/" className="flex items-center gap-2 group active:scale-95 transition-transform">
          <NetflixLogo className="h-8 sm:h-9 w-auto drop-shadow-[0_2px_14px_rgba(229,9,20,0.8)]" />
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

      {/* Transparent Frosted Glass Auth Card Form */}
      <div className="relative z-20 flex items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-md rounded-3xl bg-black/70 p-7 sm:p-10 shadow-2xl backdrop-blur-2xl border border-white/15 ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-300">
          
          {/* In-Card Segmented Auth Switcher [ Sign In | Create Account ] */}
          <div className="grid grid-cols-2 rounded-2xl bg-neutral-900/90 p-1 border border-white/10 mb-6">
            <button
              type="button"
              className="rounded-xl bg-[#E50914] py-2 text-xs font-bold text-white shadow-md transition-all"
            >
              Sign In
            </button>
            <Link
              to="/signup"
              state={location.state}
              className="rounded-xl py-2 text-center text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
            >
              Create Account
            </Link>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Welcome Back
            </h1>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-neutral-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
              <ShieldCheck className="h-3 w-3 text-green-400" />
              Secure JWT
            </span>
          </div>

          {/* 1-Click Instant Demo Login (For Recruiters & Quick Testers) */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleInstantDemoLogin}
              disabled={isDemoSubmitting || isSubmitting}
              className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 p-px shadow-lg shadow-red-950/60 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-black/40 px-4 py-3 backdrop-blur-xl transition-colors group-hover:bg-transparent">
                {isDemoSubmitting ? (
                  <div className="flex items-center gap-2 text-white text-xs font-bold">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Signing in as Demo User...</span>
                  </div>
                ) : (
                  <>
                    <Zap className="h-4 w-4 text-amber-300 fill-current animate-pulse" />
                    <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                      Instant Guest Demo (1-Click Login)
                    </span>
                    <Sparkles className="h-3.5 w-3.5 text-amber-200" />
                  </>
                )}
              </div>
            </button>
            <p className="mt-1.5 text-center text-[11px] text-neutral-400">
              No registration needed — instant access for portfolio review.
            </p>
          </div>

          {/* Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="w-full border-t border-white/10" />
            <span className="absolute bg-[#141414] px-3 text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
              Or Sign In with Email
            </span>
          </div>

          {/* Friendly prompt if redirected from video play or watchlist */}
          {promptMessage && !errorMessage && (
            <div className="mb-4 flex items-start gap-3 rounded-2xl bg-red-950/50 border border-red-500/40 p-3 text-xs text-red-200">
              <Play className="h-4 w-4 flex-shrink-0 text-red-400 mt-0.5 fill-current" />
              <span>{promptMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 flex items-start gap-3 rounded-2xl bg-amber-950/50 border border-amber-600/50 p-3 text-xs text-amber-200">
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

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
              <label 
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center gap-2 cursor-pointer select-none hover:text-neutral-200"
              >
                {rememberMe ? (
                  <CheckSquare className="h-4 w-4 text-[#E50914]" />
                ) : (
                  <Square className="h-4 w-4 text-neutral-600" />
                )}
                <span>Remember me on this browser</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isDemoSubmitting}
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

          {/* Guest Link */}
          <div className="mt-5 text-center">
            <Link
              to="/"
              className="inline-block text-xs text-neutral-400 hover:text-neutral-200 underline"
            >
              Continue browsing catalog as Guest
            </Link>
          </div>
        </div>
      </div>

      {/* Simple Transparent Footer Notice */}
      <footer className="relative z-20 py-4 text-center text-[11px] text-neutral-500">
        © 2026 Netflix Inc. Full-Stack MERN Architecture Showcase.
      </footer>
    </div>
  );
};

export default Login;
