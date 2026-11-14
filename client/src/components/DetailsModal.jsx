/**
 * @file DetailsModal.jsx
 * @description Rich media modal displaying full synopsis, genres, rating, and embedded YouTube trailer.
 * 
 * DATA FLOW:
 * [User selects MovieCard] ──► Opens `<DetailsModal movie={selectedMovie} />`
 *      │
 *      ├──► Calls `useMovieDetails(id)` ──► Enriches with runtime, status, tagline
 *      ├──► Calls `useMovieVideos(id)`  ──► Fetches official YouTube trailer key
 *      └──► Embeds YouTube iframe with autoplay and mute parameters
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Safe YouTube Embed:
 *    Embeds YouTube trailers using `https://www.youtube-nocookie.com/embed/...` to respect user privacy,
 *    preventing third-party tracking cookies.
 * 2. Fallback Handling:
 *    If no trailer is published on TMDB for an obscure title, cleanly displays high-res backdrop banner
 *    without throwing broken iframe errors.
 * 3. Keyboard Accessibility:
 *    Listens for `Escape` key press to instantly dismiss the modal.
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Play, Plus, Check, Star, Calendar, Clock } from 'lucide-react';
import { useMovieDetails, useMovieVideos, useMyList, useAddToListMutation, useRemoveFromListMutation } from '../api/movieQueries.js';

export const DetailsModal = ({ movie, onClose }) => {
  const navigate = useNavigate();
  const { data: details } = useMovieDetails(movie?.id);
  const { data: videoData, isLoading: isVideoLoading } = useMovieVideos(movie?.id);
  const { data: myList = [] } = useMyList();
  const addToList = useAddToListMutation();
  const removeFromList = useRemoveFromListMutation();

  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!movie) return null;

  const isSavedInList = myList.some((item) => item.tmdbId === movie.id);
  const trailerKey = videoData?.trailerKey;

  const handlePlay = () => {
    onClose();
    navigate(`/watch/${movie.id}`, { state: { movie } });
  };

  const handleToggleList = () => {
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
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6 overflow-y-auto backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl overflow-hidden rounded-lg bg-[#181818] shadow-2xl ring-1 ring-neutral-700 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-4 top-4 z-40 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900/90 text-white transition-colors hover:bg-neutral-800"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Video Trailer / Hero Backdrop Header */}
        <div className="relative aspect-video w-full bg-black">
          {trailerKey ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0`}
              title={`${movie.title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full border-0"
            />
          ) : movie.backdropPath ? (
            <img
              src={movie.backdropPath}
              alt={movie.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-500">
              <span>No preview available</span>
            </div>
          )}

          {/* Vignette bottom shadow */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#181818] to-transparent" />
        </div>

        {/* Modal Content Body */}
        <div className="space-y-4 px-6 sm:px-8 pb-8 pt-2">
          {/* Action Row */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlay}
              className="flex items-center gap-2 rounded bg-white px-6 py-2 font-bold text-black transition-colors hover:bg-neutral-300"
            >
              <Play className="h-5 w-5 fill-current" />
              Play
            </button>

            <button
              onClick={handleToggleList}
              aria-label={isSavedInList ? 'Remove from My List' : 'Add to My List'}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-400 bg-neutral-900/80 text-white transition-transform hover:scale-110 hover:border-white"
            >
              {isSavedInList ? (
                <Check className="h-5 w-5 text-green-400" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Title & Metadata */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {movie.title}
            </h2>
            {details?.tagline && (
              <p className="italic text-xs sm:text-sm text-neutral-400 mt-0.5">
                "{details.tagline}"
              </p>
            )}
          </div>

          {/* Meta Tags Row */}
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-neutral-300">
            {movie.rating > 0 && (
              <span className="flex items-center gap-1 font-bold text-amber-400">
                <Star className="h-4 w-4 fill-current" />
                {movie.rating} / 10
              </span>
            )}
            {movie.releaseDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-neutral-400" />
                {new Date(movie.releaseDate).getFullYear()}
              </span>
            )}
            {details?.runtime && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-neutral-400" />
                {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
              </span>
            )}
            <span className="rounded border border-neutral-600 px-1.5 py-0.5 text-[10px] uppercase font-bold text-neutral-300">
              HD
            </span>
          </div>

          {/* Synopsis */}
          <p className="text-sm sm:text-base leading-relaxed text-neutral-300">
            {movie.overview || 'No synopsis available for this title.'}
          </p>

          {/* Genres Badges */}
          {movie.genres && movie.genres.length > 0 && (
            <div className="pt-2">
              <span className="text-xs font-semibold text-neutral-400">Genres: </span>
              <span className="text-xs sm:text-sm text-neutral-200">
                {movie.genres.join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailsModal;
