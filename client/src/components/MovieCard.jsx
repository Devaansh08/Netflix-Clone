/**
 * @file MovieCard.jsx
 * @description Interactive poster card featuring lazy loading, hover expansions, and quick-action triggers.
 * 
 * DATA FLOW:
 * [User interacts with MovieCard]
 *      │
 *      ├──► Click Card / Info ──► Triggers `onSelect(movie)` (opens DetailsModal)
 *      ├──► Click Play ─────────► Navigates to `/watch/${movie.id}`
 *      └──► Click +/- List ─────► Fires `useAddToListMutation` / `useRemoveFromListMutation`
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Image Optimization & Bandwidth:
 *    Posters use TMDB's `w500` or `w342` dimension buckets rather than `original`. Downloading 4K backdrops
 *    for 100 small cards would consume hundreds of megabytes of cellular data and freeze low-end devices.
 * 2. Native Lazy Loading (`loading="lazy"`):
 *    Browsers only load image assets when they scroll near the viewport, saving network bandwidth.
 * 3. Optimistic List Updates:
 *    Clicking the watchlist icon instantly updates visual state while mutations persist in the background.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Play, Plus, Check, Info, Star } from 'lucide-react';
import { useMyList, useAddToListMutation, useRemoveFromListMutation } from '../api/movieQueries.js';
import api from '../api/axios.js';

export const MovieCard = ({ movie, onSelect }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: myList = [] } = useMyList();
  const addToList = useAddToListMutation();
  const removeFromList = useRemoveFromListMutation();

  const isSavedInList = myList.some((item) => item.tmdbId === movie.id);

  /**
   * Hover Prefetch Optimization:
   * During the 200ms perceptual gap between mouse hover and click, prefetch
   * movie details and trailer keys into React Query cache so the modal opens with 0ms lag.
   */
  const handleMouseEnter = () => {
    if (!movie?.id) return;
    queryClient.prefetchQuery({
      queryKey: ['movie', 'details', movie.id],
      queryFn: async () => {
        const { data } = await api.get(`/movies/${movie.id}`);
        return data.movie;
      },
      staleTime: 10 * 60 * 1000
    });
    queryClient.prefetchQuery({
      queryKey: ['movie', 'videos', movie.id],
      queryFn: async () => {
        const { data } = await api.get(`/movies/${movie.id}/videos`);
        return data;
      },
      staleTime: 10 * 60 * 1000
    });
  };

  const handleToggleList = (e) => {
    e.stopPropagation();
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

  const handlePlay = (e) => {
    e.stopPropagation();
    navigate(`/watch/${movie.id}`, { state: { movie } });
  };

  return (
    <div
      onClick={() => onSelect && onSelect(movie)}
      onMouseEnter={handleMouseEnter}
      className="group relative flex-shrink-0 cursor-pointer overflow-hidden rounded-md bg-neutral-900 transition-all duration-300 ease-out hover:z-20 hover:scale-105 hover:shadow-2xl hover:shadow-black/80 w-32 sm:w-40 md:w-48"
    >
      {/* Poster Image */}
      <div className="aspect-[2/3] w-full overflow-hidden bg-neutral-800">
        {movie.posterPath ? (
          <img
            src={movie.posterPath}
            alt={movie.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:brightness-90"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center text-xs text-neutral-400">
            <span>{movie.title}</span>
          </div>
        )}
      </div>

      {/* Hover Overlay with Quick Actions */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black via-black/40 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <h4 className="line-clamp-1 text-xs md:text-sm font-bold text-white drop-shadow">
          {movie.title}
        </h4>

        {/* Rating & Release Year */}
        <div className="mt-1 flex items-center gap-2 text-[10px] md:text-xs text-neutral-300">
          <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
            <Star className="h-3 w-3 fill-current" />
            {movie.rating > 0 ? movie.rating : 'NR'}
          </span>
          {movie.releaseDate && (
            <span>{new Date(movie.releaseDate).getFullYear()}</span>
          )}
        </div>

        {/* Quick Action Button Group */}
        <div className="mt-2.5 flex items-center gap-2">
          {/* Play Button */}
          <button
            onClick={handlePlay}
            aria-label={`Play ${movie.title}`}
            className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-110 hover:bg-neutral-200"
          >
            <Play className="h-3.5 w-3.5 md:h-4 md:w-4 fill-current ml-0.5" />
          </button>

          {/* Add / Remove from My List */}
          <button
            onClick={handleToggleList}
            aria-label={isSavedInList ? 'Remove from My List' : 'Add to My List'}
            className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full border border-neutral-400 bg-neutral-900/80 text-white transition-transform hover:scale-110 hover:border-white hover:bg-neutral-800"
          >
            {isSavedInList ? (
              <Check className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-400" />
            ) : (
              <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
            )}
          </button>

          {/* More Info Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect && onSelect(movie);
            }}
            aria-label={`More details for ${movie.title}`}
            className="ml-auto flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full border border-neutral-400 bg-neutral-900/80 text-white transition-transform hover:scale-110 hover:border-white hover:bg-neutral-800"
          >
            <Info className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
