/**
 * @file MovieCard.jsx
 * @description Interactive poster card with instant hover video clips, mobile auto-play previews, and 18+ policy badges.
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & USER EXPERIENCE:
 * 1. Desktop Hover Video Clips:
 *    Hovering over any card triggers an instant, muted micro-video preview of the film with smooth crossfade.
 * 2. Mobile & Tablet Auto-Play via IntersectionObserver:
 *    Because mobile devices do not have pointer hovers, cards scrolled into the central viewport
 *    automatically play short video previews, delivering a native iOS Netflix app experience.
 * 3. 18+ Content Rating Enforcement:
 *    Explicitly marks mature/adult content with a bold `18+` crimson pill badge for parental awareness.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Play, Plus, Check, Info, Star, Volume2, VolumeX, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useMyList, useAddToListMutation, useRemoveFromListMutation } from '../api/movieQueries.js';
import api from '../api/axios.js';

export const MovieCard = ({ movie, onSelect }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: myList = [] } = useMyList();
  const addToList = useAddToListMutation();
  const removeFromList = useRemoveFromListMutation();

  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const cardRef = useRef(null);
  const videoRef = useRef(null);
  const hoverTimerRef = useRef(null);

  const isSavedInList = myList.some((item) => item.tmdbId === movie.id);

  /**
   * Mobile and Tablet Auto-Play Preview:
   * Uses IntersectionObserver to auto-play the video clip when the card enters the central viewport on mobile.
   */
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (!isMobile || !cardRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.8) {
            setIsPlayingPreview(true);
          } else {
            setIsPlayingPreview(false);
          }
        });
      },
      { threshold: 0.8 }
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  /**
   * Hover Handlers for Desktop
   */
  const handleMouseEnter = () => {
    // 1. Prefetch query data
    if (movie?.id) {
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
    }

    // 2. Delay video preview start by 350ms to prevent accidental triggers while fast-scrolling
    hoverTimerRef.current = setTimeout(() => {
      setIsPlayingPreview(true);
    }, 350);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setIsPlayingPreview(false);
  };

  const handleToggleList = (e) => {
    e.stopPropagation();
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

  const handlePlay = (e) => {
    e.stopPropagation();
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

  const toggleMute = (e) => {
    e.stopPropagation();
    setIsMuted((prev) => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  return (
    <div
      ref={cardRef}
      onClick={() => onSelect && onSelect(movie)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative flex-shrink-0 cursor-pointer overflow-hidden rounded-xl bg-neutral-900 shadow-md ring-1 ring-white/10 transition-all duration-300 ease-out hover:z-30 hover:scale-105 active:scale-95 hover:shadow-2xl hover:shadow-black/90 hover:ring-white/30 w-32 sm:w-40 md:w-48 select-none"
    >
      {/* Top Corner Badges (Rating, 18+ Mature Rating, Audio Language) */}
      <div className="absolute top-2 left-2 right-2 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1">
          {movie.rating > 0 && (
            <span className="flex items-center gap-0.5 rounded-full bg-black/75 backdrop-blur-md px-1.5 py-0.5 text-[10px] font-bold text-amber-400 border border-white/10 shadow">
              <Star className="h-2.5 w-2.5 fill-current" />
              {movie.rating}
            </span>
          )}

          {/* 18+ Content Badge */}
          {movie.is18Plus && (
            <span className="rounded bg-red-600/95 px-1.5 py-0.5 text-[9px] font-black uppercase text-white shadow-sm border border-red-500/50">
              18+
            </span>
          )}
        </div>

        {movie.originalLanguage && (
          <span className="rounded-full bg-black/75 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-neutral-200 border border-white/10 shadow">
            {movie.originalLanguage}
          </span>
        )}
      </div>

      {/* Media Container: Static Poster OR Live Preview Video */}
      <div className="aspect-[2/3] w-full overflow-hidden bg-neutral-800 relative">
        {isPlayingPreview && movie.videoClipUrl ? (
          <div className="h-full w-full relative">
            <video
              ref={videoRef}
              src={movie.videoClipUrl}
              autoPlay
              playsInline
              muted={isMuted}
              loop
              className="h-full w-full object-cover animate-in fade-in duration-300"
            />
            {/* Audio Toggle in Video Preview */}
            <button
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute preview clip' : 'Mute preview clip'}
              className="absolute bottom-2 right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-md hover:bg-black"
            >
              {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        ) : movie.posterPath ? (
          <img
            src={movie.posterPath}
            alt={movie.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:brightness-90"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center text-xs text-neutral-400">
            <span>{movie.title}</span>
          </div>
        )}
      </div>

      {/* Hover Actions Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black via-black/60 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-20">
        <h4 className="line-clamp-1 text-xs md:text-sm font-bold text-white drop-shadow">
          {movie.title}
        </h4>

        {/* Advisory / Rating Meta */}
        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-neutral-300">
          <span className="font-semibold text-neutral-300">{movie.maturityRating || 'PG-13'}</span>
          <span>•</span>
          <span className="truncate">{movie.genres?.[0] || movie.languageLabel}</span>
        </div>

        {/* Quick Action Button Group */}
        <div className="mt-2.5 flex items-center gap-2">
          {/* Play Button */}
          <button
            onClick={handlePlay}
            aria-label={`Play ${movie.title}`}
            className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-110 active:scale-90"
          >
            <Play className="h-3.5 w-3.5 md:h-4 md:w-4 fill-current ml-0.5" />
          </button>

          {/* Add / Remove from My List */}
          <button
            onClick={handleToggleList}
            aria-label={isSavedInList ? 'Remove from My List' : 'Add to My List'}
            className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full border border-neutral-400 bg-neutral-900/80 text-white transition-transform hover:scale-110 hover:border-white active:scale-90"
          >
            {isSavedInList ? (
              <Check className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-400" />
            ) : (
              <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
            )}
          </button>

          {/* More Info */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect && onSelect(movie);
            }}
            aria-label={`More details for ${movie.title}`}
            className="ml-auto flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full border border-neutral-400 bg-neutral-900/80 text-white transition-transform hover:scale-110 hover:border-white active:scale-90"
          >
            <Info className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
