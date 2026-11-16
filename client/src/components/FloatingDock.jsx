/**
 * @file FloatingDock.jsx
 * @description Apple VisionOS / Spatial TV vertical floating dock capsule matching Image 1.
 * Provides instant one-click switching between Home, Browse, TV Series, Wishlist, and Settings.
 */

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home as HomeIcon, 
  LayoutGrid, 
  Tv, 
  Radio,
  Bookmark,
  Settings
} from 'lucide-react';

export const FloatingDock = ({ onBrowseClick, onSeriesClick, onSettingsClick }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/' && !location.search;
  const isMyList = location.pathname === '/my-list';
  const isTvSeries = location.search.includes('category=tv');

  return (
    <aside className="hidden lg:flex fixed left-4 top-1/2 -translate-y-1/2 z-50 flex-col items-center select-none">
      <div className="spatial-dock rounded-full py-4 px-2 flex flex-col items-center gap-5 shadow-2xl">
        
        {/* Top Active Stream Pulse Dot */}
        <button
          onClick={() => navigate('/?category=tv')}
          title="Live Series & Stream"
          className="group relative flex h-9 w-9 items-center justify-center rounded-full bg-red-600/20 text-[#E50914] hover:bg-[#E50914] hover:text-white transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-md"
        >
          <Radio className="h-4 w-4 animate-pulse" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-neutral-900" />
        </button>

        {/* Home */}
        <Link
          to="/"
          title="Home Cinema Feed"
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 ${
            isHome ? 'bg-[#E50914] text-white shadow-lg shadow-red-950 font-bold' : 'text-neutral-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <HomeIcon className="h-4 w-4" />
        </Link>

        {/* Browse / Categories */}
        <button
          onClick={onBrowseClick}
          title="Browse All Categories"
          className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-all hover:scale-110 active:scale-95 cursor-pointer"
        >
          <LayoutGrid className="h-4 w-4" />
        </button>

        {/* TV Series */}
        <button
          onClick={onSeriesClick}
          title="TV Shows & Series"
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 cursor-pointer ${
            isTvSeries ? 'bg-[#E50914] text-white shadow-lg' : 'text-neutral-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Tv className="h-4 w-4" />
        </button>

        {/* Wishlist / My List */}
        <Link
          to="/my-list"
          title="My Wishlist"
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 ${
            isMyList ? 'bg-[#E50914] text-white shadow-lg' : 'text-neutral-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Bookmark className="h-4 w-4" />
        </Link>

        {/* Settings Gear Icon (In place of Search) */}
        <button
          onClick={onSettingsClick}
          title="Console Settings"
          className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-all hover:scale-110 hover:rotate-45 active:scale-95 cursor-pointer"
        >
          <Settings className="h-4 w-4" />
        </button>

      </div>
    </aside>
  );
};

export default FloatingDock;
