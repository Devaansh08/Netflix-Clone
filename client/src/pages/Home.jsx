/**
 * @file Home.jsx
 * @description Main StreamVerse catalog landing page featuring hero showcase and category rows.
 * 
 * DATA FLOW:
 * [Home Page Mount]
 *      │
 *      ├──► `useTrendingMovies()` ──► Passes random title to `<Hero />` & results to Trending `<Row />`
 *      ├──► `useContinueWatching()` ──► Renders "Continue Watching" rail if active progress exists
 *      ├──► `useTopRatedMovies()` ──► Renders Top Rated `<Row />`
 *      ├──► `usePopularMovies()` ──► Renders Popular `<Row />`
 *      └──► `useGenreMovies(28 / 878)` ──► Renders Action & Sci-Fi `<Row />`
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Independent Query Isolation:
 *    Each row fetches and manages its own query state. If one genre endpoint has a brief network hiccup,
 *    the remaining rows still render smoothly rather than crashing the entire screen.
 * 2. Details Modal Elevation:
 *    Elevating modal state (`selectedMovie`) to the page level allows any card in any row to trigger
 *    the unified preview modal seamlessly.
 */

import React, { useState, useMemo } from 'react';
import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import Row from '../components/Row.jsx';
import DetailsModal from '../components/DetailsModal.jsx';
import {
  useTrendingMovies,
  useTopRatedMovies,
  usePopularMovies,
  useGenreMovies,
  useContinueWatching
} from '../api/movieQueries.js';

export const Home = () => {
  const [selectedMovie, setSelectedMovie] = useState(null);

  // Category queries
  const { data: trendingData, isLoading: isTrendingLoading } = useTrendingMovies();
  const { data: topRatedData, isLoading: isTopRatedLoading } = useTopRatedMovies();
  const { data: popularData, isLoading: isPopularLoading } = usePopularMovies();
  const { data: actionData, isLoading: isActionLoading } = useGenreMovies(28); // 28 = Action
  const { data: scifiData, isLoading: isScifiLoading } = useGenreMovies(878); // 878 = Sci-Fi
  const { data: continueWatching = [] } = useContinueWatching();

  // Randomly pick a trending hero banner on initial load
  const featuredHeroMovie = useMemo(() => {
    const list = trendingData?.results || [];
    if (list.length === 0) return null;
    return list[Math.floor(Math.random() * list.length)];
  }, [trendingData]);

  return (
    <div className="min-h-screen bg-[#141414] pb-20">
      <Navbar />

      {/* Hero Showcase Banner */}
      <Hero
        movie={featuredHeroMovie}
        isLoading={isTrendingLoading}
        onSelect={setSelectedMovie}
      />

      {/* Rows Container (Negative margin pulls first row over the hero gradient) */}
      <div className="-mt-12 sm:-mt-16 md:-mt-24 relative z-30 space-y-6">
        {/* Continue Watching Rail (Dynamic) */}
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

        {/* Top Rated */}
        <Row
          title="Top Rated on StreamVerse"
          movies={topRatedData?.results}
          isLoading={isTopRatedLoading}
          onSelect={setSelectedMovie}
        />

        {/* Popular */}
        <Row
          title="Popular Movies"
          movies={popularData?.results}
          isLoading={isPopularLoading}
          onSelect={setSelectedMovie}
        />

        {/* Action Thrillers */}
        <Row
          title="Action & Adventure"
          movies={actionData?.results}
          isLoading={isActionLoading}
          onSelect={setSelectedMovie}
        />

        {/* Sci-Fi */}
        <Row
          title="Sci-Fi & Cyberpunk"
          movies={scifiData?.results}
          isLoading={isScifiLoading}
          onSelect={setSelectedMovie}
        />
      </div>

      {/* Details Modal */}
      {selectedMovie && (
        <DetailsModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}

      {/* Production Footer with TMDB Attribution Line */}
      <footer className="mt-20 border-t border-neutral-800 px-6 sm:px-16 py-10 text-center text-xs text-neutral-500">
        <p className="mb-2">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
        <p>© 2026 StreamVerse Inc. Built for Engineering Portfolio Demonstration.</p>
      </footer>
    </div>
  );
};

export default Home;
