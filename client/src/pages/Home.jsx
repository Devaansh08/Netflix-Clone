/**
 * @file Home.jsx
 * @description Apple iOS/tvOS-inspired streaming homepage featuring dynamic genre & audio language filters.
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & USER EXPERIENCE:
 * 1. Rich Multilingual Catalog:
 *    Renders distinct, non-overlapping movies for every single row with genuine international audio tracks
 *    (English, Japanese, Korean, Spanish, Hindi).
 * 2. iOS Segmented Category & Language Controls:
 *    Provides instant tactile filtering by Genre (Action, Sci-Fi, Anime, Korean, Comedy) and Audio Track
 *    without reloading the page or losing scroll context.
 */

import React, { useState, useMemo } from 'react';
import { Film, Globe, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import Row from '../components/Row.jsx';
import DetailsModal from '../components/DetailsModal.jsx';
import MovieCard from '../components/MovieCard.jsx';
import {
  useTrendingMovies,
  useTopRatedMovies,
  usePopularMovies,
  useGenreMovies,
  useLanguageMovies,
  useContinueWatching
} from '../api/movieQueries.js';

const GENRE_FILTERS = [
  { id: 'all', label: 'All Categories' },
  { id: '28', label: 'Action & Adventure' },
  { id: '878', label: 'Sci-Fi & Cyberpunk' },
  { id: 'anime', label: 'Anime & Studio Ghibli' },
  { id: 'korean', label: 'Korean Cinema' },
  { id: '35', label: 'Comedy' },
  { id: '80', label: 'Crime & Heist' }
];

const AUDIO_LANG_FILTERS = [
  { code: 'all', label: 'All Audio Tracks' },
  { code: 'en', label: 'English 🇺🇸' },
  { code: 'ja', label: 'Japanese 🇯🇵' },
  { code: 'ko', label: 'Korean 🇰🇷' },
  { code: 'es', label: 'Spanish 🇪🇸' },
  { code: 'hi', label: 'Hindi 🇮🇳' }
];

export const Home = () => {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [activeGenre, setActiveGenre] = useState('all');
  const [activeLanguage, setActiveLanguage] = useState('all');

  // Distinct category queries
  const { data: trendingData, isLoading: isTrendingLoading } = useTrendingMovies();
  const { data: topRatedData, isLoading: isTopRatedLoading } = useTopRatedMovies();
  const { data: popularData, isLoading: isPopularLoading } = usePopularMovies();
  const { data: actionData, isLoading: isActionLoading } = useGenreMovies(28); // 28 = Action
  const { data: scifiData, isLoading: isScifiLoading } = useGenreMovies(878); // 878 = Sci-Fi
  const { data: comedyData, isLoading: isComedyLoading } = useGenreMovies(35); // 35 = Comedy
  const { data: crimeData, isLoading: isCrimeLoading } = useGenreMovies(80); // 80 = Crime

  // Audio Language queries
  const { data: animeData, isLoading: isAnimeLoading } = useLanguageMovies('ja');
  const { data: koreanData, isLoading: isKoreanLoading } = useLanguageMovies('ko');
  const { data: spanishData, isLoading: isSpanishLoading } = useLanguageMovies('es');
  const { data: hindiData, isLoading: isHindiLoading } = useLanguageMovies('hi');
  const { data: filteredLanguageData, isLoading: isLangFilterLoading } = useLanguageMovies(
    activeLanguage !== 'all' ? activeLanguage : null
  );

  const { data: continueWatching = [] } = useContinueWatching();

  // Featured hero banner title
  const featuredHeroMovie = useMemo(() => {
    const list = trendingData?.results || [];
    if (list.length === 0) return null;
    return list[0]; // Interstellar or trending leader
  }, [trendingData]);

  // Handle active genre filter selection
  const filteredGenreMovies = useMemo(() => {
    if (activeGenre === '28') return actionData?.results || [];
    if (activeGenre === '878') return scifiData?.results || [];
    if (activeGenre === 'anime') return animeData?.results || [];
    if (activeGenre === 'korean') return koreanData?.results || [];
    if (activeGenre === '35') return comedyData?.results || [];
    if (activeGenre === '80') return crimeData?.results || [];
    return [];
  }, [activeGenre, actionData, scifiData, animeData, koreanData, comedyData, crimeData]);

  const isFilterActive = activeGenre !== 'all' || activeLanguage !== 'all';

  return (
    <div className="min-h-screen bg-[#141414] pb-24 text-white">
      <Navbar />

      {/* Hero Showcase Banner */}
      {!isFilterActive && (
        <Hero
          movie={featuredHeroMovie}
          isLoading={isTrendingLoading}
          onSelect={setSelectedMovie}
        />
      )}

      {/* iOS Segmented Controls Bar (Genres & Audio Languages) */}
      <div className={`px-4 sm:px-8 md:px-14 z-40 relative space-y-3 ${
        isFilterActive ? 'pt-24 sm:pt-28' : '-mt-8 sm:-mt-10 md:-mt-14'
      }`}>
        {/* Category Pills Scroller */}
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto py-1">
          <span className="flex items-center gap-1 text-xs font-bold text-neutral-400 uppercase tracking-wider mr-2 hidden md:flex">
            <Sparkles className="h-3.5 w-3.5 text-[#E50914]" />
            Genres:
          </span>
          {GENRE_FILTERS.map((genre) => (
            <button
              key={genre.id}
              onClick={() => {
                setActiveGenre(genre.id);
                if (genre.id !== 'all') setActiveLanguage('all');
              }}
              className={`rounded-full px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold tracking-tight transition-all active:scale-95 whitespace-nowrap cursor-pointer ${
                activeGenre === genre.id
                  ? 'bg-white text-black shadow-lg shadow-white/20'
                  : 'bg-white/10 text-neutral-300 hover:bg-white/20 hover:text-white backdrop-blur-md border border-white/5'
              }`}
            >
              {genre.label}
            </button>
          ))}
        </div>

        {/* Audio Language Pills Scroller */}
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto py-1">
          <span className="flex items-center gap-1 text-xs font-bold text-neutral-400 uppercase tracking-wider mr-2 hidden md:flex">
            <Globe className="h-3.5 w-3.5 text-[#E50914]" />
            Audio:
          </span>
          {AUDIO_LANG_FILTERS.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setActiveLanguage(lang.code);
                if (lang.code !== 'all') setActiveGenre('all');
              }}
              className={`rounded-full px-3 sm:px-3.5 py-1 text-xs font-semibold tracking-tight transition-all active:scale-95 whitespace-nowrap cursor-pointer ${
                activeLanguage === lang.code
                  ? 'bg-[#E50914] text-white shadow-lg shadow-red-900/40'
                  : 'bg-white/5 text-neutral-400 hover:bg-white/15 hover:text-white backdrop-blur-md border border-white/5'
              }`}
            >
              {lang.label}
            </button>
          ))}
          {isFilterActive && (
            <button
              onClick={() => {
                setActiveGenre('all');
                setActiveLanguage('all');
              }}
              className="text-xs text-neutral-400 hover:text-white underline ml-2 whitespace-nowrap cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Filtered View OR Full Multi-Row Catalog */}
      <div className="relative z-30 mt-6 space-y-6">
        {/* Render filtered grid when user activates a specific genre or audio language */}
        {activeLanguage !== 'all' ? (
          <div className="px-4 sm:px-8 md:px-14 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Globe className="h-5 w-5 text-[#E50914]" />
              <span>
                Movies with {AUDIO_LANG_FILTERS.find((l) => l.code === activeLanguage)?.label} Audio
              </span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {(filteredLanguageData?.results || []).map((movie) => (
                <MovieCard key={movie.id} movie={movie} onSelect={setSelectedMovie} />
              ))}
            </div>
          </div>
        ) : activeGenre !== 'all' ? (
          <div className="px-4 sm:px-8 md:px-14 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Film className="h-5 w-5 text-[#E50914]" />
              <span>{GENRE_FILTERS.find((g) => g.id === activeGenre)?.label} Collection</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {filteredGenreMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} onSelect={setSelectedMovie} />
              ))}
            </div>
          </div>
        ) : (
          /* Default All View: Distinct curated rows per category */
          <>
            {/* Continue Watching Rail (Dynamic per user) */}
            {continueWatching.length > 0 && (
              <Row
                title="Continue Watching"
                movies={continueWatching}
                onSelect={setSelectedMovie}
              />
            )}

            {/* Trending Now */}
            <Row
              title="Trending Now"
              movies={trendingData?.results}
              isLoading={isTrendingLoading}
              onSelect={setSelectedMovie}
            />

            {/* Top Rated Classics */}
            <Row
              title="Top Rated on StreamVerse"
              movies={topRatedData?.results}
              isLoading={isTopRatedLoading}
              onSelect={setSelectedMovie}
            />

            {/* Anime & Studio Ghibli */}
            <Row
              title="Anime & Japanese Animation 🇯🇵"
              movies={animeData?.results}
              isLoading={isAnimeLoading}
              onSelect={setSelectedMovie}
            />

            {/* Popular Blockbusters */}
            <Row
              title="Popular Worldwide"
              movies={popularData?.results}
              isLoading={isPopularLoading}
              onSelect={setSelectedMovie}
            />

            {/* Korean Cinema */}
            <Row
              title="Korean Cinema & Thrillers 🇰🇷"
              movies={koreanData?.results}
              isLoading={isKoreanLoading}
              onSelect={setSelectedMovie}
            />

            {/* Action & Adventure */}
            <Row
              title="High-Octane Action & Adventure"
              movies={actionData?.results}
              isLoading={isActionLoading}
              onSelect={setSelectedMovie}
            />

            {/* Sci-Fi & Cyberpunk */}
            <Row
              title="Sci-Fi & Cyberpunk Visions"
              movies={scifiData?.results}
              isLoading={isScifiLoading}
              onSelect={setSelectedMovie}
            />

            {/* Spanish & International */}
            <Row
              title="Spanish Cinema & Global Heists 🇪🇸"
              movies={spanishData?.results}
              isLoading={isSpanishLoading}
              onSelect={setSelectedMovie}
            />

            {/* Comedy */}
            <Row
              title="Critically Acclaimed Comedies"
              movies={comedyData?.results}
              isLoading={isComedyLoading}
              onSelect={setSelectedMovie}
            />
          </>
        )}
      </div>

      {/* Details Modal */}
      {selectedMovie && (
        <DetailsModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}

      {/* Apple TV / Netflix Style Footer */}
      <footer className="mt-20 border-t border-neutral-800 px-6 sm:px-16 py-10 text-center text-xs text-neutral-500">
        <p className="mb-2">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
        <p>© 2026 StreamVerse Inc. Built for Senior Full-Stack Engineering Demonstration.</p>
      </footer>
    </div>
  );
};

export default Home;
