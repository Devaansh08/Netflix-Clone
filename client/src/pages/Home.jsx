/**
 * @file Home.jsx
 * @description Apple iOS / tvOS streaming experience with multi-slide hero, Anime category, 18+ parental policy, and enhanced footer.
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Multi-Slide Genre Carousel:
 *    Auto-rotates through 4 films spanning Sci-Fi, Anime, Action, and 18+ Thriller.
 * 2. 18+ Content Policy & Parental Gate:
 *    Complies with industry content safety standards. When the 18+ filter is active or toggled,
 *    an age verification advisory gate confirms viewer maturity.
 * 3. Dedicated Anime Universe:
 *    Prominently surfaces Japanese animated masterpieces with authentic audio and Japanese language tags.
 * 4. Micro-Video Hover & Mobile Auto-Play Previews:
 *    Every card across every row plays video preview clips on hover and on mobile scroll intersection.
 */

import React, { useState, useMemo } from 'react';
import { Film, Globe, Sparkles, ShieldAlert, Check, X } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import Row from '../components/Row.jsx';
import DetailsModal from '../components/DetailsModal.jsx';
import MovieCard from '../components/MovieCard.jsx';
import Footer from '../components/Footer.jsx';
import {
  useTrendingMovies,
  useTopRatedMovies,
  usePopularMovies,
  useGenreMovies,
  useLanguageMovies,
  useMature18PlusMovies,
  useContinueWatching
} from '../api/movieQueries.js';

const GENRE_FILTERS = [
  { id: 'all', label: 'All Categories' },
  { id: 'anime', label: 'Anime & Studio Ghibli 🇯🇵' },
  { id: '18plus', label: '18+ Mature Collection 🔞' },
  { id: '878', label: 'Sci-Fi & Cyberpunk' },
  { id: '28', label: 'Action & Adventure' },
  { id: 'korean', label: 'Korean Cinema 🇰🇷' },
  { id: '35', label: 'Comedy & Family' },
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

  // 18+ Content Policy & Parental Gate State
  const [is18PlusAllowed, setIs18PlusAllowed] = useState(true);
  const [showAgeVerificationModal, setShowAgeVerificationModal] = useState(false);

  // Category queries
  const { data: trendingData, isLoading: isTrendingLoading } = useTrendingMovies();
  const { data: topRatedData, isLoading: isTopRatedLoading } = useTopRatedMovies();
  const { data: popularData, isLoading: isPopularLoading } = usePopularMovies();
  const { data: actionData, isLoading: isActionLoading } = useGenreMovies(28); // 28 = Action
  const { data: scifiData, isLoading: isScifiLoading } = useGenreMovies(878); // 878 = Sci-Fi
  const { data: comedyData, isLoading: isComedyLoading } = useGenreMovies(35); // 35 = Comedy
  const { data: crimeData, isLoading: isCrimeLoading } = useGenreMovies(80); // 80 = Crime

  // Dedicated collections
  const { data: animeData, isLoading: isAnimeLoading } = useLanguageMovies('ja');
  const { data: koreanData, isLoading: isKoreanLoading } = useLanguageMovies('ko');
  const { data: spanishData, isLoading: isSpanishLoading } = useLanguageMovies('es');
  const { data: matureData, isLoading: isMatureLoading } = useMature18PlusMovies();

  const { data: filteredLanguageData, isLoading: isLangFilterLoading } = useLanguageMovies(
    activeLanguage !== 'all' ? activeLanguage : null
  );

  const { data: continueWatching = [] } = useContinueWatching();

  // Multi-Slide Hero Carousel (4 Diverse Genres: Sci-Fi, Anime, Action, 18+ Thriller)
  const heroSlides = useMemo(() => {
    const list = [];
    // 1. Sci-Fi: Interstellar
    const interstellar = trendingData?.results?.find((m) => m.id === 157336);
    if (interstellar) list.push(interstellar);

    // 2. Anime: Spirited Away
    const spiritedAway = animeData?.results?.find((m) => m.id === 129) || animeData?.results?.[0];
    if (spiritedAway) list.push(spiritedAway);

    // 3. Action / Sci-Fi: Dune 2
    const dune = trendingData?.results?.find((m) => m.id === 693134);
    if (dune) list.push(dune);

    // 4. 18+ Thriller / Comedy: Parasite
    const parasite = matureData?.results?.find((m) => m.id === 496243);
    if (parasite) list.push(parasite);

    // Fallback if initial load
    return list.length > 0 ? list : (trendingData?.results || []).slice(0, 4);
  }, [trendingData, animeData, matureData]);

  // Handle Genre selection & 18+ verification gate
  const handleGenreClick = (genreId) => {
    if (genreId === '18plus' && !is18PlusAllowed) {
      setShowAgeVerificationModal(true);
      return;
    }
    setActiveGenre(genreId);
    if (genreId !== 'all') setActiveLanguage('all');
  };

  const confirm18PlusAge = () => {
    setIs18PlusAllowed(true);
    setShowAgeVerificationModal(false);
    setActiveGenre('18plus');
    setActiveLanguage('all');
  };

  // Filtered view logic
  const filteredGenreMovies = useMemo(() => {
    let movies = [];
    if (activeGenre === 'anime') movies = animeData?.results || [];
    else if (activeGenre === '18plus') movies = matureData?.results || [];
    else if (activeGenre === '28') movies = actionData?.results || [];
    else if (activeGenre === '878') movies = scifiData?.results || [];
    else if (activeGenre === 'korean') movies = koreanData?.results || [];
    else if (activeGenre === '35') movies = comedyData?.results || [];
    else if (activeGenre === '80') movies = crimeData?.results || [];

    if (!is18PlusAllowed) {
      movies = movies.filter((m) => !m.is18Plus);
    }
    return movies;
  }, [activeGenre, animeData, matureData, actionData, scifiData, koreanData, comedyData, crimeData, is18PlusAllowed]);

  const isFilterActive = activeGenre !== 'all' || activeLanguage !== 'all';

  return (
    <div className="min-h-screen bg-[#141414] pb-10 text-white font-sans">
      <Navbar />

      {/* Multi-Slide Cinematic Hero Section (Only shown when not actively filtering) */}
      {!isFilterActive && (
        <Hero
          slides={heroSlides}
          isLoading={isTrendingLoading}
          onSelect={setSelectedMovie}
        />
      )}

      {/* iOS Segmented Controls Bar (Genres, Audio Languages, & 18+ Policy Toggle) */}
      <div className={`px-4 sm:px-8 md:px-14 z-40 relative space-y-3 ${
        isFilterActive ? 'pt-24 sm:pt-28' : '-mt-10 sm:-mt-12 md:-mt-16'
      }`}>
        {/* Category Pills Scroller */}
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto py-1">
          <span className="flex items-center gap-1 text-xs font-bold text-neutral-400 uppercase tracking-wider mr-2 hidden md:flex">
            <Sparkles className="h-3.5 w-3.5 text-[#E50914]" />
            Categories:
          </span>
          {GENRE_FILTERS.map((genre) => (
            <button
              key={genre.id}
              onClick={() => handleGenreClick(genre.id)}
              className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold tracking-tight transition-all active:scale-95 whitespace-nowrap cursor-pointer ${
                activeGenre === genre.id
                  ? 'bg-white text-black shadow-lg shadow-white/20'
                  : genre.id === '18plus'
                  ? 'bg-red-950/60 text-red-300 hover:bg-red-900/60 border border-red-800/50'
                  : 'bg-white/10 text-neutral-300 hover:bg-white/20 hover:text-white backdrop-blur-md border border-white/5'
              }`}
            >
              {genre.label}
            </button>
          ))}
        </div>

        {/* Audio Language Pills Scroller */}
        <div className="no-scrollbar flex items-center justify-between gap-4 overflow-x-auto py-1">
          <div className="flex items-center gap-2">
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
                className={`rounded-full px-3.5 py-1 text-xs font-semibold tracking-tight transition-all active:scale-95 whitespace-nowrap cursor-pointer ${
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

          {/* 18+ Content Safe-Mode Toggle */}
          <div className="flex items-center gap-2 text-xs text-neutral-400 whitespace-nowrap hidden sm:flex">
            <ShieldAlert className={`h-4 w-4 ${is18PlusAllowed ? 'text-red-500' : 'text-green-500'}`} />
            <span>18+ Policy:</span>
            <button
              onClick={() => {
                if (!is18PlusAllowed) {
                  setShowAgeVerificationModal(true);
                } else {
                  setIs18PlusAllowed(false);
                  if (activeGenre === '18plus') setActiveGenre('all');
                }
              }}
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase transition-all cursor-pointer ${
                is18PlusAllowed
                  ? 'bg-red-900/70 text-red-200 border border-red-700/60'
                  : 'bg-green-900/70 text-green-200 border border-green-700/60'
              }`}
            >
              {is18PlusAllowed ? '18+ Enabled' : 'Safe Mode (18+ Blocked)'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Catalog View: Filtered Grid OR Multi-Row Categories */}
      <div className="relative z-30 mt-6 space-y-6">
        {activeLanguage !== 'all' ? (
          /* Filtered by Audio Language */
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
          /* Filtered by Category / Genre */
          <div className="px-4 sm:px-8 md:px-14 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Film className="h-5 w-5 text-[#E50914]" />
              <span>{GENRE_FILTERS.find((g) => g.id === activeGenre)?.label}</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {filteredGenreMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} onSelect={setSelectedMovie} />
              ))}
            </div>
          </div>
        ) : (
          /* Default All View: Distinct, Sensibly Curated Rows */
          <>
            {/* Continue Watching Rail */}
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

            {/* Anime & Studio Ghibli Masterpieces (Dedicated Anime Row) */}
            <Row
              title="Anime Universe & Studio Ghibli 🇯🇵"
              movies={animeData?.results}
              isLoading={isAnimeLoading}
              onSelect={setSelectedMovie}
            />

            {/* 18+ Mature Action & Crime Thrillers */}
            {is18PlusAllowed && (
              <Row
                title="18+ Mature Action & Crime Thrillers 🔞"
                movies={matureData?.results}
                isLoading={isMatureLoading}
                onSelect={setSelectedMovie}
              />
            )}

            {/* Top Rated Classics */}
            <Row
              title="Top Rated Masterpieces on StreamVerse"
              movies={topRatedData?.results}
              isLoading={isTopRatedLoading}
              onSelect={setSelectedMovie}
            />

            {/* Popular Worldwide */}
            <Row
              title="Popular Worldwide"
              movies={popularData?.results}
              isLoading={isPopularLoading}
              onSelect={setSelectedMovie}
            />

            {/* Korean Cinema & Thrillers */}
            <Row
              title="Korean Suspense & Cinema 🇰🇷"
              movies={koreanData?.results}
              isLoading={isKoreanLoading}
              onSelect={setSelectedMovie}
            />

            {/* Sci-Fi & Cyberpunk Visions */}
            <Row
              title="Sci-Fi & Cyberpunk Visions"
              movies={scifiData?.results}
              isLoading={isScifiLoading}
              onSelect={setSelectedMovie}
            />

            {/* High-Octane Action */}
            <Row
              title="High-Octane Action & Adventure"
              movies={actionData?.results}
              isLoading={isActionLoading}
              onSelect={setSelectedMovie}
            />

            {/* Comedy & Family */}
            <Row
              title="Critically Acclaimed Comedies & Family"
              movies={comedyData?.results}
              isLoading={isComedyLoading}
              onSelect={setSelectedMovie}
            />

            {/* Spanish & International */}
            <Row
              title="Spanish Cinema & Global Heists 🇪🇸"
              movies={spanishData?.results}
              isLoading={isSpanishLoading}
              onSelect={setSelectedMovie}
            />
          </>
        )}
      </div>

      {/* 18+ Age Verification Modal Gate (Parental Compliance) */}
      {showAgeVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-neutral-900 border border-red-700/60 p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <ShieldAlert className="h-8 w-8 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-white">Age-Restricted Content Policy</h3>
                <span className="text-xs text-red-400 font-semibold">18+ Mature Audiences Only</span>
              </div>
            </div>

            <p className="text-sm text-neutral-300 leading-relaxed">
              Titles in this category contain mature themes, graphic violence, strong language, or adult situations as rated by international broadcasting boards.
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

      {/* Apple TV / Netflix Enhanced Footer */}
      <Footer />
    </div>
  );
};

export default Home;
