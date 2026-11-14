/**
 * @file Navbar.jsx
 * @description Apple iOS / tvOS inspired navigation system featuring frosted glass header,
 * category & genre dropdown list, and mobile bottom tab bar.
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Category & Genre Navigation in Header:
 *    Provides instant access to curated collections (Anime, Classics, 18+ Action, Sci-Fi, Top Rated)
 *    directly from the main navigation bar via an accessible, glassmorphic dropdown list.
 * 2. URL-Driven Deep Category Routing:
 *    Selecting any category updates the query string (`/?category=genreId`), enabling shareable URLs,
 *    browser history back/forward navigation, and seamless state synchronization.
 * 3. Mobile Dock Tab Bar with Category Sheet:
 *    On smartphones, a dedicated Categories tab toggles an iOS action sheet modal for easy one-thumb browsing.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  LogOut, 
  Film, 
  Home as HomeIcon, 
  Bookmark, 
  User as UserIcon, 
  ChevronDown, 
  Layers, 
  X,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const NAV_CATEGORIES = [
  { id: 'all', label: 'All Titles & Series', icon: '🎬' },
  { id: 'anime', label: 'Anime Universe 🇯🇵', icon: '🏮' },
  { id: 'classics', label: 'Cinema Classics Vault 🏛️', icon: '🏛️' },
  { id: '18plus', label: '18+ Mature Action 🔞', icon: '🔞' },
  { id: '878', label: 'Sci-Fi & Cyberpunk 🌌', icon: '🌌' },
  { id: '28', label: 'Action & Adventure 💥', icon: '💥' },
  { id: 'korean', label: 'Korean Suspense 🇰🇷', icon: '🇰🇷' },
  { id: 'toprated', label: 'Top Rated Masterpieces ⭐', icon: '⭐' },
  { id: '35', label: 'Comedy & Family 😂', icon: '😂' },
  { id: 'es', label: 'Spanish Cinema 🇪🇸', icon: '🇪🇸' }
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showMobileCategorySheet, setShowMobileCategorySheet] = useState(false);

  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const categoryMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on outside click or route change
  useEffect(() => {
    setShowProfileMenu(false);
    setShowCategoryMenu(false);
    setShowMobileCategorySheet(false);
  }, [location.pathname, location.search]);

  // Handle clicking outside of category menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target)) {
        setShowCategoryMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSelectCategory = (categoryId) => {
    setShowCategoryMenu(false);
    setShowMobileCategorySheet(false);
    if (categoryId === 'all') {
      navigate('/');
    } else {
      navigate(`/?category=${categoryId}`);
    }
  };

  return (
    <>
      {/* Top Navigation Bar (Apple / iOS Glass Header) */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 md:px-14 py-3 sm:py-4 transition-all duration-300 ${
          isScrolled
            ? 'bg-black/80 backdrop-blur-2xl border-b border-white/10 shadow-lg shadow-black/40'
            : 'bg-gradient-to-b from-black/90 via-black/40 to-transparent'
        }`}
      >
        {/* Brand Logo & Desktop Links */}
        <div className="flex items-center gap-6 sm:gap-8">
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
                location.pathname === '/' && !location.search ? 'text-white font-bold' : ''
              }`}
            >
              Home
            </Link>

            {/* Categories & Genres Dropdown List Menu */}
            <div ref={categoryMenuRef} className="relative">
              <button
                onClick={() => setShowCategoryMenu((prev) => !prev)}
                className={`flex items-center gap-1.5 transition-colors hover:text-white cursor-pointer ${
                  location.search.includes('category=') ? 'text-white font-bold' : ''
                }`}
              >
                <Layers className="h-4 w-4 text-[#E50914]" />
                <span>Categories & Genres</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${showCategoryMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Floating Dropdown List of Categories */}
              {showCategoryMenu && (
                <div className="absolute left-0 mt-3 w-72 rounded-2xl bg-neutral-900/95 backdrop-blur-2xl p-2 shadow-2xl ring-1 ring-white/10 border border-neutral-800 text-xs animate-in fade-in zoom-in-95 duration-150 z-50">
                  <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
                    <span className="font-bold text-neutral-300 uppercase tracking-wider text-[10px]">
                      Browse by Category
                    </span>
                    <Sparkles className="h-3 w-3 text-red-500" />
                  </div>

                  <div className="py-1 max-h-80 overflow-y-auto no-scrollbar space-y-0.5">
                    {NAV_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleSelectCategory(cat.id)}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-neutral-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                      >
                        <span className="text-base">{cat.icon}</span>
                        <span className="font-medium text-xs truncate">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
                <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-neutral-900/95 backdrop-blur-2xl py-2 shadow-2xl ring-1 ring-white/10 border border-neutral-800 text-xs animate-in fade-in zoom-in-95 duration-150 z-50">
                  <div className="border-b border-neutral-800 px-4 py-2.5">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">StreamVerse ID</p>
                    <p className="truncate text-sm font-bold text-white mt-0.5">{user.name}</p>
                    <p className="truncate text-neutral-400 text-[11px]">{user.email}</p>
                  </div>

                  <Link
                    to="/my-list"
                    className="sm:hidden flex w-full items-center gap-2 px-4 py-2.5 text-neutral-300 hover:bg-white/10 hover:text-white"
                  >
                    <Bookmark className="h-4 w-4" />
                    <span>My List</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
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
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/85 backdrop-blur-2xl border-t border-white/10 px-4 py-2 pb-5 flex items-center justify-around shadow-2xl">
        <Link
          to="/"
          className={`flex flex-col items-center gap-1 active:scale-90 transition-transform ${
            location.pathname === '/' && !location.search ? 'text-[#E50914] font-bold' : 'text-neutral-400'
          }`}
        >
          <HomeIcon className="h-5 w-5" />
          <span className="text-[10px]">Home</span>
        </Link>

        {/* Mobile Categories Trigger */}
        <button
          onClick={() => setShowMobileCategorySheet(true)}
          className={`flex flex-col items-center gap-1 active:scale-90 transition-transform cursor-pointer ${
            location.search.includes('category=') ? 'text-[#E50914] font-bold' : 'text-neutral-400'
          }`}
        >
          <Layers className="h-5 w-5" />
          <span className="text-[10px]">Genres</span>
        </button>

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

      {/* Mobile Category Bottom Action Sheet Modal */}
      {showMobileCategorySheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full rounded-t-3xl bg-neutral-900 border-t border-white/10 p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-red-500" />
                <h3 className="font-bold text-white text-base">Select Category / Genre</h3>
              </div>
              <button
                onClick={() => setShowMobileCategorySheet(false)}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 pb-6">
              {NAV_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/5 p-3 text-left text-neutral-200 active:bg-white/20 transition-all text-xs font-semibold"
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
