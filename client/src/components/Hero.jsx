/**
 * @file Hero.jsx
 * @description Cinematic full-width hero billboard displaying featured trending media with actions.
 * 
 * DATA FLOW:
 * [Home Page] ──► Supplies `movie` (randomly selected from trending feed)
 *      │
 *      ▼
 * [Hero Component]
 *      │
 *      ├──► "Play" Button ─────► Navigates to `/watch/${movie.id}`
 *      ├──► "More Info" Button ──► Dispatches `onSelect(movie)` to open DetailsModal
 *      └──► "+ My List" Button ──► Updates user watchlist
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Visual Hierarchy & Contrast:
 *    Dual gradient vignettes (`banner-vignette` at bottom, `banner-left-fade` at left) guarantee text
 *    readability regardless of high-contrast or light-colored movie backdrops.
 * 2. Bandwidth Intelligence:
 *    Uses high-resolution backdrop (`original` or `w1280`) specifically for the single hero banner,
 *    reserving smaller dimensions for cards.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info, Plus, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useMyList, useAddToListMutation, useRemoveFromListMutation } from '../api/movieQueries.js';
import { HeroSkeleton } from './Skeleton.jsx';

export const Hero = ({ movie, isLoading, onSelect }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: myList = [] } = useMyList();
  const addToList = useAddToListMutation();
  const removeFromList = useRemoveFromListMutation();

  if (isLoading || !movie) {
    return <HeroSkeleton />;
  }

  const isSavedInList = myList.some((item) => item.tmdbId === movie.id);

  const handlePlay = () => {
    if (!user) {
      navigate('/login', {
        state: {
          from: { pathname: `/watch/${movie.id}` },
          message: 'Please sign in or create an account to watch full movies and videos on StreamVerse.'
        }
      });
      return;
    }
    navigate(`/watch/${movie.id}`, { state: { movie } });
  };

  const handleToggleList = () => {
    if (!user) {
      navigate('/login', {
        state: {
          from: { pathname: '/' },
          message: 'Please sign in to save titles to your personal My List.'
        }
      });
      return;
    }
    if (isSavedInList) {
      removeFromList.mutate(movie.id);
    } else {
      addToList.mutate({
        tmdbId: movie.id,
        mediaType: movie.mediaType || 'movie',
        title: movie.title,
        posterPath: movie.posterPath
      });
    }
  };

  return (
    <div className="relative h-[65vh] sm:h-[75vh] md:h-[85vh] w-full select-none overflow-hidden">
      {/* Background Backdrop Image */}
      {movie.backdropPath ? (
        <img
          src={movie.backdropPath}
          alt={movie.title}
          className="h-full w-full object-cover object-top"
          fetchPriority="high"
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-r from-neutral-900 to-black" />
      )}

      {/* Cinematic Vignettes for Optimal Readability */}
      <div className="banner-left-fade absolute inset-0" />
      <div className="banner-vignette absolute inset-0" />

      {/* Content Meta Container */}
      <div className="absolute bottom-16 sm:bottom-20 left-4 sm:left-8 md:left-16 z-20 max-w-xl md:max-w-2xl space-y-3 sm:space-y-4">
        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg">
          {movie.title}
        </h1>

        {/* Overview Clamped */}
        <p className="line-clamp-3 text-xs sm:text-sm md:text-base font-normal text-neutral-200 drop-shadow">
          {movie.overview}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Play Button */}
          <button
            onClick={handlePlay}
            className="flex items-center gap-2 rounded bg-white px-5 sm:px-7 py-2 sm:py-2.5 text-sm sm:text-base font-bold text-black transition-colors hover:bg-neutral-300"
          >
            <Play className="h-5 w-5 fill-current" />
            Play
          </button>

          {/* More Info Button */}
          <button
            onClick={() => onSelect && onSelect(movie)}
            className="flex items-center gap-2 rounded bg-neutral-600/70 px-5 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-neutral-600/90"
          >
            <Info className="h-5 w-5" />
            More Info
          </button>

          {/* Watchlist Toggle Button */}
          <button
            onClick={handleToggleList}
            aria-label={isSavedInList ? 'Remove from My List' : 'Add to My List'}
            className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-neutral-400 bg-neutral-900/60 text-white backdrop-blur-sm transition-transform hover:scale-110 hover:border-white"
          >
            {isSavedInList ? (
              <Check className="h-5 w-5 text-green-400" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
