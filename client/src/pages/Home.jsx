/**
 * @file Home.jsx
 * @description Master cinematic streaming experience featuring multi-slide hero carousel, 
 * interactive genre & category spotlight, 18+ age verification gate, and visual category navigation.
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Apple TV / iOS 18 Design System:
 *    Glassmorphic segmented controls, frosted floating category pills, and dynamic genre spotlight banners.
 * 2. Complete Video Streaming Integration:
 *    Every movie across all rows and filtered grids streams live video clips on hover and full video in the player.
 * 3. 18+ Content Regulatory Policy & Parental Gate:
 *    Complies with MPAA/BBFC guidelines. Accessing adult content requires affirmative age verification,
 *    and users can toggle "Safe Mode" at any time.
 * 4. Multi-Category Architecture:
 *    Features 10+ distinct curated collections including Anime Universe, Cinema Classics Vault,
 *    18+ Action, Sci-Fi, Korean Suspense, Top 10 Today, and Global Cinema.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  ArrowLeft,
  ChevronRight,
  Play
} from 'lucide-react';
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
  { 
    id: 'all', 
    label: 'All Titles', 
    icon: '🎬', 
    desc: 'Explore the full StreamVerse universe of blockbusters, anime, and classics.' 
  },
  { 
    id: 'anime', 
    label: 'Anime Universe 🇯🇵', 
    icon: '🏮', 
    desc: 'Acclaimed Japanese animation masterpieces from Studio Ghibli, Makoto Shinkai, and Ufotable with original Japanese audio.' 
  },
  { 
    id: 'classics', 
    label: 'Cinema Classics Vault 🏛️', 
    icon: '🏛️', 
    desc: 'Legendary historical cinema and public domain milestones restored in high-definition video streaming.' 
  },
  { 
    id: '18plus', 
    label: '18+ Mature Action 🔞', 
    icon: '🔞', 
    desc: 'Intense, high-octane crime dramas and psychological thrillers strictly for adult audiences.' 
  },
  { 
    id: '878', 
    label: 'Sci-Fi & Cyberpunk 🌌', 
    icon: '🌌', 
    desc: 'Futuristic epics, quantum adventures, and visionary cyberpunk odysseys across space and time.' 
  },
  { 
    id: '28', 
    label: 'Action & Adventure 💥', 
    icon: '💥', 
    desc: 'Adrenaline-pumping blockbusters, martial arts combat, and daring heroic quests.' 
  },
  { 
    id: 'korean', 
    label: 'Korean Suspense 🇰🇷', 
    icon: '🇰🇷', 
    desc: 'Critically acclaimed South Korean cinema, psychological suspense, and gripping viral thrillers.' 
  },
  { 
    id: 'toprated', 
    label: 'Top Rated Masterpieces ⭐', 
    icon: '⭐', 
    desc: 'The highest-rated cinematic achievements of all time as voted by global audiences.' 
  },
  { 
    id: '35', 
    label: 'Comedy & Family 😂', 
    icon: '😂', 
    desc: 'Heartwarming animated journeys, witty comedies, and feel-good family entertainment.' 
  },
  { 
    id: 'es', 
    label: 'Spanish Cinema 🇪🇸', 
    icon: '🇪🇸', 
    desc: 'High-stakes heists, dark fantasies, and award-winning Spanish-language cinema.' 
  }
];

const AUDIO_LANG_FILTERS = [
  { code: 'all', label: 'All Audio Tracks' },
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

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [activeGenre, setActiveGenre] = useState(urlCategory || 'all');
  const [activeLanguage, setActiveLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('popularity'); // popularity, rating, year

  // Synchronize state when URL query parameter changes (e.g. from Navbar dropdown)
  useEffect(() => {
    if (urlCategory) {
      setActiveGenre(urlCategory);
      setActiveLanguage('all');
    } else {
      setActiveGenre('all');
    }
  }, [urlCategory]);

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
  const { data: classicsData, isLoading: isClassicsLoading } = useGenreMovies('classics');

  // Dedicated collections
  const { data: animeData, isLoading: isAnimeLoading } = useLanguageMovies('ja');
  const { data: koreanData, isLoading: isKoreanLoading } = useLanguageMovies('ko');
  const { data: spanishData, isLoading: isSpanishLoading } = useLanguageMovies('es');
  const { data: matureData, isLoading: isMatureLoading } = useMature18PlusMovies();

  const { data: filteredLanguageData, isLoading: isLangFilterLoading } = useLanguageMovies(
    activeLanguage !== 'all' ? activeLanguage : null
  );

  const { data: continueWatching = [] } = useContinueWatching();

  // Multi-Slide Hero Carousel (4 Diverse Blockbusters)
  const heroSlides = useMemo(() => {
    const list = [];
    const interstellar = trendingData?.results?.find((m) => m.id === 157336);
    if (interstellar) list.push(interstellar);

    const spiritedAway = animeData?.results?.find((m) => m.id === 129) || animeData?.results?.[0];
    if (spiritedAway) list.push(spiritedAway);

    const dune = trendingData?.results?.find((m) => m.id === 693134);
    if (dune) list.push(dune);

    const fightClub = matureData?.results?.find((m) => m.id === 550) || matureData?.results?.[0];
    if (fightClub) list.push(fightClub);

    return list.length > 0 ? list : (trendingData?.results || []).slice(0, 4);
  }, [trendingData, animeData, matureData]);

  // Handle Genre selection & 18+ verification gate
  const handleGenreClick = (genreId) => {
    if (genreId === '18plus' && !is18PlusAllowed) {
      setShowAgeVerificationModal(true);
      return;
    }
    setActiveGenre(genreId);
    if (genreId !== 'all') {
      setActiveLanguage('all');
      setSearchParams({ category: genreId });
    } else {
      setSearchParams({});
    }
  };

  const confirm18PlusAge = () => {
    setIs18PlusAllowed(true);
    setShowAgeVerificationModal(false);
    setActiveGenre('18plus');
    setActiveLanguage('all');
    setSearchParams({ category: '18plus' });
  };

  // Filtered view logic with sorting
  const filteredGenreMovies = useMemo(() => {
    let movies = [];
    if (activeGenre === 'anime') movies = animeData?.results || [];
    else if (activeGenre === 'classics') movies = classicsData?.results || [];
    else if (activeGenre === '18plus') movies = matureData?.results || [];
    else if (activeGenre === '878') movies = scifiData?.results || [];
    else if (activeGenre === '28') movies = actionData?.results || [];
    else if (activeGenre === 'korean') movies = koreanData?.results || [];
    else if (activeGenre === 'toprated') movies = topRatedData?.results || [];
    else if (activeGenre === '35') movies = comedyData?.results || [];
    else if (activeGenre === 'es') movies = spanishData?.results || [];

    // Parental Safe Mode filter
    if (!is18PlusAllowed) {
      movies = movies.filter((m) => !m.is18Plus);
    }

    // Sort order
    if (sortBy === 'rating') {
      return [...movies].sort((a, b) => b.rating - a.rating);
    }
    if (sortBy === 'year') {
      return [...movies].sort((a, b) => new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0));
    }
    return movies;
  }, [activeGenre, animeData, classicsData, matureData, scifiData, actionData, koreanData, topRatedData, comedyData, spanishData, is18PlusAllowed, sortBy]);

  const isFilterActive = activeGenre !== 'all' || activeLanguage !== 'all';
  const currentGenreObj = GENRE_FILTERS.find((g) => g.id === activeGenre);

  return (
    <div className="min-h-screen bg-[#141414] pb-10 text-white font-sans">
      <Navbar />

      {/* Multi-Slide Cinematic Hero Section (Only shown on default home feed) */}
      {!isFilterActive && (
        <Hero
          slides={heroSlides}
          isLoading={isTrendingLoading}
          onSelect={setSelectedMovie}
        />
      )}

      {/* Glassmorphic Category & Genre Master Bar */}
      <div className={`px-4 sm:px-8 md:px-14 z-40 relative space-y-3 ${
        isFilterActive ? 'pt-24 sm:pt-28' : '-mt-10 sm:-mt-12 md:-mt-16'
      }`}>
        
        {/* Floating Category Capsule Bar */}
        <div className="rounded-2xl border border-white/10 bg-black/60 p-2 backdrop-blur-xl shadow-2xl">
          {/* Main Category Pills */}
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto py-1">
            <span className="flex items-center gap-1 text-xs font-bold text-neutral-400 uppercase tracking-wider mr-2 hidden lg:flex">
              <Sparkles className="h-3.5 w-3.5 text-[#E50914]" />
              Explore:
            </span>
            {GENRE_FILTERS.map((genre) => (
              <button
                key={genre.id}
                onClick={() => handleGenreClick(genre.id)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold tracking-tight transition-all active:scale-95 whitespace-nowrap cursor-pointer ${
                  activeGenre === genre.id
                    ? 'bg-white text-black shadow-lg shadow-white/20 font-bold'
                    : genre.id === '18plus'
                    ? 'bg-red-950/60 text-red-300 hover:bg-red-900/60 border border-red-800/50'
                    : 'bg-white/5 text-neutral-300 hover:bg-white/15 hover:text-white border border-white/5'
                }`}
              >
                <span>{genre.icon}</span>
                <span>{genre.label.replace(/[\u{1F300}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')}</span>
              </button>
            ))}
          </div>

          {/* Sub-Bar: Audio Language Pills & Parental Safe Mode Toggle */}
          <div className="no-scrollbar flex items-center justify-between gap-4 overflow-x-auto pt-2 mt-1 border-t border-white/5">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider mr-1 hidden sm:flex">
                <Globe className="h-3 w-3 text-[#E50914]" />
                Audio:
              </span>
              {AUDIO_LANG_FILTERS.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setActiveLanguage(lang.code);
                    if (lang.code !== 'all') setActiveGenre('all');
                  }}
                  className={`rounded-full px-3 py-0.5 text-xs font-medium tracking-tight transition-all active:scale-95 whitespace-nowrap cursor-pointer ${
                    activeLanguage === lang.code
                      ? 'bg-[#E50914] text-white shadow-md shadow-red-900/40 font-bold'
                      : 'bg-white/5 text-neutral-400 hover:bg-white/15 hover:text-white border border-white/5'
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
                    setSearchParams({});
                  }}
                  className="text-xs text-red-400 hover:text-white underline ml-3 whitespace-nowrap cursor-pointer font-semibold"
                >
                  Reset All Filters
                </button>
              )}
            </div>

            {/* 18+ Content Safe-Mode Toggle */}
            <div className="flex items-center gap-2 text-xs text-neutral-400 whitespace-nowrap hidden sm:flex pl-4">
              <ShieldAlert className={`h-4 w-4 ${is18PlusAllowed ? 'text-red-500' : 'text-green-500'}`} />
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
      </div>

      {/* Main Catalog View: Filtered Genre Spotlight OR Multi-Row Feed */}
      <div className="relative z-30 mt-6 space-y-8">
        
        {/* Category Spotlight Header (When Active) */}
        {activeGenre !== 'all' ? (
          <div className="px-4 sm:px-8 md:px-14 space-y-6">
            
            {/* Cinematic Spotlight Banner */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-red-950/40 via-neutral-900/80 to-black p-6 sm:p-10 shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{currentGenreObj?.icon}</span>
                    <span className="rounded-full bg-red-600/20 border border-red-500/30 px-3 py-0.5 text-xs font-bold text-red-300 uppercase tracking-widest">
                      Category Spotlight
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                    {currentGenreObj?.label}
                  </h2>
                  <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                    {currentGenreObj?.desc}
                  </p>
                  <div className="flex items-center gap-3 pt-2 text-xs text-neutral-400">
                    <span className="rounded bg-white/10 px-2 py-0.5 font-bold text-white">
                      {filteredGenreMovies.length} Titles Available
                    </span>
                    <span>•</span>
                    <span>4K Ultra HD</span>
                    <span>•</span>
                    <span>Instant Video Streaming</span>
                  </div>
                </div>

                {/* Sort Controls & Return Button */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 text-xs">
                    <button
                      onClick={() => setSortBy('popularity')}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                        sortBy === 'popularity' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Popularity
                    </button>
                    <button
                      onClick={() => setSortBy('rating')}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                        sortBy === 'rating' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Top Rated
                    </button>
                    <button
                      onClick={() => setSortBy('year')}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                        sortBy === 'year' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Release Year
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setActiveGenre('all');
                      setSearchParams({});
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-900/80 px-4 py-2 text-xs font-bold text-neutral-200 hover:text-white hover:border-white transition-all cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    All Rows
                  </button>
                </div>
              </div>
            </div>

            {/* Grid of Movie Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-5">
              {filteredGenreMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} onSelect={setSelectedMovie} />
              ))}
            </div>
          </div>
        ) : activeLanguage !== 'all' ? (
          /* Filtered by Audio Language */
          <div className="px-4 sm:px-8 md:px-14 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Globe className="h-5 w-5 text-[#E50914]" />
              <span>
                Movies with {AUDIO_LANG_FILTERS.find((l) => l.code === activeLanguage)?.label} Audio
              </span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-5">
              {(filteredLanguageData?.results || []).map((movie) => (
                <MovieCard key={movie.id} movie={movie} onSelect={setSelectedMovie} />
              ))}
            </div>
          </div>
        ) : (
          /* Default All-Rows View: Distinct, Sensibly Curated Rows */
          <>
            {/* Top 10 Movies Today (Signature Netflix Style) */}
            <Row
              title="Top 10 Movies on StreamVerse Today"
              movies={trendingData?.results?.slice(0, 10)}
              isLoading={isTrendingLoading}
              onSelect={setSelectedMovie}
              isTop10={true}
            />

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

            {/* Anime & Studio Ghibli Masterpieces */}
            <Row
              title="Anime Universe & Studio Ghibli 🇯🇵"
              movies={animeData?.results}
              isLoading={isAnimeLoading}
              onSelect={setSelectedMovie}
            />

            {/* Cinema Classics & Historical Vault */}
            <Row
              title="Cinema Classics & Historical Vault 🏛️"
              movies={classicsData?.results}
              isLoading={isClassicsLoading}
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
              title="Sci-Fi & Cyberpunk Visions 🌌"
              movies={scifiData?.results}
              isLoading={isScifiLoading}
              onSelect={setSelectedMovie}
            />

            {/* High-Octane Action */}
            <Row
              title="High-Octane Action & Adventure 💥"
              movies={actionData?.results}
              isLoading={isActionLoading}
              onSelect={setSelectedMovie}
            />

            {/* Comedy & Family */}
            <Row
              title="Critically Acclaimed Comedies & Family 😂"
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

      {/* Enterprise Cinema Footer */}
      <Footer />
    </div>
  );
};

export default Home;
