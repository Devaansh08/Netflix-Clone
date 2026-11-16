/**
 * @file Hero.jsx
 * @description Multi-slide cinematic hero billboard with automated carousel, genre badges, 
 * maturity ratings, and background video clip streaming with audio toggle.
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Background Video Stream Crossfade:
 *    Like Netflix and Apple TV+, the hero billboard begins streaming the cinematic video clip 
 *    after 2.5 seconds of viewing the active slide, cross-fading from the static backdrop.
 * 2. Interactive Audio Control:
 *    Provides an in-hero sound toggle (mute/unmute) so visitors can experience movie sound directly.
 * 3. Multi-Genre Slide Showcase:
 *    Auto-rotates through diverse blockbuster films representing different genres (Sci-Fi, Anime, Action, 18+ Thriller).
 * 4. Resilient Backdrop Loading:
 *    Guarantees backdrop images load smoothly without visual flashes.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Info, 
  Plus, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  ShieldAlert, 
  Volume2, 
  VolumeX,
  Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useMyList, useAddToListMutation, useRemoveFromListMutation } from '../api/movieQueries.js';
import { HeroSkeleton } from './Skeleton.jsx';

export const Hero = ({ slides = [], isLoading, onSelect }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVideoStreaming, setIsVideoStreaming] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: myList = [] } = useMyList();
  const addToList = useAddToListMutation();
  const removeFromList = useRemoveFromListMutation();

  const timerRef = useRef(null);
  const videoTimerRef = useRef(null);
  const heroVideoRef = useRef(null);

  const totalSlides = slides.length;

  const nextSlide = useCallback(() => {
    if (totalSlides > 0) {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
      setIsVideoStreaming(false);
    }
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    if (totalSlides > 0) {
      setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
      setIsVideoStreaming(false);
    }
  }, [totalSlides]);

  // Automated slide rotation every 9 seconds (paused on hover or when video preview is active)
  useEffect(() => {
    if (totalSlides <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 9000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [totalSlides, isPaused, nextSlide]);

  // Start background video stream after staying on slide for 2.5 seconds
  useEffect(() => {
    setIsVideoStreaming(false);
    if (videoTimerRef.current) clearTimeout(videoTimerRef.current);

    videoTimerRef.current = setTimeout(() => {
      setIsVideoStreaming(true);
    }, 2500);

    return () => {
      if (videoTimerRef.current) clearTimeout(videoTimerRef.current);
    };
  }, [currentSlide]);

  if (isLoading || totalSlides === 0) {
    return <HeroSkeleton />;
  }

  const activeMovie = slides[currentSlide] || slides[0];
  const isSavedInList = myList.some((item) => item.tmdbId === activeMovie.id);

  const handlePlay = () => {
    if (!user) {
      navigate('/login', {
        state: {
          from: { pathname: `/watch/${activeMovie.id}` },
          message: 'Please sign in or create an account to watch full movies and videos on Netflix.'
        }
      });
      return;
    }
    navigate(`/watch/${activeMovie.id}`, { state: { movie: activeMovie } });
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
      removeFromList.mutate(activeMovie.id);
    } else {
      addToList.mutate({
        tmdbId: activeMovie.id,
        mediaType: activeMovie.mediaType || 'movie',
        title: activeMovie.title,
        posterPath: activeMovie.posterPath
      });
    }
  };

  const toggleAudio = () => {
    setIsMuted((prev) => !prev);
    if (heroVideoRef.current) {
      heroVideoRef.current.muted = !isMuted;
    }
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="group/hero relative h-[75vh] sm:h-[82vh] md:h-[90vh] w-full select-none overflow-hidden bg-black"
    >
      {/* Background Media: High-res Backdrop Image OR Live Video Stream */}
      <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out">
        {isVideoStreaming && activeMovie.videoClipUrl ? (
          <video
            ref={heroVideoRef}
            src={activeMovie.videoClipUrl}
            autoPlay
            playsInline
            muted={isMuted}
            loop
            className="h-full w-full object-cover animate-in fade-in duration-1000"
          />
        ) : activeMovie.backdropPath ? (
          <img
            key={activeMovie.id}
            src={activeMovie.backdropPath}
            alt={activeMovie.title}
            className="h-full w-full object-cover object-top animate-in fade-in duration-700"
            fetchPriority="high"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-neutral-900 via-neutral-950 to-black" />
        )}
      </div>

      {/* Cinematic Edge Gradients & Vignettes */}
      <div className="banner-left-fade absolute inset-0 z-10" />
      <div className="banner-vignette absolute inset-0 z-10" />

      {/* Live Stream Indicator (Top Right of Hero) */}
      {isVideoStreaming && (
        <div className="absolute top-24 right-6 sm:right-14 z-20 hidden sm:flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md border border-white/10 shadow-lg animate-in fade-in duration-500">
          <Radio className="h-3.5 w-3.5 text-red-500 animate-pulse" />
          <span>Streaming Preview</span>
        </div>
      )}

      {/* Left / Right Carousel Navigation Chevrons */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous featured film"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-all group-hover/hero:opacity-100 hover:bg-black/80 hover:scale-110 active:scale-95 backdrop-blur-md cursor-pointer"
          >
            <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next featured film"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-all group-hover/hero:opacity-100 hover:bg-black/80 hover:scale-110 active:scale-95 backdrop-blur-md cursor-pointer"
          >
            <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>
        </>
      )}

      {/* Slide Content Meta Container */}
      <div className="absolute bottom-16 sm:bottom-24 left-4 sm:left-8 md:left-16 z-20 max-w-xl md:max-w-2xl space-y-3 sm:space-y-4">
        {/* Genre & Maturity Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {activeMovie.genres && activeMovie.genres.length > 0 && (
            <span className="rounded-full bg-[#E50914] px-3 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white shadow-md">
              {activeMovie.genres[0]}
            </span>
          )}

          {/* Maturity Rating Badge (18+, PG-13, PG) */}
          <span className={`flex items-center gap-1 rounded px-2 py-0.5 text-xs font-extrabold tracking-wide border ${
            activeMovie.is18Plus
              ? 'border-red-500 bg-red-950/80 text-red-200'
              : 'border-neutral-500 bg-black/60 text-neutral-200'
          }`}>
            {activeMovie.is18Plus && <ShieldAlert className="h-3 w-3 text-red-400" />}
            {activeMovie.maturityRating || 'PG-13'}
          </span>

          {/* Audio Language & 4K Spec */}
          <span className="rounded bg-white/10 px-2 py-0.5 text-xs font-medium text-neutral-300 backdrop-blur-sm">
            {activeMovie.languageLabel} Audio
          </span>

          <span className="rounded border border-white/20 bg-black/40 px-1.5 py-0.5 text-[10px] font-bold text-neutral-200 backdrop-blur-sm">
            4K ULTRA HD
          </span>

          {activeMovie.rating > 0 && (
            <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
              <Star className="h-3.5 w-3.5 fill-current" />
              {activeMovie.rating}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-xl">
          {activeMovie.title}
        </h1>

        {/* Overview Clamped */}
        <p className="line-clamp-3 text-xs sm:text-sm md:text-base font-normal text-neutral-200 drop-shadow">
          {activeMovie.overview}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Play Button */}
          <button
            onClick={handlePlay}
            className="flex items-center gap-2 rounded-full bg-white px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-bold text-black shadow-xl transition-all hover:bg-neutral-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Play className="h-5 w-5 fill-current" />
            Play
          </button>

          {/* More Info Button */}
          <button
            onClick={() => onSelect && onSelect(activeMovie)}
            className="flex items-center gap-2 rounded-full bg-neutral-600/70 px-5 sm:px-7 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white backdrop-blur-md transition-all hover:bg-neutral-600/90 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Info className="h-5 w-5" />
            More Info
          </button>

          {/* Watchlist Toggle */}
          <button
            onClick={handleToggleList}
            aria-label={isSavedInList ? 'Remove from My List' : 'Add to My List'}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition-transform hover:scale-110 hover:border-white active:scale-95 cursor-pointer"
          >
            {isSavedInList ? (
              <Check className="h-5 w-5 text-green-400" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Bottom Controls: Sound Toggle and Carousel Pagination Dots */}
      <div className="absolute bottom-6 right-6 sm:right-12 z-30 flex items-center gap-4">
        {/* In-Hero Sound Mute/Unmute Toggle */}
        {isVideoStreaming && (
          <button
            onClick={toggleAudio}
            aria-label={isMuted ? 'Unmute hero preview' : 'Mute hero preview'}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20 hover:bg-black/90 hover:scale-110 active:scale-95 transition-all shadow-lg cursor-pointer"
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5 text-red-500" />}
          </button>
        )}

        {/* iOS Pagination Pill Dots */}
        {totalSlides > 1 && (
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentSlide(idx);
                  setIsVideoStreaming(false);
                }}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                  currentSlide === idx
                    ? 'w-7 bg-white'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Hero;
