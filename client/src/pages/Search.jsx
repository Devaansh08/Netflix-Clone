/**
 * @file Search.jsx
 * @description Real-time catalog search page featuring 400ms debounce and responsive grid layout.
 * 
 * DATA FLOW:
 * [User types into search bar]
 *      │
 *      ▼
 * [Debounce Timer: 400ms]
 *      │ (Prevents flooding backend API on every keystroke)
 *      ▼
 * [`useSearchMovies(debouncedQuery)` via React Query]
 *      │
 *      ▼
 * [Renders responsive grid of `<MovieCard />` components]
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. 400ms Debounce Rate-Limiting:
 *    Without debounce, typing "Interstellar" generates 12 network requests in under two seconds.
 *    Debouncing waits until user stops typing, cutting outbound network load by ~90% and preserving TMDB quotas.
 * 2. Responsive Auto-Fitting Grid:
 *    Scales fluidly from 2 columns on smartphones to 6 columns on widescreen desktop monitors.
 */

import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X, Film } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import MovieCard from '../components/MovieCard.jsx';
import DetailsModal from '../components/DetailsModal.jsx';
import { useSearchMovies } from '../api/movieQueries.js';

export const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);

  // 400ms Debounce Effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchTerm.trim());
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: searchData, isLoading, isFetching } = useSearchMovies(debouncedQuery);
  const results = searchData?.results || [];

  return (
    <div className="min-h-screen bg-[#141414] pb-20">
      <Navbar />

      <div className="px-4 sm:px-8 md:px-14 pt-24 sm:pt-28 max-w-7xl mx-auto space-y-8">
        {/* Search Input Bar */}
        <div className="relative max-w-2xl mx-auto">
          <div className="relative flex items-center">
            <SearchIcon className="absolute left-4 h-6 w-6 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by title, genre, or keyword (e.g. Inception, Dune)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="w-full rounded-full bg-neutral-900/90 py-3.5 pl-14 pr-12 text-base text-white placeholder-neutral-500 shadow-inner border border-neutral-700 outline-none transition-all focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                aria-label="Clear search input"
                className="absolute right-4 text-neutral-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Results Header / Indicators */}
        <div className="flex items-center justify-between text-sm text-neutral-400">
          {debouncedQuery ? (
            <p>
              Showing results for <span className="font-semibold text-white">"{debouncedQuery}"</span>
              {results.length > 0 && ` (${results.length} found)`}
            </p>
          ) : (
            <p className="text-center w-full text-neutral-500">
              Find your next favorite film. Start typing in the search bar above.
            </p>
          )}

          {isFetching && (
            <div className="flex items-center gap-2 text-xs text-[#E50914] animate-pulse">
              <div className="h-3 w-3 rounded-full bg-[#E50914] animate-ping" />
              <span>Searching catalog...</span>
            </div>
          )}
        </div>

        {/* Results Grid */}
        {debouncedQuery && results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {results.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelect={setSelectedMovie}
              />
            ))}
          </div>
        ) : debouncedQuery && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Film className="h-16 w-16 text-neutral-700 mb-4" />
            <h3 className="text-lg font-bold text-neutral-300">No movies found</h3>
            <p className="text-sm text-neutral-500 max-w-sm mt-1">
              We couldn't find any titles matching "{debouncedQuery}". Try checking for typos or searching for a different keyword.
            </p>
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
    </div>
  );
};

export default Search;
