/**
 * @file Search.jsx
 * @description Advanced catalog search with instant autocomplete chips, media format filters,
 * rating filters, search history, and responsive cinema grid layout.
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. 300ms Debounce Rate-Limiting:
 *    Avoids saturating server connections or TMDB quotas on each keystroke while maintaining real-time responsiveness.
 * 2. Multi-Faceted In-Memory & Backend Filtering:
 *    Allows narrowing search results across media formats (Movies, TV Series, Anime, 18+) and high ratings (8.0+).
 * 3. User Experience & Search Discovery:
 *    Provides instant trending search chips and recent search history saved in browser local storage.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search as SearchIcon, 
  X, 
  Film, 
  Sparkles, 
  Star, 
  History, 
  Flame, 
  Tv, 
  ShieldAlert, 
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import MovieCard from '../components/MovieCard.jsx';
import DetailsModal from '../components/DetailsModal.jsx';
import Footer from '../components/Footer.jsx';
import { useSearchMovies, useTrendingMovies } from '../api/movieQueries.js';

const TRENDING_SUGGESTIONS = [
  { label: 'Breaking Bad', icon: '⚗️' },
  { label: 'Stranger Things', icon: '🚲' },
  { label: 'Inception', icon: '🌀' },
  { label: 'Arcane', icon: '⚡' },
  { label: 'Squid Game', icon: '🦑' },
  { label: 'Interstellar', icon: '🚀' },
  { label: 'Anime', icon: '🏮' },
  { label: 'The Boys', icon: '💥' }
];

const FORMAT_FILTERS = [
  { id: 'all', label: 'All Content', icon: '🌟' },
  { id: 'movie', label: 'Movies', icon: '🎬' },
  { id: 'tv', label: 'TV Series', icon: '📺' },
  { id: 'anime', label: 'Anime', icon: '🏮' },
  { id: '18plus', label: '18+ Mature', icon: '🔞' }
];

export const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [minRating8Only, setMinRating8Only] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);

  const inputRef = useRef(null);

  // Load recent searches on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('streamverse_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      }
    } catch {
      // Safe fallback if localStorage is disabled
    }
  }, []);

  // Save new search query to history
  const saveToHistory = (query) => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 5);
      try {
        localStorage.setItem('streamverse_recent_searches', JSON.stringify(updated));
      } catch {
        // Safe fallback
      }
      return updated;
    });
  };

  const clearHistory = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('streamverse_recent_searches');
    } catch {
      // Safe fallback
    }
  };

  // 350ms Debounce Effect
  useEffect(() => {
    const handler = setTimeout(() => {
      const clean = searchTerm.trim();
      setDebouncedQuery(clean);
      if (clean) saveToHistory(clean);
    }, 350);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: searchData, isLoading, isFetching } = useSearchMovies(debouncedQuery);
  const { data: trendingData } = useTrendingMovies();

  const rawResults = searchData?.results || [];
  const rawRecommended = trendingData?.results || [];

  // Apply Format and Rating Filters
  const filterList = (list) => {
    return list.filter((item) => {
      // Format Filter
      if (selectedFormat === 'movie' && item.mediaType === 'tv') return false;
      if (selectedFormat === 'tv' && item.mediaType !== 'tv') return false;
      if (selectedFormat === 'anime' && !(item.genres?.includes('Animation') || item.originalLanguage === 'ja')) return false;
      if (selectedFormat === '18plus' && !item.is18Plus) return false;

      // Rating Filter (8.0+)
      if (minRating8Only && item.rating < 8.0) return false;

      return true;
    });
  };

  const displayedResults = useMemo(() => filterList(rawResults), [rawResults, selectedFormat, minRating8Only]);
  const displayedRecommended = useMemo(() => filterList(rawRecommended), [rawRecommended, selectedFormat, minRating8Only]);

  const handleChipClick = (keyword) => {
    setSearchTerm(keyword);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleClear = () => {
    setSearchTerm('');
    if (inputRef.current) inputRef.current.focus();
  };

  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedFormat('all');
    setMinRating8Only(false);
  };

  return (
    <div className="min-h-screen bg-[#141414] pb-24 text-white font-sans">
      <Navbar />

      <div className="px-4 sm:px-8 md:px-14 pt-24 sm:pt-28 max-w-7xl mx-auto space-y-6">
        
        {/* Search Input Bar (Frosted iOS Glass Style) */}
        <div className="relative max-w-3xl mx-auto">
          <div className="relative flex items-center">
            <SearchIcon className="absolute left-4 sm:left-5 h-5 w-5 sm:h-6 sm:w-6 text-neutral-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search movies, TV series, anime, directors (e.g. Breaking Bad, Dune)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="w-full rounded-2xl bg-neutral-900/90 py-3.5 sm:py-4 pl-12 sm:pl-14 pr-12 text-sm sm:text-base text-white placeholder-neutral-500 shadow-2xl border border-white/10 outline-none backdrop-blur-xl transition-all focus:border-[#E50914] focus:ring-2 focus:ring-red-600/30"
            />
            {searchTerm && (
              <button
                onClick={handleClear}
                aria-label="Clear search input"
                className="absolute right-4 text-neutral-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Quick Trending Searches Chips Bar */}
          <div className="mt-3 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
            <span className="flex items-center gap-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap mr-1">
              <Flame className="h-3.5 w-3.5 text-[#E50914]" />
              Trending:
            </span>
            {TRENDING_SUGGESTIONS.map((item) => (
              <button
                key={item.label}
                onClick={() => handleChipClick(item.label)}
                className="flex items-center gap-1 rounded-full bg-white/5 hover:bg-white/15 px-3 py-1 text-neutral-300 hover:text-white border border-white/5 transition-all active:scale-95 whitespace-nowrap cursor-pointer"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Recent Search Queries (if any) */}
          {recentSearches.length > 0 && !debouncedQuery && (
            <div className="mt-2 flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
              <span className="flex items-center gap-1 text-[11px] font-medium text-neutral-500 uppercase tracking-wider whitespace-nowrap mr-1">
                <History className="h-3 w-3 text-neutral-500" />
                Recent:
              </span>
              {recentSearches.map((query) => (
                <button
                  key={query}
                  onClick={() => handleChipClick(query)}
                  className="rounded-full bg-neutral-900 hover:bg-neutral-800 px-2.5 py-0.5 text-neutral-400 hover:text-neutral-200 border border-neutral-800 text-[11px] whitespace-nowrap cursor-pointer transition-colors"
                >
                  {query}
                </button>
              ))}
              <button
                onClick={clearHistory}
                className="text-[10px] text-neutral-600 hover:text-neutral-400 underline ml-1 cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Filter Capsule Bar: Media Format & 8.0+ Rating Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
          {/* Format Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="flex items-center gap-1 text-xs font-bold text-neutral-400 uppercase tracking-wider mr-1 hidden sm:flex">
              <SlidersHorizontal className="h-3 w-3 text-red-500" />
              Format:
            </span>
            {FORMAT_FILTERS.map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => setSelectedFormat(fmt.id)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold tracking-tight transition-all active:scale-95 whitespace-nowrap cursor-pointer ${
                  selectedFormat === fmt.id
                    ? 'bg-white text-black shadow-md font-bold'
                    : 'bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                <span>{fmt.icon}</span>
                <span>{fmt.label}</span>
              </button>
            ))}
          </div>

          {/* Rating 8.0+ Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMinRating8Only((prev) => !prev)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                minRating8Only
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-900/30'
                  : 'bg-white/5 text-neutral-400 hover:text-white border border-white/5'
              }`}
            >
              <Star className={`h-3 w-3 ${minRating8Only ? 'fill-current text-black' : 'text-amber-400'}`} />
              <span>8.0+ Rated Only</span>
            </button>

            {(selectedFormat !== 'all' || minRating8Only) && (
              <button
                onClick={resetAllFilters}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 underline font-semibold cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Header / Indicators */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-neutral-400 pt-2">
          {debouncedQuery ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span>
                Showing results for <span className="font-semibold text-white">"{debouncedQuery}"</span>
              </span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-neutral-300 font-semibold">
                {displayedResults.length} title{displayedResults.length !== 1 ? 's' : ''} found
              </span>
              {selectedFormat !== 'all' && (
                <span className="rounded-full bg-red-950/60 border border-red-800/50 px-2 py-0.5 text-xs text-red-300 font-medium">
                  {FORMAT_FILTERS.find((f) => f.id === selectedFormat)?.label}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
              <Sparkles className="h-4 w-4 text-[#E50914]" />
              <span>Recommended Trending Titles</span>
              <span className="text-xs font-normal text-neutral-400">
                ({displayedRecommended.length} titles)
              </span>
            </div>
          )}

          {isFetching && (
            <div className="flex items-center gap-2 text-xs text-[#E50914] animate-pulse">
              <div className="h-2.5 w-2.5 rounded-full bg-[#E50914] animate-ping" />
              <span>Searching catalog...</span>
            </div>
          )}
        </div>

        {/* Search Results Grid */}
        {debouncedQuery && displayedResults.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 animate-in fade-in duration-300">
            {displayedResults.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelect={setSelectedMovie}
              />
            ))}
          </div>
        ) : debouncedQuery && !isLoading ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-white/5 bg-neutral-900/40 p-8">
            <Film className="h-16 w-16 text-neutral-600 mb-4 stroke-1" />
            <h3 className="text-lg font-bold text-neutral-200">No titles match your search</h3>
            <p className="text-sm text-neutral-400 max-w-md mt-1 leading-relaxed">
              We couldn't find any titles matching <span className="text-white font-semibold">"{debouncedQuery}"</span>
              {selectedFormat !== 'all' && ` in the ${FORMAT_FILTERS.find(f => f.id === selectedFormat)?.label} category`}.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={resetAllFilters}
                className="rounded-full bg-[#E50914] px-5 py-2 text-xs font-bold text-white shadow-lg transition-transform hover:scale-105 cursor-pointer"
              >
                Reset Search Filters
              </button>
              <button
                onClick={() => setSearchTerm('Breaking Bad')}
                className="rounded-full bg-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                Try "Breaking Bad"
              </button>
              <button
                onClick={() => setSearchTerm('Stranger Things')}
                className="rounded-full bg-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                Try "Stranger Things"
              </button>
            </div>
          </div>
        ) : !debouncedQuery && displayedRecommended.length > 0 ? (
          /* Recommended Default Feed */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 animate-in fade-in duration-300">
            {displayedRecommended.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelect={setSelectedMovie}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Details Modal */}
      {selectedMovie && (
        <DetailsModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Search;
