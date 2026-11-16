/**
 * @file MovieCard.jsx
 * @description High-performance streaming cinema card featuring smooth hover elevation,
 * debounced video preview streaming, responsive iOS/spatial glass pop-up drawer,
 * match percentage, and seamless user interaction (Play, Wishlist, Like, Details).
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Play, 
  Plus, 
  Check, 
  Info, 
  Star, 
  Volume2, 
  VolumeX, 
  ThumbsUp, 
  Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useMyList, useAddToListMutation, useRemoveFromListMutation } from '../api/movieQueries.js';
import SafeImage from './SafeImage.jsx';
import api from '../api/axios.js';

export const MovieCard = ({ movie, onSelect, rankNumber = null }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: myList = [] } = useMyList();
  const addToList = useAddToListMutation();
  const removeFromList = useRemoveFromListMutation();

  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [streamProgress, setStreamProgress] = useState(0);
  const [allowAutoplay, setAllowAutoplay] = useState(true);

  const cardRef = useRef(null);
  const videoRef = useRef(null);
  const hoverTimerRef = useRef(null);
  const prefetchTimerRef = useRef(null);

  const isSavedInList = myList.some((item) => item.tmdbId === movie.id);

  // Dynamic match percentage
  const matchPercentage = Math.min(99, Math.max(85, Math.round((movie.rating || 8.0) * 11 + 3)));

  // Load autoplay preference from settings
  useEffect(() => {
    const checkSetting = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('streamverse_settings') || '{}');
        setAllowAutoplay(saved.autoplayPreviews !== false);
      } catch {
        setAllowAutoplay(true);
      }
    };
    checkSetting();

    const onSettingsChange = (e) => {
      if (e.detail?.autoplayPreviews !== undefined) {
        setAllowAutoplay(e.detail.autoplayPreviews);
      }
    };
    window.addEventListener('streamverse_settings_changed', onSettingsChange);
    return () => window.removeEventListener('streamverse_settings_changed', onSettingsChange);
  }, []);

  /**
   * Mobile and Tablet Auto-Play Preview:
   * Uses IntersectionObserver only on touchscreens when card is in the center viewport.
   */
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (!isMobile || !cardRef.current || !allowAutoplay) return;

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
  }, [allowAutoplay]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (prefetchTimerRef.current) clearTimeout(prefetchTimerRef.current);
    };
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setStreamProgress(progress);
    }
  };

  /**
   * Debounced Mouse Enter:
   * - 180ms delay before prefetching details (prevents network flood during fast scrolling)
   * - 380ms delay before starting video stream (ensures user actually stopped to hover)
   */
  const handleMouseEnter = () => {
    if (prefetchTimerRef.current) clearTimeout(prefetchTimerRef.current);
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);

    // 1. Debounced Prefetch
    prefetchTimerRef.current = setTimeout(() => {
      if (movie?.id) {
        queryClient.prefetchQuery({
          queryKey: ['movie', 'details', movie.id],
          queryFn: async () => {
            const { data } = await api.get(`/movies/${movie.id}`);
            return data.movie;
          },
          staleTime: 10 * 60 * 1000
        });
      }
    }, 180);

    // 2. Debounced Video Preview (only if user enabled autoplay in settings)
    if (allowAutoplay && (movie?.videoClipUrl || movie?.trailerKey)) {
      hoverTimerRef.current = setTimeout(() => {
        setIsPlayingPreview(true);
      }, 380);
    }
  };

  const handleMouseLeave = () => {
    if (prefetchTimerRef.current) clearTimeout(prefetchTimerRef.current);
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setIsPlayingPreview(false);
    setStreamProgress(0);
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
          message: 'Please sign in or create an account to watch full movies and videos on Netflix.'
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

  const handleToggleLike = (e) => {
    e.stopPropagation();
    setIsLiked((prev) => !prev);
  };

  return (
    <div
      ref={cardRef}
      onClick={() => onSelect && onSelect(movie)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative flex-shrink-0 cursor-pointer overflow-visible rounded-2xl w-36 sm:w-44 md:w-52 select-none will-change-transform transform-gpu transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-3 hover:z-40"
    >
      {/* Optional Top 10 Giant Rank Number */}
      {rankNumber && (
        <span className="absolute -left-5 -bottom-2 z-0 font-black text-7xl sm:text-8xl tracking-tighter text-neutral-800 drop-shadow select-none pointer-events-none group-hover:text-red-600/30 transition-colors duration-300">
          {rankNumber}
        </span>
      )}

      {/* Main Card Body with Smooth Scaling and Deep Shadow */}
      <div className="relative z-10 overflow-hidden rounded-2xl bg-neutral-900/95 ring-1 ring-white/10 shadow-lg shadow-black/80 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.05] group-hover:ring-white/35 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.95)]">
        
        {/* Sliding Glass Sheen Light Reflection */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none z-30" />

        {/* Top Badges: Rating, 18+ Mature, Live Preview */}
        <div className="absolute top-2 left-2 right-2 z-30 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1">
            {isPlayingPreview ? (
              <span className="flex items-center gap-1 rounded-full bg-red-600/90 backdrop-blur-md px-2 py-0.5 text-[9px] font-black uppercase text-white shadow-lg animate-pulse">
                <Radio className="h-2.5 w-2.5" />
                Live Clip
              </span>
            ) : (
              movie.rating > 0 && (
                <span className="flex items-center gap-0.5 rounded-full bg-black/75 backdrop-blur-md px-1.5 py-0.5 text-[10px] font-bold text-amber-400 border border-white/10 shadow">
                  <Star className="h-2.5 w-2.5 fill-current" />
                  {movie.rating}
                </span>
              )
            )}

            {/* 18+ Mature Content Badge */}
            {movie.is18Plus && (
              <span className="rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-black uppercase text-white shadow-sm border border-red-500/50">
                18+
              </span>
            )}

            {/* TV Series Badge */}
            {movie.mediaType === 'tv' && (
              <span className="rounded bg-neutral-900/90 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-neutral-200 border border-white/20 shadow-sm">
                TV
              </span>
            )}
          </div>

          {/* Audio Language Badge */}
          {movie.originalLanguage && (
            <span className="rounded-full bg-black/75 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-neutral-200 border border-white/10 shadow">
              {movie.originalLanguage}
            </span>
          )}
        </div>

        {/* Media Container: Static Poster OR Streamed Video Clip */}
        <div className="aspect-[2/3] w-full overflow-hidden bg-neutral-950 relative">
          {isPlayingPreview && (movie.videoClipUrl || movie.trailerKey) ? (
            <div className="h-full w-full relative">
              {movie.videoClipUrl ? (
                <video
                  ref={videoRef}
                  src={movie.videoClipUrl}
                  autoPlay
                  playsInline
                  muted={isMuted}
                  loop
                  onTimeUpdate={handleTimeUpdate}
                  className="h-full w-full object-cover animate-in fade-in duration-300"
                />
              ) : (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${movie.trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${movie.trailerKey}&playsinline=1&modestbranding=1&rel=0`}
                  title={movie.title}
                  loading="lazy"
                  allow="autoplay; encrypted-media"
                  className="h-full w-full pointer-events-none scale-150 object-cover"
                />
              )}

              {/* Streaming Video Playback Progress Line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60 z-20">
                <div 
                  className="h-full bg-[#E50914] transition-all duration-150"
                  style={{ width: `${streamProgress || 40}%` }}
                />
              </div>

              {/* Interactive Audio Toggle on the Video Stream */}
              <button
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute preview stream' : 'Mute preview stream'}
                className="absolute bottom-3 right-2.5 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-black/80 text-white backdrop-blur-md hover:bg-red-600 hover:scale-110 active:scale-95 transition-all shadow-lg cursor-pointer"
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-red-400" />}
              </button>
            </div>
          ) : (
            <SafeImage
              src={movie.posterPath}
              alt={movie.title}
              fallbackTitle={movie.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:brightness-90"
            />
          )}
        </div>

        {/* Bottom Pop-Up Drawer with Smooth Slide Transition */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end bg-gradient-to-t from-black via-black/95 to-transparent pt-12 pb-3 px-3 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out z-30 pointer-events-auto">
          <h4 className="line-clamp-1 text-xs md:text-sm font-black text-white drop-shadow tracking-tight">
            {movie.title}
          </h4>

          {/* Metadata Specs: Match % • Maturity • 4K UHD */}
          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-neutral-300 flex-wrap">
            <span className="font-bold text-green-400">{matchPercentage}% Match</span>
            {movie.mediaType === 'tv' ? (
              <span className="rounded bg-red-600/30 border border-red-500/50 px-1 py-0.2 text-[8px] font-bold text-red-300 uppercase">
                {movie.seasons ? `${movie.seasons}S` : 'TV'}
              </span>
            ) : (
              <span className="rounded border border-neutral-600 px-1 py-0.2 text-[8px] font-semibold text-neutral-300">
                {movie.maturityRating || 'PG-13'}
              </span>
            )}
            <span className="rounded border border-white/20 px-1 py-0.2 text-[8px] font-bold text-neutral-400">
              4K UHD
            </span>
          </div>

          {/* Quick Action Button Group */}
          <div className="mt-2.5 flex items-center gap-1.5">
            {/* Play Button */}
            <button
              onClick={handlePlay}
              aria-label={`Play ${movie.title}`}
              title="Play Full Movie"
              className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-white text-black transition-all hover:scale-115 active:scale-95 shadow-md shadow-white/20 cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 md:h-4 md:w-4 fill-current ml-0.5" />
            </button>

            {/* Add / Remove from My List */}
            <button
              onClick={handleToggleList}
              aria-label={isSavedInList ? 'Remove from My List' : 'Add to My List'}
              title={isSavedInList ? 'Saved in My List' : 'Add to My List'}
              className={`flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full border transition-all hover:scale-115 active:scale-95 shadow-md cursor-pointer ${
                isSavedInList 
                  ? 'border-green-500 bg-green-950/60 text-green-300' 
                  : 'border-white/30 bg-black/60 text-white hover:border-white hover:bg-white/20'
              }`}
            >
              {isSavedInList ? (
                <Check className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-400" />
              ) : (
                <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
              )}
            </button>

            {/* Like / Thumbs Up Reaction */}
            <button
              onClick={handleToggleLike}
              aria-label="Rate title"
              title={isLiked ? 'Liked' : 'Rate this title'}
              className={`flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full border transition-all hover:scale-115 active:scale-95 shadow-md cursor-pointer ${
                isLiked 
                  ? 'border-red-500 bg-red-950/60 text-red-400' 
                  : 'border-white/30 bg-black/60 text-white hover:border-white hover:bg-white/20'
              }`}
            >
              <ThumbsUp className={`h-3 w-3 md:h-3.5 md:w-3.5 ${isLiked ? 'fill-current' : ''}`} />
            </button>

            {/* Details Modal Opener */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect && onSelect(movie);
              }}
              aria-label={`More details for ${movie.title}`}
              title="More Details & Trailer"
              className="ml-auto flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full border border-white/30 bg-black/60 text-white transition-all hover:scale-115 hover:border-white hover:bg-white/20 active:scale-95 shadow-md cursor-pointer"
            >
              <Info className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
