/**
 * @file MovieCard.jsx
 * @description Advanced streaming cinema card featuring instant hover video streaming, 
 * live progress scrubber, audio mute toggle, thumbs-up reaction, and resilient image loading.
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Instant Video Streaming on Hover:
 *    Simulates the signature Netflix desktop hover experience: after a 200ms debounce, 
 *    the static poster smoothly crossfades into a live streaming video clip with an active
 *    playback progress bar and interactive audio toggle.
 * 2. Mobile & Tablet Auto-Play via IntersectionObserver:
 *    Because touchscreens lack hover events, an IntersectionObserver monitors when the card
 *    enters the active central viewport and initiates muted video playback automatically.
 * 3. Defensive Image Engineering (`<SafeImage />`):
 *    Guarantees every poster and cover renders without broken image icons or layout shift.
 * 4. User Interaction & Engagement:
 *    Includes quick Play, My List bookmarking, and Thumbs Up rating toggles directly from the card.
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
  ShieldAlert, 
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

  const cardRef = useRef(null);
  const videoRef = useRef(null);
  const hoverTimerRef = useRef(null);

  const isSavedInList = myList.some((item) => item.tmdbId === movie.id);

  // Calculate dynamic match percentage based on vote rating
  const matchPercentage = Math.min(99, Math.max(85, Math.round((movie.rating || 8.0) * 11 + 3)));

  /**
   * Mobile and Tablet Auto-Play Preview:
   * Uses IntersectionObserver to auto-stream the video clip when the card enters the central viewport on mobile.
   */
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (!isMobile || !cardRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.75) {
            setIsPlayingPreview(true);
          } else {
            setIsPlayingPreview(false);
          }
        });
      },
      { threshold: 0.75 }
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  /**
   * Video Time Update for Live Streaming Progress Scrubber
   */
  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setStreamProgress(progress);
    }
  };

  /**
   * Hover Handlers for Desktop
   */
  const handleMouseEnter = () => {
    // 1. Prefetch query data for instant modal load
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

    // 2. Delay video stream start by 220ms to allow smooth browsing without video thrashing
    hoverTimerRef.current = setTimeout(() => {
      setIsPlayingPreview(true);
    }, 220);
  };

  const handleMouseLeave = () => {
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
      className="group relative flex-shrink-0 cursor-pointer overflow-visible rounded-xl transition-all duration-300 ease-out w-36 sm:w-44 md:w-52 select-none"
    >
      {/* Optional Top 10 Giant Rank Number */}
      {rankNumber && (
        <span className="absolute -left-5 -bottom-2 z-0 font-black text-7xl sm:text-8xl tracking-tighter text-neutral-800 drop-shadow select-none pointer-events-none group-hover:text-red-600/30 transition-colors duration-300">
          {rankNumber}
        </span>
      )}

      {/* Main Card Body */}
      <div className="relative z-10 overflow-hidden rounded-xl bg-neutral-900 shadow-md ring-1 ring-white/10 transition-all duration-300 group-hover:z-40 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-black group-hover:ring-white/30">
        
        {/* Top Badges: Rating, 18+ Mature, Live Streaming Pulse */}
        <div className="absolute top-2 left-2 right-2 z-30 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1">
            {/* Live Streaming Indicator when playing preview */}
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
          {isPlayingPreview && movie.videoClipUrl ? (
            <div className="h-full w-full relative">
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

              {/* Streaming Video Playback Progress Line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60 z-20">
                <div 
                  className="h-full bg-[#E50914] transition-all duration-150"
                  style={{ width: `${streamProgress}%` }}
                />
              </div>

              {/* Interactive Audio Toggle on the Video Stream */}
              <button
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute preview stream' : 'Mute preview stream'}
                className="absolute bottom-3 right-2.5 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-black/80 text-white backdrop-blur-md hover:bg-red-600 hover:scale-110 active:scale-95 transition-all shadow-lg"
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

        {/* Bottom Hover Drawer with Metadata and Quick Action Controls */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end bg-gradient-to-t from-black via-black/85 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-30">
          <h4 className="line-clamp-1 text-xs md:text-sm font-bold text-white drop-shadow">
            {movie.title}
          </h4>

          {/* Metadata Specs: Match % • Maturity • 4K UHD */}
          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-neutral-300">
            <span className="font-bold text-green-400">{matchPercentage}% Match</span>
            <span className="rounded border border-neutral-600 px-1 py-0.2 text-[8px] font-semibold text-neutral-300">
              {movie.maturityRating || 'PG-13'}
            </span>
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
              className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-110 active:scale-90 shadow-md cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 md:h-4 md:w-4 fill-current ml-0.5" />
            </button>

            {/* Add / Remove from My List */}
            <button
              onClick={handleToggleList}
              aria-label={isSavedInList ? 'Remove from My List' : 'Add to My List'}
              title={isSavedInList ? 'Saved in My List' : 'Add to My List'}
              className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full border border-neutral-500 bg-neutral-900/90 text-white transition-all hover:scale-110 hover:border-white active:scale-90 shadow-md cursor-pointer"
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
              className={`flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full border border-neutral-500 bg-neutral-900/90 text-white transition-all hover:scale-110 hover:border-white active:scale-90 shadow-md cursor-pointer ${
                isLiked ? 'text-red-500 border-red-500 bg-red-950/40' : ''
              }`}
            >
              <ThumbsUp className={`h-3 w-3 md:h-3.5 md:w-3.5 ${isLiked ? 'fill-current text-red-500' : ''}`} />
            </button>

            {/* Details Modal Opener */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect && onSelect(movie);
              }}
              aria-label={`More details for ${movie.title}`}
              title="More Details & Trailer"
              className="ml-auto flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full border border-neutral-500 bg-neutral-900/90 text-white transition-all hover:scale-110 hover:border-white active:scale-90 shadow-md cursor-pointer"
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
