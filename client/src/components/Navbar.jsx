/**
 * @file Navbar.jsx
 * @description Apple iOS / tvOS inspired navigation system featuring frosted glass header and mobile bottom tab bar.
 * 
 * DESIGN SPECIFICATIONS:
 * 1. Apple Frosted Glass Header:
 *    `backdrop-blur-2xl bg-black/60 border-b border-white/10` delivers authentic iOS liquid glass aesthetics.
 * 2. Mobile Bottom Tab Bar:
 *    On mobile devices, an iOS dock tab bar provides thumb-friendly access to Home, Search, My List, and Profile.
 * 3. Haptic Feel Micro-Interactions:
 *    `active:scale-95 transition-transform` mirrors native iOS button compression feedback.
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, LogOut, Film, Home as HomeIcon, Bookmark, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setShowProfileMenu(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Top Navigation Bar (Apple / iOS Glass Header) */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 md:px-14 py-3 sm:py-4 transition-all duration-300 ${
          isScrolled
            ? 'bg-black/75 backdrop-blur-2xl border-b border-white/10 shadow-lg shadow-black/40'
            : 'bg-gradient-to-b from-black/90 via-black/40 to-transparent'
        }`}
      >
        {/* Brand Logo & Desktop Links */}
        <div className="flex items-center gap-6 sm:gap-10">
          <Link to="/" className="flex items-center gap-2 group active:scale-95 transition-transform">
            <Film className="h-6 w-6 sm:h-7 sm:w-7 text-[#E50914] transition-transform group-hover:scale-110" />
            <span className="text-xl sm:text-2xl font-black tracking-tighter text-[#E50914] drop-shadow-md">
              STREAMVERSE
            </span>
          </Link>

          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-neutral-300">
            <Link
              to="/"
              className={`transition-colors hover:text-white ${
                location.pathname === '/' ? 'text-white font-bold' : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/my-list"
              className={`transition-colors hover:text-white ${
                location.pathname === '/my-list' ? 'text-white font-bold' : ''
              }`}
            >
              My List
            </Link>
          </div>
        </div>

        {/* Right Section: Search & Auth Buttons / Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Search Icon */}
          <Link
            to="/search"
            aria-label="Search movies"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-neutral-200 transition-all hover:bg-white/15 hover:text-white active:scale-90"
          >
            <Search className="h-4 w-4" />
          </Link>

          {user ? (
            /* User Profile Avatar with iOS Dropdown Sheet */
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu((prev) => !prev)}
                aria-label="User profile menu"
                className="flex items-center gap-2 rounded-full ring-2 ring-white/20 p-0.5 transition-transform hover:scale-105 active:scale-90 cursor-pointer"
              >
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#E50914] text-xs font-bold text-white uppercase shadow-inner">
                  {user.name ? user.name.charAt(0) : 'U'}
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-neutral-900/95 backdrop-blur-2xl py-2 shadow-2xl ring-1 ring-white/10 border border-neutral-800 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="border-b border-neutral-800 px-4 py-2.5">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Apple ID / Session</p>
                    <p className="truncate text-sm font-bold text-white mt-0.5">{user.name}</p>
                    <p className="truncate text-neutral-400">{user.email}</p>
                  </div>

                  <Link
                    to="/my-list"
                    className="sm:hidden flex w-full items-center gap-2 px-4 py-2.5 text-neutral-300 hover:bg-white/10 hover:text-white"
                  >
                    <Bookmark className="h-4 w-4" />
                    My Watchlist
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-neutral-300 transition-colors hover:bg-white/10 hover:text-[#E50914] cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out of StreamVerse
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* iOS Pill Buttons for Guests */
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-neutral-200 transition-all hover:bg-white/10 active:scale-95"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-[#E50914] px-4 py-1.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-red-900/30 transition-all hover:bg-red-700 active:scale-95"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* iOS Mobile Bottom Tab Bar (docked on mobile devices) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/85 backdrop-blur-2xl border-t border-white/10 px-6 py-2 pb-5 flex items-center justify-around shadow-2xl">
        <Link
          to="/"
          className={`flex flex-col items-center gap-1 active:scale-90 transition-transform ${
            location.pathname === '/' ? 'text-[#E50914] font-bold' : 'text-neutral-400'
          }`}
        >
          <HomeIcon className="h-5 w-5" />
          <span className="text-[10px]">Home</span>
        </Link>

        <Link
          to="/search"
          className={`flex flex-col items-center gap-1 active:scale-90 transition-transform ${
            location.pathname === '/search' ? 'text-[#E50914] font-bold' : 'text-neutral-400'
          }`}
        >
          <Search className="h-5 w-5" />
          <span className="text-[10px]">Search</span>
        </Link>

        <Link
          to="/my-list"
          className={`flex flex-col items-center gap-1 active:scale-90 transition-transform ${
            location.pathname === '/my-list' ? 'text-[#E50914] font-bold' : 'text-neutral-400'
          }`}
        >
          <Bookmark className="h-5 w-5" />
          <span className="text-[10px]">My List</span>
        </Link>

        <Link
          to={user ? "/my-list" : "/login"}
          className={`flex flex-col items-center gap-1 active:scale-90 transition-transform ${
            location.pathname === '/login' || location.pathname === '/signup' ? 'text-[#E50914] font-bold' : 'text-neutral-400'
          }`}
        >
          <UserIcon className="h-5 w-5" />
          <span className="text-[10px]">{user ? 'Account' : 'Sign In'}</span>
        </Link>
      </div>
    </>
  );
};

export default Navbar;
