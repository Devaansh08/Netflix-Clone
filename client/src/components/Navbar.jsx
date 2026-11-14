/**
 * @file Navbar.jsx
 * @description Responsive Netflix-style top navigation bar with dynamic scroll background and user menu.
 * 
 * DATA FLOW:
 * [User scrolls window] ──► Updates `isScrolled` boolean (transparent to solid dark background)
 * [User clicks Search]  ──► Navigates to `/search`
 * [User clicks Logout]  ──► Calls `logout()` in `AuthContext` ──► Clears cookie & redirects to `/login`
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Passive Scroll Listener:
 *    Attaching `{ passive: true }` to the window scroll listener guarantees the main thread does not block
 *    scrolling performance or trigger jank on mobile displays.
 * 2. Visual Polish:
 *    Smooth CSS background transitions (`transition-colors duration-400`) mirror the iconic Netflix header behavior.
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User as UserIcon, LogOut, Film } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
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
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 md:px-14 py-3 sm:py-4 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#141414]/95 shadow-md shadow-black/50 backdrop-blur-sm'
          : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent'
      }`}
    >
      {/* Left Section: Brand Logo & Links */}
      <div className="flex items-center gap-6 sm:gap-10">
        <Link to="/" className="flex items-center gap-2 group">
          <Film className="h-6 w-6 sm:h-7 sm:w-7 text-[#E50914] transition-transform group-hover:scale-110" />
          <span className="text-xl sm:text-2xl font-black tracking-tighter text-[#E50914]">
            STREAMVERSE
          </span>
        </Link>

        {user && (
          <div className="hidden sm:flex items-center gap-5 text-sm font-medium text-neutral-300">
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
        )}
      </div>

      {/* Right Section: Search & Profile or Login/Signup buttons */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search Icon (Available to all visitors) */}
        <Link
          to="/search"
          aria-label="Search movies"
          className="text-neutral-200 transition-colors hover:text-white p-1"
        >
          <Search className="h-5 w-5" />
        </Link>

        {user ? (
          /* Profile Dropdown Container for Authenticated Users */
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu((prev) => !prev)}
              aria-label="User profile menu"
              className="flex items-center gap-2 rounded bg-neutral-800 p-1.5 transition-colors hover:bg-neutral-700 cursor-pointer"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded bg-[#E50914] text-xs font-bold text-white uppercase">
                {user.name ? user.name.charAt(0) : 'U'}
              </div>
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-md bg-[#181818] py-2 shadow-xl ring-1 ring-black/50 border border-neutral-800">
                <div className="border-b border-neutral-800 px-4 py-2">
                  <p className="text-xs text-neutral-400">Signed in as</p>
                  <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                  <p className="truncate text-xs text-neutral-400">{user.email}</p>
                </div>

                <Link
                  to="/my-list"
                  className="sm:hidden flex w-full items-center gap-2 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white"
                >
                  My List
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-[#E50914] cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out of StreamVerse
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Login and Signup Action Buttons for Public Visitors */
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="rounded px-3 py-1.5 text-xs sm:text-sm font-semibold text-neutral-200 transition-colors hover:text-white hover:bg-white/10"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="rounded bg-[#E50914] px-3.5 py-1.5 text-xs sm:text-sm font-bold text-white shadow-md transition-colors hover:bg-red-700"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
