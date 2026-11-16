/**
 * @file CoverflowHero.jsx
 * @description Expansive Widescreen Sliding Cinema Hero directly matching Image 1.
 * Features automatic horizontal sliding animation with visible progress countdown bar,
 * pause on hover, interactive Next/Prev buttons, bottom indicator dots, and
 * bottom-right mini thumbnail queue switcher.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Plus, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  Sparkles,
  Info,
  Flame,
  Volume2,
  VolumeX,
  Radio,
  Pause,
  PlayCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useMyList, useAddToListMutation, useRemoveFromListMutation } from '../api/movieQueries.js';
import SafeImage from './SafeImage.jsx';

export const CoverflowHero = ({ slides = [], onSelect }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [slideProgress, setSlideProgress] = useState(0);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: myList = [] } = useMyList();
  const addToList = useAddToListMutation();
  const removeFromList = useRemoveFromListMutation();

  const touchStartXRef = useRef(0);
  const total = slides.length || 1;

  // Slide navigation handlers
  const slideForward = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
    setSlideProgress(0);
  }, [total]);

  const slideBackward = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
    setSlideProgress(0);
  }, [total]);

  const goToSlide = (idx) => {
    setCurrentIndex(idx);
    setSlideProgress(0);
  };

  /**
   * Automatic Slide Rotation with Smooth Progress Fill (6 seconds per slide)
   */
  useEffect(() => {
    if (isHovered || !isAutoPlaying || total <= 1) return;

    const stepMs = 50;
    const durationMs = 6000;
    const stepPercent = (stepMs / durationMs) * 100;

    const interval = setInterval(() => {
      setSlideProgress((prev) => {
        if (prev >= 100) {
          slideForward();
          return 0;
        }
        return prev + stepPercent;
      });
    }, stepMs);

    return () => clearInterval(interval);
  }, [isHovered, isAutoPlaying, total, slideForward]);

  // Keyboard left / right arrow navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') slideForward();
      if (e.key === 'ArrowLeft') slideBackward();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slideForward, slideBackward]);

  // Touch swipe support for mobile / tablets
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) slideForward();
      else slideBackward();
    }
  };

  if (!slides || slides.length === 0) return null;

  const activeMovie = slides[currentIndex] || slides[0];
  const isSavedInList = myList.some((item) => item.tmdbId === activeMovie.id);

  const handlePlay = (e, movie = activeMovie) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login', {
        state: {
          from: { pathname: `/watch/${movie.id}` },
          message: `Please sign in or create an account to stream ${movie.title} on StreamVerse.`
        }
      });
      return;
    }
    navigate(`/watch/${movie.id}`, { state: { movie } });
  };

  const handleToggleList = (e, movie = activeMovie) => {
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
        mediaType: movie.mediaType || 'tv',
        title: movie.title,
        posterPath: movie.posterPath
      });
    }
  };

  // Format slide numbers with leading zeros (e.g. 01 / 06)
  const currentFormatted = String(currentIndex + 1).padStart(2, '0');
  const totalFormatted = String(total).padStart(2, '0');

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full select-none py-1 group/slider"
    >
      {/* =========================================================================
          GRAND EXPANSIVE CINEMA WIDESCREEN HERO (Directly matching Image 1)
          ========================================================================= */}
      <div 
        onClick={() => onSelect && onSelect(activeMovie)}
        className="relative w-full h-[420px] sm:h-[480px] md:h-[540px] lg:h-[580px] xl:h-[620px] rounded-3xl sm:rounded-[32px] overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.95)] border border-white/20 bg-neutral-950 transition-all duration-500 cursor-pointer"
      >
        
        {/* =======================================================================
            HORIZONTAL SLIDING TRACK FOR ALL SLIDES
            ======================================================================= */}
        <div 
          className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform transform-gpu"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, idx) => (
            <div
              key={slide.id || idx}
              className="relative w-full h-full flex-shrink-0 overflow-hidden"
            >
              {/* Full-Bleed High-Res Backdrop Image */}
              <div className="absolute inset-0 overflow-hidden">
                <SafeImage
                  src={slide.backdropPath || slide.posterPath}
                  alt={slide.title}
                  aspectRatio="aspect-video"
                  className="h-full w-full object-cover object-top brightness-95 scale-105"
                />
              </div>

              {/* Multi-Layered Cinematic Vignette Gradients */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/65 md:via-black/50 to-transparent/10" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent/20" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />

              {/* Slide Content Block (Matching Image 1: Peaky Blinders Typography & Action) */}
              <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-end p-6 sm:p-10 md:p-14 lg:p-16 z-20 max-w-3xl">
                
                {/* Metadata Badges Row: Rating, Year, Seasons, Audio, Resolution */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-2 sm:mb-3">
                  {slide.rating > 0 && (
                    <span className="flex items-center gap-1 rounded-full bg-black/75 backdrop-blur-md px-2.5 py-0.5 text-xs font-black text-amber-400 border border-white/15 shadow">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {slide.rating}
                    </span>
                  )}

                  <span className="rounded-full bg-neutral-900/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] sm:text-xs font-bold text-neutral-200 border border-white/15">
                    {slide.genres?.[0] || 'Drama'}
                  </span>

                  {slide.releaseDate && (
                    <span className="rounded-full bg-neutral-900/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] sm:text-xs font-bold text-neutral-300 border border-white/15">
                      {new Date(slide.releaseDate).getFullYear()}
                    </span>
                  )}

                  {slide.seasons ? (
                    <span className="rounded-full bg-red-950/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] sm:text-xs font-black text-red-400 border border-red-800/40">
                      {slide.seasons} Seasons
                    </span>
                  ) : (
                    <span className="rounded-full bg-neutral-900/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] sm:text-xs font-bold text-neutral-300 border border-white/15">
                      2h 15m
                    </span>
                  )}

                  <span className="rounded border border-neutral-600 bg-white/5 px-2 py-0.5 text-[9px] sm:text-[10px] font-black text-neutral-300">
                    {slide.maturityRating || '18+'}
                  </span>

                  <span className="hidden sm:inline-block rounded-full bg-cyan-950/80 border border-cyan-800/50 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300">
                    4K Ultra HD • Dolby Atmos
                  </span>
                </div>

                {/* Giant Eye-Catching Title */}
                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] leading-none text-glow-red">
                  {slide.title}
                </h1>

                {/* Sub-headline specs matching Image 1: "2013 - Drama - 5 Seasons" */}
                <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm font-bold text-neutral-300 flex items-center gap-2">
                  <span>{new Date(slide.releaseDate || Date.now()).getFullYear()}</span>
                  <span>-</span>
                  <span>{slide.genres?.[0] || 'Drama'}</span>
                  <span>-</span>
                  <span>{slide.seasons ? `${slide.seasons} Seasons` : 'Feature Film'}</span>
                </p>

                {/* Synopsis Excerpt */}
                <p className="mt-2 text-xs sm:text-sm text-neutral-300 line-clamp-2 md:line-clamp-3 max-w-2xl leading-relaxed drop-shadow">
                  {slide.overview}
                </p>

                {/* Action Buttons: Big Red Watch, Wishlist, Details */}
                <div className="mt-5 sm:mt-6 flex items-center gap-3 sm:gap-4">
                  {/* Primary Watch Button */}
                  <button
                    onClick={(e) => handlePlay(e, slide)}
                    className="flex items-center gap-2.5 rounded-2xl bg-[#E50914] px-7 sm:px-9 py-3 sm:py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider text-white shadow-2xl shadow-red-950 transition-all hover:bg-red-600 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Play className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                    <span>Watch</span>
                  </button>

                  {/* Wishlist Toggle Button */}
                  <button
                    onClick={(e) => handleToggleList(e, slide)}
                    aria-label="Wishlist toggle"
                    title={isSavedInList ? 'Remove from Wishlist' : 'Save to Wishlist'}
                    className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl border border-white/20 transition-all hover:scale-110 active:scale-90 shadow-xl cursor-pointer"
                  >
                    {isSavedInList ? <Check className="h-5 w-5 text-green-400" /> : <Plus className="h-5 w-5" />}
                  </button>

                  {/* Info / Modal Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect && onSelect(slide);
                    }}
                    title="More Information"
                    className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-black/50 hover:bg-neutral-800 text-white backdrop-blur-xl border border-white/15 transition-all hover:scale-110 active:scale-90 shadow-xl cursor-pointer"
                  >
                    <Info className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* =======================================================================
            FORWARD & PREVIOUS SLIDING CONTROLS (Next and Forward Buttons)
            ======================================================================= */}
        {/* Previous / Backward Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            slideBackward();
          }}
          aria-label="Previous slide"
          title="Previous Movie"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-40 flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-black/65 hover:bg-[#E50914] text-white/90 hover:text-white backdrop-blur-2xl border border-white/20 transition-all hover:scale-110 active:scale-95 shadow-2xl cursor-pointer group/nav"
        >
          <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7 transition-transform group-hover/nav:-translate-x-0.5" />
        </button>

        {/* Next / Forward Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            slideForward();
          }}
          aria-label="Next slide"
          title="Next Movie (Forward)"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-black/65 hover:bg-[#E50914] text-white/90 hover:text-white backdrop-blur-2xl border border-white/20 transition-all hover:scale-110 active:scale-95 shadow-2xl cursor-pointer group/nav"
        >
          <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7 transition-transform group-hover/nav:translate-x-0.5" />
        </button>

        {/* Top Header Badge & Slide Counter */}
        <div className="absolute top-5 sm:top-7 left-6 sm:left-12 right-6 sm:right-12 z-30 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-[#E50914] px-3 py-1 text-[10px] sm:text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-red-950 animate-pulse">
              <Flame className="h-3.5 w-3.5 fill-current" />
              {activeMovie.mediaType === 'tv' ? 'Featured Series Spotlight' : 'Blockbuster Premiere'}
            </span>
          </div>

          {/* Slide Position Counter (e.g. 01 / 06) */}
          <div className="flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-xl px-3 py-1 border border-white/15 text-xs font-black text-neutral-300 shadow-xl">
            <span className="text-white">{currentFormatted}</span>
            <span className="text-neutral-500">/</span>
            <span className="text-neutral-400">{totalFormatted}</span>
          </div>
        </div>

        {/* =======================================================================
            BOTTOM-RIGHT MINI THUMBNAIL QUEUE SWITCHER (Exact Image 1 Screenshot!)
            ======================================================================= */}
        <div className="absolute right-4 sm:right-8 bottom-5 sm:bottom-8 z-30 hidden sm:flex items-center gap-2.5 p-2 rounded-2xl bg-black/65 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
          {slides.slice(0, 4).map((slide, idx) => (
            <button
              key={slide.id || idx}
              onClick={(e) => {
                e.stopPropagation();
                goToSlide(idx);
              }}
              title={`Slide to ${slide.title}`}
              className={`relative h-12 w-20 sm:h-14 sm:w-24 overflow-hidden rounded-xl transition-all cursor-pointer ${
                currentIndex === idx
                  ? 'ring-2 ring-[#E50914] scale-105 shadow-lg shadow-red-950'
                  : 'opacity-50 hover:opacity-90 hover:scale-100'
              }`}
            >
              <SafeImage
                src={slide.backdropPath || slide.posterPath}
                alt={slide.title}
                aspectRatio="aspect-video"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <span className="absolute bottom-1 left-1.5 right-1.5 text-[8px] font-black text-white truncate text-left drop-shadow">
                {slide.title}
              </span>
            </button>
          ))}
        </div>

      </div>

      {/* =========================================================================
          BOTTOM SLIDE INDICATORS & CONTROLS
          ========================================================================= */}
      <div className="flex items-center justify-between px-3 sm:px-6 mt-3">
        <div className="flex items-center gap-2">
          <button
            onClick={slideBackward}
            className="flex items-center gap-1 text-[11px] font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Prev</span>
          </button>
        </div>

        {/* Progress Indicator Dots */}
        <div className="flex items-center gap-2">
          {slides.slice(0, 8).map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === idx 
                  ? 'w-10 bg-[#E50914] shadow-sm shadow-red-600' 
                  : 'w-2.5 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={slideForward}
            className="flex items-center gap-1 text-[11px] font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <span>Next (Forward)</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoverflowHero;
