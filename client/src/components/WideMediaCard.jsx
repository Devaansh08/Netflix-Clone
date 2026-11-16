/**
 * @file WideMediaCard.jsx
 * @description Widescreen landscape media card matching the Apple VisionOS / Netflix TV UI.
 * Features debounced hover preview video clips, progress bar for continue watching,
 * fast action controls, and GPU-accelerated hover physics.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Plus, 
  Check, 
  MoreVertical, 
  Star, 
  Volume2, 
  VolumeX,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useMyList, useAddToListMutation, useRemoveFromListMutation } from '../api/movieQueries.js';
import SafeImage from './SafeImage.jsx';

export const WideMediaCard = ({ 
  movie, 
  onSelect, 
  progressPercent = null, 
  remainingTime = null 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: myList = [] } = useMyList();
  const addToList = useAddToListMutation();
  const removeFromList = useRemoveFromListMutation();

  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [allowAutoplay, setAllowAutoplay] = useState(true);

  const videoRef = useRef(null);
  const hoverTimerRef = useRef(null);
  const menuRef = useRef(null);

  const isSavedInList = myList.some((item) => item.tmdbId === movie.id);

  // Sync with user settings
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

  // Dismiss menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (allowAutoplay && (movie?.videoClipUrl || movie?.trailerKey)) {
      hoverTimerRef.current = setTimeout(() => {
        setIsPlayingPreview(true);
      }, 380);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setIsPlayingPreview(false);
    setShowMenu(false);
  };

  const handlePlay = (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login', {
        state: {
          from: { pathname: `/watch/${movie.id}` },
          message: `Please sign in or create an account to stream ${movie.title}.`
        }
      });
      return;
    }
    navigate(`/watch/${movie.id}`, { state: { movie } });
  };

  const handleToggleList = (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login', {
        state: {
          from: { pathname: '/' },
          message: 'Please sign in to save titles to your personal Wishlist.'
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
    setShowMenu(false);
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
      onClick={() => onSelect && onSelect(movie)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative flex-shrink-0 cursor-pointer w-60 sm:w-72 md:w-80 select-none will-change-transform transform-gpu transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-2.5 hover:z-40"
    >
      {/* Card Outer Container with Deep Drop Shadow */}
      <div className="relative overflow-hidden rounded-2xl bg-neutral-900/90 border border-white/10 shadow-lg shadow-black/80 group-hover:scale-[1.03] group-hover:border-white/35 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.95)] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]">
        
        {/* Sliding Glass Sheen Light Reflection */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none z-30" />

        {/* Media Window (16:9 Landscape) */}
        <div className="relative aspect-video w-full overflow-hidden bg-neutral-950">
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
                  className="h-full w-full object-cover animate-in fade-in duration-300"
                />
              ) : (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${movie.trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${movie.trailerKey}&playsinline=1&modestbranding=1&rel=0`}
                  title={movie.title}
                  loading="lazy"
                  allow="autoplay; encrypted-media"
                  className="h-full w-full pointer-events-none scale-125 object-cover"
                />
              )}

              <button
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute preview' : 'Mute preview'}
                className="absolute top-2.5 right-2.5 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/75 hover:bg-red-600 text-white backdrop-blur-md transition-all hover:scale-110 active:scale-95 shadow-md cursor-pointer"
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>
            </div>
          ) : (
            <SafeImage
              src={movie.backdropPath || movie.posterPath}
              alt={movie.title}
              fallbackTitle={movie.title}
              aspectRatio="aspect-video"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent pointer-events-none" />

          {/* Center Play Button on Hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handlePlay}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-2xl hover:scale-115 active:scale-95 transition-all shadow-white/30 cursor-pointer"
            >
              <Play className="h-5 w-5 fill-current ml-0.5" />
            </button>
          </div>

          {/* Continue Watching Red Progress Scrubber Line */}
          {progressPercent !== null && (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-neutral-800">
              <div 
                className="h-full bg-[#E50914] shadow-sm shadow-red-500" 
                style={{ width: `${Math.min(100, Math.max(10, progressPercent))}%` }} 
              />
            </div>
          )}
        </div>

        {/* Card Footer Info */}
        <div className="p-3 sm:p-3.5 space-y-1 bg-neutral-900/95">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs sm:text-sm font-black text-white truncate tracking-tight group-hover:text-red-400 transition-colors">
              {movie.title}
            </h4>

            {/* Three Dots Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu((prev) => !prev);
                }}
                className="text-neutral-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>

              {showMenu && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 bottom-full mb-1 w-40 rounded-xl bg-neutral-900/95 backdrop-blur-xl border border-white/15 p-1.5 shadow-2xl z-40 text-xs animate-in fade-in duration-150"
                >
                  <button
                    onClick={handleToggleList}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-neutral-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  >
                    {isSavedInList ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Plus className="h-3.5 w-3.5" />}
                    <span>{isSavedInList ? 'Remove from List' : 'Add to Wishlist'}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onSelect && onSelect(movie);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-neutral-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  >
                    <span>Details & Info</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Specs Row */}
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-semibold text-neutral-400">
            {movie.releaseDate && (
              <span>{new Date(movie.releaseDate).getFullYear()}</span>
            )}
            <span className="text-neutral-600">•</span>
            <span className="rounded border border-neutral-700 bg-white/5 px-1 py-0.2 text-[8px] font-bold text-neutral-300">
              {movie.maturityRating || 'U/A 16+'}
            </span>
            <span className="text-neutral-600">•</span>
            {movie.mediaType === 'tv' || movie.seasons ? (
              <span className="text-red-400 font-bold">{movie.seasons || 1} Seasons</span>
            ) : (
              <span>{remainingTime || '2h 14m'}</span>
            )}
            {movie.rating > 0 && (
              <>
                <span className="text-neutral-600">•</span>
                <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                  <Star className="h-2.5 w-2.5 fill-current" />
                  {movie.rating}
                </span>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default WideMediaCard;
