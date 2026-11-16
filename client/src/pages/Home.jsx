/**
 * @file Home.jsx
 * @description Apple VisionOS / Spatial TV Glassmorphic UI matching Image 1,
 * combined with the 3D Perspective Coverflow Carousel from Image 2.
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Spatial Glass Console Architecture:
 *    Floating frosted glass window (`spatial-glass`) with vertical pill dock navigation,
 *    integrated sidebar with "New Trailers 🔥", and top search & profile bar.
 * 2. 3D Perspective Coverflow Hero Carousel:
 *    Full 3D card deck coverflow with hardware-accelerated CSS perspective,
 *    bold colorful display typography, and bottom-right mini thumbnail switchers.
 * 3. Widescreen Media Rows (Popcorn Mania & Continue Watching):
 *    Wide landscape cards with live hover video streams, red continue-watching scrubber lines,
 *    and authentic streaming metadata.
 * 4. Strict Separation of Categories vs. Genres:
 *    Distinct format selectors (Movies, TV Series, Anime, Classics, 18+) and thematic genre chips.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Film, 
  Globe, 
  Sparkles, 
  ShieldAlert, 
  Check, 
  X, 
  Flame, 
  Star, 
  Calendar, 
  Layers, 
  Tv, 
  Clapperboard,
  Tags,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Mic,
  MoreVertical,
  Play,
  Bookmark,
  LogOut,
  User as UserIcon,
  Radio
} from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import CoverflowHero from '../components/CoverflowHero.jsx';
import WideMediaCard from '../components/WideMediaCard.jsx';
import MovieCard from '../components/MovieCard.jsx';
import NewTrailersSidebar from '../components/NewTrailersSidebar.jsx';
import CardSliderRow from '../components/CardSliderRow.jsx';
import FloatingDock from '../components/FloatingDock.jsx';
import DetailsModal from '../components/DetailsModal.jsx';
import SettingsModal from '../components/SettingsModal.jsx';
import NotificationCenter from '../components/NotificationCenter.jsx';
import NetflixLogo from '../components/NetflixLogo.jsx';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  useTrendingMovies,
  useTopRatedMovies,
  usePopularMovies,
  useGenreMovies,
  useLanguageMovies,
  useMature18PlusMovies,
  useTvSeries,
  useContinueWatching,
  useMyList,
  useFreeDbExpanded
} from '../api/movieQueries.js';

// Format Categories (Media Types)
const FORMAT_CATEGORIES = [
  { id: 'all', label: 'All Titles', icon: '🎬', desc: 'Browse the entire Netflix entertainment universe.' },
  { id: 'movies', label: 'Movies 🎥', icon: '🎥', desc: 'Hollywood blockbusters and acclaimed feature films.' },
  { id: 'tv', label: 'TV Series 📺', icon: '📺', desc: 'Multi-season serial drama, crime sagas and comedies.' },
  { id: 'anime', label: 'Anime 🏮', icon: '🏮', desc: 'Studio Ghibli, Makoto Shinkai and Japanese animation.' },
  { id: 'classics', label: 'Classics 🏛️', icon: '🏛️', desc: 'Restored public domain historic cinema milestones.' },
  { id: '18plus', label: '18+ Mature 🔞', icon: '🔞', desc: 'Adult-rated psychological thrillers and crime.' }
];

// Thematic Genres
const THEMATIC_GENRES = [
  { id: 'all', label: 'All Genres', icon: '🌟' },
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

const AUDIO_LANG_FILTERS = [
  { code: 'all', label: 'All Audio' },
  { code: 'en', label: 'English 🇺🇸' },
  { code: 'ja', label: 'Japanese 🇯🇵' },
  { code: 'ko', label: 'Korean 🇰🇷' },
  { code: 'es', label: 'Spanish 🇪🇸' },
  { code: 'hi', label: 'Hindi 🇮🇳' },
  { code: 'de', label: 'German 🇩🇪' }
];

export const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get('category');
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const { data: myList = [] } = useMyList();

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeGenre, setActiveGenre] = useState('all');
  const [activeLanguage, setActiveLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [hasUnreadNotification, setHasUnreadNotification] = useState(true);

  // 18+ Content Policy & Parental Gate
  const [is18PlusAllowed, setIs18PlusAllowed] = useState(true);
  const [showAgeVerificationModal, setShowAgeVerificationModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Synchronize category state from URL query
  useEffect(() => {
    if (urlCategory) {
      const isFormat = FORMAT_CATEGORIES.some((c) => c.id === urlCategory);
      if (isFormat) {
        setActiveCategory(urlCategory);
        setActiveGenre('all');
      } else {
        setActiveCategory('all');
        setActiveGenre(urlCategory);
      }
      setActiveLanguage('all');
    } else {
      setActiveCategory('all');
      setActiveGenre('all');
    }
  }, [urlCategory]);

  // Queries
  const { data: trendingData, isLoading: isTrendingLoading } = useTrendingMovies();
  const { data: topRatedData, isLoading: isTopRatedLoading } = useTopRatedMovies();
  const { data: popularData, isLoading: isPopularLoading } = usePopularMovies();
  const { data: seriesData, isLoading: isSeriesLoading } = useTvSeries();
  const { data: actionData, isLoading: isActionLoading } = useGenreMovies(28);
  const { data: scifiData, isLoading: isScifiLoading } = useGenreMovies(878);
  const { data: comedyData, isLoading: isComedyLoading } = useGenreMovies(35);
  const { data: crimeData, isLoading: isCrimeLoading } = useGenreMovies(80);
  const { data: classicsData, isLoading: isClassicsLoading } = useGenreMovies('classics');
  const { data: animeData, isLoading: isAnimeLoading } = useLanguageMovies('ja');
  const { data: koreanData, isLoading: isKoreanLoading } = useLanguageMovies('ko');
  const { data: spanishData, isLoading: isSpanishLoading } = useLanguageMovies('es');
  const { data: matureData, isLoading: isMatureLoading } = useMature18PlusMovies();
  const { data: continueWatching = [] } = useContinueWatching();
  const { data: freeDbItems = [] } = useFreeDbExpanded();

  // Multi-Slide Cinema Widescreen Hero Items (Peaky Blinders, Breaking Bad, Stranger Things, Arcane, Dune, Interstellar, Cyberpunk, The Witcher)
  const heroCoverflowSlides = useMemo(() => {
    const list = [];
    const pool = [...(seriesData?.results || []), ...(trendingData?.results || []), ...(popularData?.results || [])];
    
    // Priority order of premier showcase titles
    const targetIds = [60574, 1396, 66732, 94605, 157336, 693134, 105248, 71912, 333339, 872585];
    targetIds.forEach((id) => {
      const match = pool.find((item) => item.id === id);
      if (match && !list.some((existing) => existing.id === match.id)) {
        list.push(match);
      }
    });

    return list.length > 0 ? list : (trendingData?.results || []).slice(0, 8);
  }, [seriesData, trendingData, popularData]);

  // "Popcorn Mania" Row Items (Exact Image 1 Order: Brooklyn Nine-Nine, Ready Player One, Money Heist, Ash vs. Evil Dead)
  const popcornManiaItems = useMemo(() => {
    const allPool = [...(seriesData?.results || []), ...(popularData?.results || [])];
    const targetIds = [48891, 333339, 71446, 62843];
    const ordered = [];
    targetIds.forEach((id) => {
      const found = allPool.find((m) => m.id === id);
      if (found && !ordered.some((x) => x.id === found.id)) ordered.push(found);
    });
    allPool.forEach((m) => {
      if (!ordered.some((x) => x.id === m.id)) ordered.push(m);
    });
    return ordered.slice(0, 8);
  }, [seriesData, popularData]);

  // "Continue Watching" Row Items (Exact Image 1 Order: Red Notice, Extraction, The Adam Project, The Old Guard)
  const continueWatchingItems = useMemo(() => {
    if (continueWatching && continueWatching.length > 0) return continueWatching;
    const allPool = [...(popularData?.results || []), ...(trendingData?.results || [])];
    const targetSpecs = [
      { id: 512195, progress: 42, remaining: '1h 12m left' }, // Red Notice
      { id: 545609, progress: 75, remaining: '28m left' },   // Extraction
      { id: 696806, progress: 28, remaining: '1h 22m left' }, // The Adam Project
      { id: 547016, progress: 85, remaining: '18m left' }    // The Old Guard
    ];
    const list = [];
    targetSpecs.forEach((target) => {
      const found = allPool.find((m) => m.id === target.id);
      if (found) {
        list.push({
          ...found,
          progressPercent: target.progress,
          remainingTime: target.remaining
        });
      }
    });
    allPool.slice(0, 6).forEach((item, idx) => {
      if (!list.some((x) => x.id === item.id)) {
        list.push({
          ...item,
          progressPercent: [78, 45, 62, 28][idx % 4],
          remainingTime: ['35m left', '45m left', '1h 10m left', '15m left'][idx % 4]
        });
      }
    });
    return list;
  }, [continueWatching, popularData, trendingData]);

  // "New Trailers 🔥" Sidebar Items (Exact Image 1 Order: Shadow and Bone, The Night Agent, The Witcher)
  const newTrailersItems = useMemo(() => {
    const allPool = [...(seriesData?.results || []), ...(popularData?.results || [])];
    const targetIds = [85720, 125988, 71912];
    const list = [];
    targetIds.forEach((id) => {
      const found = allPool.find((m) => m.id === id);
      if (found) list.push(found);
    });
    if (list.length === 0) {
      return allPool.slice(0, 3);
    }
    return list;
  }, [seriesData, popularData]);

  // Handle Category selection
  const handleCategoryClick = (catId) => {
    if (catId === '18plus' && !is18PlusAllowed) {
      setShowAgeVerificationModal(true);
      return;
    }
    setActiveCategory(catId);
    setActiveGenre('all');
    setActiveLanguage('all');
    if (catId !== 'all') {
      setSearchParams({ category: catId });
    } else {
      setSearchParams({});
    }
  };

  const handleGenreClick = (genreId) => {
    setActiveGenre(genreId);
    setActiveCategory('all');
    setActiveLanguage('all');
    if (genreId !== 'all') {
      setSearchParams({ category: genreId });
    } else {
      setSearchParams({});
    }
  };

  const confirm18PlusAge = () => {
    setIs18PlusAllowed(true);
    setShowAgeVerificationModal(false);
    setActiveCategory('18plus');
    setActiveGenre('all');
    setSearchParams({ category: '18plus' });
  };

  // Filtered view logic
  const filteredCatalogItems = useMemo(() => {
    let items = [];

    if (activeCategory === 'tv') items = seriesData?.results || [];
    else if (activeCategory === 'movies') items = (popularData?.results || []).filter((m) => m.mediaType !== 'tv');
    else if (activeCategory === 'anime') items = animeData?.results || [];
    else if (activeCategory === 'classics') items = classicsData?.results || [];
    else if (activeCategory === '18plus') items = matureData?.results || [];
    else if (activeGenre === '878') items = scifiData?.results || [];
    else if (activeGenre === '28') items = actionData?.results || [];
    else if (activeGenre === '80') items = crimeData?.results || [];
    else if (activeGenre === '35') items = comedyData?.results || [];
    else if (activeGenre === '18') items = (popularData?.results || []).filter((m) => m.genres?.includes('Drama'));
    else if (activeGenre === '27') items = (popularData?.results || []).filter((m) => m.genres?.includes('Horror') || [10331, 653].includes(m.id));
    else if (activeGenre === 'korean') items = koreanData?.results || [];
    else if (activeGenre === 'es') items = spanishData?.results || [];
    else if (activeGenre === 'toprated') items = topRatedData?.results || [];

    if (!is18PlusAllowed) {
      items = items.filter((m) => !m.is18Plus);
    }

    if (sortBy === 'rating') {
      return [...items].sort((a, b) => b.rating - a.rating);
    }
    if (sortBy === 'year') {
      return [...items].sort((a, b) => new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0));
    }
    return items;
  }, [
    activeCategory, activeGenre, seriesData, popularData, animeData, 
    classicsData, matureData, scifiData, actionData, crimeData, comedyData, 
    koreanData, spanishData, topRatedData, is18PlusAllowed, sortBy
  ]);

  const isFilterActive = activeCategory !== 'all' || activeGenre !== 'all';
  const currentActiveObj = 
    FORMAT_CATEGORIES.find((c) => c.id === activeCategory && c.id !== 'all') ||
    THEMATIC_GENRES.find((g) => g.id === activeGenre && g.id !== 'all') ||
    { label: 'Spotlight Feed', icon: '🎬', desc: 'Browse the highest rated cinema and serial drama.' };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchKeyword.trim())}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <div className="min-h-screen bg-[#ECECEF] text-white font-sans selection:bg-[#E50914] selection:text-white pb-20 relative overflow-x-hidden">
      
      {/* Modern Architectural Off-White Studio Lighting (Matching Image 1) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft warm off-white ambient radial lighting */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F6F6F8] via-[#ECECEF] to-[#E1E1E6]" />
        {/* Ambient soft glow directly behind the floating console */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[1300px] h-[700px] bg-white/70 rounded-full blur-[130px]" />
        {/* Soft floor shadow grounding the spatial floating console */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-[1450px] h-20 bg-black/25 rounded-full blur-3xl" />
      </div>

      {/* Floating Vertical Pill Dock (Extreme Left Edge, Matching Image 1) */}
      <FloatingDock 
        onBrowseClick={() => handleCategoryClick('all')} 
        onSeriesClick={() => handleCategoryClick('tv')} 
        onSettingsClick={() => setShowSettingsModal(true)}
      />

      {/* Mobile Top Navbar (Rendered only on mobile) */}
      <div className="lg:hidden">
        <Navbar />
      </div>

      {/* =========================================================================
          MAIN SPATIAL GLASS CONSOLE (The Apple VisionOS / Netflix TV Window from Image 1)
          ========================================================================= */}
      <div className="relative z-10 max-w-[1540px] mx-auto px-2 sm:px-4 md:px-8 lg:pl-20 pt-4 sm:pt-8 md:pt-10">
        
        <div className="spatial-glass rounded-[28px] sm:rounded-[36px] overflow-hidden flex flex-col lg:flex-row shadow-[0_30px_90px_rgba(0,0,0,0.9)]">
          
          {/* ---------------------------------------------------------------------
              LEFT SIDEBAR (Inside Glass Window, Matching Image 1)
              --------------------------------------------------------------------- */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0 hidden lg:flex flex-col justify-between p-6 xl:p-7 border-b lg:border-b-0 lg:border-r border-white/10 bg-black/40 backdrop-blur-2xl">
            
            <div className="space-y-7">
              {/* Brand Logo (Iconic Arched Netflix Red Wordmark) */}
              <Link to="/" className="flex items-center gap-2 group active:scale-95 transition-transform">
                <NetflixLogo className="h-8 sm:h-9 w-auto drop-shadow-[0_2px_14px_rgba(229,9,20,0.8)]" />
              </Link>

              {/* Sidebar Menu Links (Matching Image 1: Browse, Wishlist, Coming Soon) */}
              <nav className="space-y-1.5 text-xs font-bold text-neutral-300">
                <button
                  onClick={() => {
                    setActiveCategory('all');
                    setActiveGenre('all');
                    setSearchParams({});
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 transition-all cursor-pointer ${
                    !isFilterActive ? 'bg-white/10 text-white font-extrabold shadow-md' : 'hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${!isFilterActive ? 'bg-[#E50914] shadow-sm shadow-red-500 animate-pulse' : 'bg-neutral-600'}`} />
                  <span>Browse</span>
                </button>

                <Link
                  to="/my-list"
                  className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 transition-all hover:bg-white/5 hover:text-white"
                >
                  <div className="flex items-center gap-3">
                    <Bookmark className="h-4 w-4 text-neutral-400" />
                    <span>Wishlist</span>
                  </div>
                  {myList.length > 0 && (
                    <span className="rounded-full bg-[#E50914] px-2 py-0.2 text-[10px] font-black text-white">
                      {myList.length}
                    </span>
                  )}
                </Link>

                <button
                  onClick={() => handleCategoryClick('tv')}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 transition-all cursor-pointer ${
                    activeCategory === 'tv' ? 'bg-white/10 text-white font-extrabold shadow-md' : 'hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Tv className="h-4 w-4 text-neutral-400" />
                  <span>TV Series</span>
                </button>

                <button
                  onClick={() => handleCategoryClick('movies')}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 transition-all cursor-pointer ${
                    activeCategory === 'movies' ? 'bg-white/10 text-white font-extrabold shadow-md' : 'hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Clapperboard className="h-4 w-4 text-neutral-400" />
                  <span>Feature Movies</span>
                </button>
              </nav>

              {/* "New Trailers 🔥" Vertical Stack (Matching Image 1 Screenshot!) */}
              <div className="pt-2 border-t border-white/10">
                <NewTrailersSidebar 
                  trailers={newTrailersItems} 
                  onSelect={setSelectedMovie} 
                />
              </div>
            </div>

            {/* Bottom 18+ Safe Mode & Audio Language Toggle */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="flex items-center gap-1 font-semibold text-[11px]">
                  <ShieldAlert className={`h-3.5 w-3.5 ${is18PlusAllowed ? 'text-red-500' : 'text-green-500'}`} />
                  Parental Gate
                </span>
                <button
                  onClick={() => {
                    if (!is18PlusAllowed) setShowAgeVerificationModal(true);
                    else setIs18PlusAllowed(false);
                  }}
                  className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase transition-all cursor-pointer ${
                    is18PlusAllowed
                      ? 'bg-red-950/70 text-red-200 border border-red-700/60'
                      : 'bg-green-950/70 text-green-200 border border-green-700/60'
                  }`}
                >
                  {is18PlusAllowed ? '18+ On' : 'Safe'}
                </button>
              </div>
            </div>

          </aside>

          {/* ---------------------------------------------------------------------
              MAIN INTERACTIVE AREA (Header, 3D Carousel, Popcorn Mania, Continue Watching)
              --------------------------------------------------------------------- */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 space-y-6">
            
            {/* Top Navigation & Profile Bar (Matching Image 1) */}
            <div className="flex items-center justify-between gap-3 sm:gap-6 pb-2">
              
              {/* Left Navigation History Arrows `< >` */}
              <div className="hidden sm:flex items-center gap-1.5 text-neutral-400">
                <button 
                  onClick={() => window.history.back()}
                  aria-label="Back"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => window.history.forward()}
                  aria-label="Forward"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Center Frosted Glass Capsule Search Bar (Matching Image 1) */}
              <form 
                onSubmit={handleSearchSubmit} 
                className="flex-1 max-w-lg relative flex items-center"
              >
                <Search className="absolute left-3.5 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search titles, actors, genres..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full rounded-full bg-neutral-900/80 py-2 sm:py-2.5 pl-10 pr-9 text-xs sm:text-sm text-white placeholder-neutral-500 border border-white/10 outline-none backdrop-blur-xl focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all"
                />
                <button
                  type="button"
                  onClick={() => navigate('/search')}
                  title="Voice / Filter Search"
                  className="absolute right-3 text-neutral-400 hover:text-white"
                >
                  <Mic className="h-3.5 w-3.5" />
                </button>
              </form>

              {/* Right Side: Notification Bell & User Profile (Matching Image 1) */}
              <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                
                {/* Notification Center */}
                <NotificationCenter onSelectMovie={setSelectedMovie} />

                {/* User Profile Card (Matching Image 1: Avatar, Samantha G., @Samantha) */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu((prev) => !prev)}
                    className="flex items-center gap-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 py-1 pl-1 pr-3 transition-all cursor-pointer"
                  >
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gradient-to-tr from-red-600 to-rose-400 text-xs font-black uppercase text-white shadow-md">
                      {user ? (user.name ? user.name.charAt(0) : 'U') : 'S'}
                    </div>
                    <div className="text-left hidden md:block">
                      <p className="text-xs font-black text-white leading-tight">
                        {user ? user.name : 'Samantha G.'}
                      </p>
                      <p className="text-[10px] font-medium text-neutral-400 leading-tight">
                        {user ? user.email.split('@')[0] : '@Samantha'}
                      </p>
                    </div>
                  </button>

                  {/* Profile Dropdown Menu */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-neutral-900/95 backdrop-blur-2xl py-2 shadow-2xl ring-1 ring-white/10 border border-neutral-800 text-xs animate-in fade-in zoom-in-95 duration-150 z-50">
                      <div className="px-4 py-2 border-b border-white/10">
                        <p className="font-bold text-white truncate">{user ? user.name : 'Samantha G.'}</p>
                        <p className="text-[10px] text-neutral-400 truncate">{user ? user.email : 'samantha@netflix.com'}</p>
                      </div>

                      <Link
                        to="/my-list"
                        className="flex items-center gap-2 px-4 py-2 text-neutral-200 hover:bg-white/10 hover:text-white"
                      >
                        <Bookmark className="h-4 w-4" />
                        <span>My Wishlist ({myList.length})</span>
                      </Link>

                      {user ? (
                        <button
                          onClick={async () => {
                            await logout();
                            navigate('/login');
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      ) : (
                        <Link
                          to="/login"
                          className="flex w-full items-center gap-2 px-4 py-2 text-[#E50914] font-bold hover:bg-white/10"
                        >
                          <UserIcon className="h-4 w-4" />
                          <span>Sign In / Demo Login</span>
                        </Link>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Category (Format) & Genre Pill Selectors */}
            <div className="flex flex-col gap-2 pt-1 border-t border-white/5">
              
              {/* Row 1: Categories (Format) */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400 whitespace-nowrap hidden sm:flex items-center gap-1 mr-1">
                  <Clapperboard className="h-3 w-3 text-[#E50914]" />
                  Format:
                </span>
                {FORMAT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold transition-all active:scale-95 whitespace-nowrap cursor-pointer ${
                      activeCategory === cat.id && activeGenre === 'all'
                        ? 'bg-white text-black shadow-md shadow-white/20'
                        : cat.id === '18plus'
                        ? 'bg-red-950/60 text-red-300 hover:bg-red-900/60 border border-red-800/50'
                        : 'bg-white/5 text-neutral-300 hover:bg-white/15 hover:text-white border border-white/5'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label.replace(/[\u{1F300}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')}</span>
                  </button>
                ))}
              </div>

              {/* Row 2: Genres (Thematic Narrative) */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400 whitespace-nowrap hidden sm:flex items-center gap-1 mr-1">
                  <Tags className="h-3 w-3 text-red-500" />
                  Genres:
                </span>
                {THEMATIC_GENRES.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => handleGenreClick(g.id)}
                    className={`flex items-center gap-1 rounded-full px-3 py-0.5 text-[11px] font-semibold transition-all active:scale-95 whitespace-nowrap cursor-pointer ${
                      activeGenre === g.id && activeCategory === 'all'
                        ? 'bg-[#E50914] text-white shadow-md shadow-red-900/50 font-bold'
                        : 'bg-white/5 text-neutral-400 hover:bg-white/15 hover:text-white border border-white/5'
                    }`}
                  >
                    <span>{g.icon}</span>
                    <span>{g.label.replace(/[\u{1F300}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')}</span>
                  </button>
                ))}

                {isFilterActive && (
                  <button
                    onClick={() => {
                      setActiveCategory('all');
                      setActiveGenre('all');
                      setSearchParams({});
                    }}
                    className="text-xs text-red-400 hover:text-white underline ml-2 whitespace-nowrap cursor-pointer font-bold"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* -------------------------------------------------------------------
                HERO SECTION: 3D COVERFLOW CAROUSEL (Image 2) OR FILTERED SPOTLIGHT
                ------------------------------------------------------------------- */}
            {!isFilterActive ? (
              /* The Signature 3D Coverflow Carousel (Matching Image 2 with Peaky Blinders from Image 1!) */
              <div className="pt-2">
                <CoverflowHero
                  slides={heroCoverflowSlides}
                  onSelect={setSelectedMovie}
                />
              </div>
            ) : (
              /* Filtered Spotlight Banner */
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-red-950/40 via-neutral-900/80 to-black p-6 sm:p-8 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="rounded-full bg-red-600/30 px-3 py-0.5 text-xs font-black text-red-400 uppercase tracking-wider border border-red-500/30">
                      Active Spotlight Feed
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">
                      {currentActiveObj.label}
                    </h2>
                    <p className="text-xs text-neutral-300 max-w-xl">
                      {currentActiveObj.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="rounded-xl bg-neutral-900 border border-white/15 px-3 py-1.5 text-xs font-bold text-white outline-none cursor-pointer"
                    >
                      <option value="popularity">Most Popular 🔥</option>
                      <option value="rating">Highest Rated ⭐</option>
                      <option value="year">Newest 📅</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------------
                CONTENT ROWS (Popcorn Mania, Continue Watching, TV Series, etc.)
                ------------------------------------------------------------------- */}
            {isFilterActive ? (
              /* Filtered Grid View */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 animate-in fade-in duration-300 pt-2">
                {filteredCatalogItems.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onSelect={setSelectedMovie}
                  />
                ))}
              </div>
            ) : (
              /* Default Multi-Row Dashboard (Matching Image 1) */
              <div className="space-y-8 pt-3">
                
                {/* 1. POPCORN MANIA (Matching Image 1: Brooklyn Nine-Nine, Ready Player One, Money Heist, etc.) */}
                <CardSliderRow
                  title="Popcorn Mania"
                  badge="Trending Hits"
                  subtitle="(Blockbuster hits & crowd favorites)"
                >
                  {popcornManiaItems.map((movie) => (
                    <WideMediaCard
                      key={movie.id}
                      movie={movie}
                      onSelect={setSelectedMovie}
                    />
                  ))}
                </CardSliderRow>

                {/* 2. CONTINUE WATCHING (Matching Image 1: with Red Scrubber Progress Lines!) */}
                <CardSliderRow
                  title="Continue Watching"
                  badge="In Progress"
                  subtitle="(Pick up where you left off)"
                >
                  {continueWatchingItems.map((movie, idx) => (
                    <WideMediaCard
                      key={movie.id || idx}
                      movie={movie}
                      onSelect={setSelectedMovie}
                      progressPercent={movie.progressPercent || [75, 40, 88, 30][idx % 4]}
                      remainingTime={movie.remainingTime || '35m left'}
                    />
                  ))}
                </CardSliderRow>

                {/* 3. BINGE-WORTHY TV SERIES & SHOWS */}
                <CardSliderRow
                  title="Binge-Worthy TV Series & Drama"
                  icon={<Tv className="h-5 w-5 text-[#E50914]" />}
                  badge="Full Seasons"
                >
                  {(seriesData?.results || []).map((series) => (
                    <WideMediaCard
                      key={series.id}
                      movie={series}
                      onSelect={setSelectedMovie}
                    />
                  ))}
                </CardSliderRow>

                {/* 4. TOP 10 MASTERPIECES TODAY */}
                {topRatedData?.results && (
                  <CardSliderRow
                    title="Top 10 Masterpieces on Netflix Today"
                    icon={<Star className="h-5 w-5 text-amber-400 fill-current" />}
                    badge="Top 10"
                  >
                    {topRatedData.results.slice(0, 10).map((movie, idx) => (
                      <MovieCard
                        key={movie.id}
                        movie={movie}
                        rankNumber={idx + 1}
                        onSelect={setSelectedMovie}
                      />
                    ))}
                  </CardSliderRow>
                )}

                {/* 5. ANIME UNIVERSE */}
                <CardSliderRow
                  title="Anime Universe & Japanese Animation"
                  icon={<span className="text-lg">🏮</span>}
                  badge="Japanese Epics"
                >
                  {(animeData?.results || []).map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onSelect={setSelectedMovie}
                    />
                  ))}
                </CardSliderRow>

                {/* 6. GLOBAL STREAMING VAULT & CULT LEGENDS (Free Movie Series DB API) */}
                {freeDbItems && freeDbItems.length > 0 && (
                  <CardSliderRow
                    title="Global Streaming Vault & Cult Legends"
                    icon={<Globe className="h-5 w-5 text-cyan-400" />}
                    badge="Free Movie Series DB"
                  >
                    {freeDbItems.map((movie) => (
                      <WideMediaCard
                        key={movie.id}
                        movie={movie}
                        onSelect={setSelectedMovie}
                      />
                    ))}
                  </CardSliderRow>
                )}

              </div>
            )}

          </main>
        </div>

      </div>

      {/* 18+ Age Verification Modal Gate (Parental Compliance) */}
      {showAgeVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-neutral-900 border border-red-700/60 p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <ShieldAlert className="h-8 w-8 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-white">Age-Restricted Content Policy</h3>
                <span className="text-xs text-red-400 font-semibold">18+ Mature Audiences Only</span>
              </div>
            </div>

            <p className="text-sm text-neutral-300 leading-relaxed">
              Titles in this category contain mature themes, graphic violence, strong language, or adult situations.
            </p>
            <p className="text-xs text-neutral-400">
              By confirming, you acknowledge that you are at least 18 years old and consent to viewing adult-rated entertainment.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setShowAgeVerificationModal(false)}
                className="rounded-full px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel / Keep Safe Mode
              </button>
              <button
                onClick={confirm18PlusAge}
                className="rounded-full bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-red-900/40 hover:bg-red-700 transition-colors cursor-pointer"
              >
                I am 18 or Older — Unlock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedMovie && (
        <DetailsModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}

      {/* Console Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        is18PlusAllowed={is18PlusAllowed}
        onToggle18Plus={() => setIs18PlusAllowed((prev) => !prev)}
      />

      {/* Enterprise Cinema Footer */}
      <div className="mt-16">
        <Footer />
      </div>

    </div>
  );
};

export default Home;
