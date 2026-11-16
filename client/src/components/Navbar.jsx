/**
 * @file Navbar.jsx
 * @description Apple iOS / tvOS inspired navigation system featuring frosted glass header,
 * distinct Category & Genre dropdown menus, and responsive mobile bottom dock.
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Strict Differentiation of Categories vs Genres:
 *    Categories define format & curation (Movies, TV Series, Anime, Classics, 18+ Mature),
 *    while Genres define narrative style (Sci-Fi, Action, Crime, Comedy, Drama, Horror).
 * 2. URL-Driven Deep Category Routing:
 *    Selecting any category or genre updates the query string (`/?category=id`), enabling shareable URLs,
 *    browser history back/forward navigation, and seamless state synchronization.
 * 3. Mobile Dock Tab Bar with Category Sheet:
 *    On smartphones, dedicated triggers toggle an iOS action sheet modal for easy one-thumb browsing.
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
  Sparkles,
  Clapperboard,
  Tv,
  Tags
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import NotificationCenter from './NotificationCenter.jsx';
import NetflixLogo from './NetflixLogo.jsx';

const NAV_FORMAT_CATEGORIES = [
  { id: 'all', label: 'All Titles & Formats', icon: '🎬', desc: 'Complete catalog of films, series & anime' },
  { id: 'movies', label: 'Feature Movies', icon: '🎥', desc: 'Hollywood blockbusters and cinema' },
  { id: 'tv', label: 'TV Series & Shows', icon: '📺', desc: 'Binge-worthy drama, crime & fantasy' },
  { id: 'anime', label: 'Anime Universe 🇯🇵', icon: '🏮', desc: 'Japanese animation & studio epics' },
  { id: 'classics', label: 'Cinema Classics Vault 🏛️', icon: '🏛️', desc: 'Restored historic public domain cinema' },
  { id: '18plus', label: '18+ Mature Action 🔞', icon: '🔞', desc: 'Adult-rated psychological thrillers & crime' }
];

const NAV_CATEGORIES = NAV_FORMAT_CATEGORIES;

const NAV_THEMATIC_GENRES = [
  { id: '878', label: 'Sci-Fi & Cyberpunk', icon: '🌌' },
  { id: '28', label: 'Action & Adventure', icon: '💥' },
  { id: '80', label: 'Crime & Mystery', icon: '🕵️' },
  { id: '35', label: 'Comedy & Family', icon: '😂' },
  { id: '18', label: 'Drama & Masterpiece', icon: '🎭' },
  { id: '27', label: 'Horror & Suspense', icon: '👻' },
  { id: 'korean', label: 'Korean Suspense 🇰🇷', icon: '🇰🇷' },
  { id: 'es', label: 'Spanish Cinema 🇪🇸', icon: '🇪🇸' },
  { id: 'toprated', label: 'Top Rated ⭐', icon: '⭐' }
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showGenreMenu, setShowGenreMenu] = useState(false);
  const [showMobileCategorySheet, setShowMobileCategorySheet] = useState(false);

  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const categoryMenuRef = useRef(null);
  const genreMenuRef = useRef(null);

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
    setShowGenreMenu(false);
    setShowMobileCategorySheet(false);
  }, [location.pathname, location.search]);

  // Handle clicking outside of menus
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target)) {
        setShowCategoryMenu(false);
      }
      if (genreMenuRef.current && !genreMenuRef.current.contains(e.target)) {
        setShowGenreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSelectFilter = (filterId) => {
    setShowCategoryMenu(false);
    setShowGenreMenu(false);
    setShowMobileCategorySheet(false);
    if (filterId === 'all') {
      navigate('/');
    } else {
      navigate(`/?category=${filterId}`);
    }
  };

  const activeCategoryParam = new URLSearchParams(location.search).get('category');
  const isCategoryActive = NAV_FORMAT_CATEGORIES.some((c) => c.id === activeCategoryParam);
  const isGenreActive = NAV_THEMATIC_GENRES.some((g) => g.id === activeCategoryParam);

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
            <NetflixLogo className="h-6 sm:h-7 w-auto drop-shadow-[0_2px_12px_rgba(229,9,20,0.6)]" />
          </Link>

          <div className="hidden sm:flex items-center gap-5 md:gap-6 text-sm font-medium text-neutral-300">
            <Link
              to="/"
              className={`transition-colors hover:text-white ${
                location.pathname === '/' && !location.search ? 'text-white font-bold' : ''
              }`}
            >
              Home
            </Link>

            {/* 1. CATEGORIES Dropdown (Format / Medium) */}
            <div ref={categoryMenuRef} className="relative">
              <button
                onClick={() => {
                  setShowCategoryMenu((prev) => !prev);
                  setShowGenreMenu(false);
                }}
                className={`flex items-center gap-1.5 transition-colors hover:text-white cursor-pointer ${
                  isCategoryActive ? 'text-white font-bold' : ''
                }`}
              >
                <Layers className="h-4 w-4 text-[#E50914]" />
                <span>Categories</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${showCategoryMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Floating Dropdown List of Categories */}
              {showCategoryMenu && (
                <div className="absolute left-0 mt-3 w-72 rounded-2xl bg-neutral-900/95 backdrop-blur-2xl p-2 shadow-2xl ring-1 ring-white/10 border border-neutral-800 text-xs animate-in fade-in zoom-in-95 duration-150 z-50">
                  <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
                    <span className="font-bold text-neutral-300 uppercase tracking-wider text-[10px]">
                      Media Formats & Universes
                    </span>
                    <Sparkles className="h-3 w-3 text-red-500" />
                  </div>

                  <div className="py-1 max-h-80 overflow-y-auto no-scrollbar space-y-0.5">
                    {NAV_FORMAT_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleSelectFilter(cat.id)}
                        className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2 text-left transition-colors cursor-pointer ${
                          activeCategoryParam === cat.id ? 'bg-white/15 text-white font-bold' : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="text-base mt-0.5">{cat.icon}</span>
                        <div className="min-w-0">
                          <p className="font-medium text-xs truncate">{cat.label}</p>
                          <p className="text-[10px] text-neutral-400 truncate">{cat.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. GENRES Dropdown (Thematic Narrative) */}
            <div ref={genreMenuRef} className="relative">
              <button
                onClick={() => {
                  setShowGenreMenu((prev) => !prev);
                  setShowCategoryMenu(false);
                }}
                className={`flex items-center gap-1.5 transition-colors hover:text-white cursor-pointer ${
                  isGenreActive ? 'text-white font-bold' : ''
                }`}
              >
                <Tags className="h-4 w-4 text-[#E50914]" />
                <span>Genres</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${showGenreMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Floating Dropdown List of Genres */}
              {showGenreMenu && (
                <div className="absolute left-0 mt-3 w-64 rounded-2xl bg-neutral-900/95 backdrop-blur-2xl p-2 shadow-2xl ring-1 ring-white/10 border border-neutral-800 text-xs animate-in fade-in zoom-in-95 duration-150 z-50">
                  <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
                    <span className="font-bold text-neutral-300 uppercase tracking-wider text-[10px]">
                      Thematic Genres
                    </span>
                    <Sparkles className="h-3 w-3 text-red-500" />
                  </div>

                  <div className="py-1 max-h-80 overflow-y-auto no-scrollbar space-y-0.5">
                    {NAV_THEMATIC_GENRES.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => handleSelectFilter(g.id)}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-colors cursor-pointer ${
                          activeCategoryParam === g.id ? 'bg-white/15 text-white font-bold' : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="text-base">{g.icon}</span>
                        <span className="font-medium text-xs truncate">{g.label}</span>
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

        {/* Right Section: Search, Notifications & Auth Buttons / Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Search Icon */}
          <Link
            to="/search"
            aria-label="Search catalog"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-neutral-200 transition-all hover:bg-white/15 hover:text-white active:scale-90"
          >
            <Search className="h-4 w-4" />
          </Link>

          {/* Notification Center */}
          <NotificationCenter />

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
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="font-bold text-white truncate">{user.name || 'Member'}</p>
                    <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
                  </div>

                  <Link
                    to="/my-list"
                    className="flex items-center gap-2 px-4 py-2.5 text-neutral-200 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Bookmark className="h-4 w-4" />
                    <span>My Watchlist</span>
                  </Link>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      window.dispatchEvent(new Event('replay_netflix_intro'));
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-neutral-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  >
                    <Play className="h-4 w-4 text-[#E50914]" />
                    <span>Replay Netflix Intro</span>
                  </button>

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
          <span className="text-[10px]">Browse</span>
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

      {/* Mobile Category & Genre Bottom Action Sheet Modal */}
      {showMobileCategorySheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full rounded-t-3xl bg-neutral-900 border-t border-white/10 p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-red-500" />
                <h3 className="font-bold text-white text-base">Browse Netflix</h3>
              </div>
              <button
                onClick={() => setShowMobileCategorySheet(false)}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Section 1: Categories (Format) */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Categories & Formats
              </p>
              <div className="grid grid-cols-2 gap-2">
                {NAV_FORMAT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectFilter(cat.id)}
                    className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/5 p-2.5 text-left text-neutral-200 active:bg-white/20 transition-all text-xs font-semibold"
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Section 2: Genres (Thematic) */}
            <div className="space-y-2 pt-2 border-t border-white/10 pb-6">
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Thematic Genres
              </p>
              <div className="grid grid-cols-2 gap-2">
                {NAV_THEMATIC_GENRES.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => handleSelectFilter(g.id)}
                    className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/5 p-2.5 text-left text-neutral-200 active:bg-white/20 transition-all text-xs font-semibold"
                  >
                    <span className="text-base">{g.icon}</span>
                    <span className="truncate">{g.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
