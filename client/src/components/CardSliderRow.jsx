/**
 * @file CardSliderRow.jsx
 * @description Smooth sliding horizontal card carousel with automatic sliding animation,
 * prominent Next & Previous controls, pause on hover, hardware-accelerated smooth scrolling,
 * and vertical headroom for elevated card hover pop-ups.
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const CardSliderRow = ({ 
  title, 
  icon = null, 
  badge = null, 
  subtitle = null, 
  children,
  className = '',
  autoSlide = true,
  slideInterval = 5500
}) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(autoSlide);

  // Deterministically stagger intervals across rows so they don't slide in unison
  const staggerOffset = (title.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 2400);
  const effectiveInterval = slideInterval + staggerOffset;

  const checkScrollBounds = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 15);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 15);
    }
  }, []);

  useEffect(() => {
    checkScrollBounds();
    const el = scrollRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => checkScrollBounds());
    observer.observe(el);

    return () => observer.disconnect();
  }, [children, checkScrollBounds]);

  const slide = useCallback((direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = Math.max(300, clientWidth * 0.65);
      const targetOffset = direction === 'left' ? -scrollAmount : scrollAmount;

      scrollRef.current.scrollBy({
        left: targetOffset,
        behavior: 'smooth'
      });

      setTimeout(checkScrollBounds, 400);
    }
  }, [checkScrollBounds]);

  /**
   * Automatic Sliding Animation:
   * Smoothly slides cards forward periodically. Loops back to start when reaching the end.
   * Automatically pauses when hovered or when auto-scroll is disabled.
   */
  useEffect(() => {
    if (!isAutoScrollEnabled || isHovered) return;

    const timer = setInterval(() => {
      if (!scrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

      // Loop smoothly back to beginning if reaching the end
      if (scrollLeft + clientWidth >= scrollWidth - 25) {
        scrollRef.current.scrollTo({
          left: 0,
          behavior: 'smooth'
        });
      } else {
        const advanceAmount = Math.max(260, Math.round(clientWidth * 0.45));
        scrollRef.current.scrollBy({
          left: advanceAmount,
          behavior: 'smooth'
        });
      }

      setTimeout(checkScrollBounds, 400);
    }, effectiveInterval);

    return () => clearInterval(timer);
  }, [isAutoScrollEnabled, isHovered, effectiveInterval, checkScrollBounds]);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group/slider-row relative space-y-2 select-none ${className}`}
    >
      {/* Row Header with Title, Badge, Subtitle, Auto-Slide Indicator & Navigation Arrows */}
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-wrap items-center gap-2">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
            {title}
          </h3>
          {badge && (
            <span className="rounded-full bg-red-950/80 border border-red-800/40 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase text-red-300">
              {badge}
            </span>
          )}
          {subtitle && (
            <span className="text-xs font-medium text-neutral-400 hidden sm:inline">
              {subtitle}
            </span>
          )}
        </div>

        {/* Header Small Navigation Arrows */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => slide('left')}
            disabled={!canScrollLeft}
            aria-label={`Slide ${title} left`}
            className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all cursor-pointer ${
              canScrollLeft
                ? 'bg-white/10 hover:bg-white text-white hover:text-black border-white/20 hover:scale-105 active:scale-95'
                : 'bg-white/5 border-white/5 text-neutral-600 opacity-40 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            onClick={() => slide('right')}
            disabled={!canScrollRight}
            aria-label={`Slide ${title} right`}
            className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all cursor-pointer ${
              canScrollRight
                ? 'bg-white/10 hover:bg-[#E50914] text-white border-white/20 hover:scale-105 active:scale-95 shadow-md'
                : 'bg-white/5 border-white/5 text-neutral-600 opacity-40 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Slider Track */}
      <div className="relative overflow-visible">
        {/* Floating Left Large Overlay Arrow (Appears on Hover) */}
        {canScrollLeft && (
          <button
            onClick={() => slide('left')}
            aria-label={`Slide ${title} backwards`}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/80 hover:bg-[#E50914] text-white backdrop-blur-xl border border-white/20 transition-all hover:scale-110 active:scale-95 shadow-2xl cursor-pointer opacity-0 group-hover/slider-row:opacity-100"
          >
            <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>
        )}

        {/* Horizontal Cards Scrollable Track with vertical clearance for hover pop-ups */}
        <div
          ref={scrollRef}
          onScroll={checkScrollBounds}
          className="no-scrollbar flex items-center gap-4 overflow-x-auto py-7 -my-3.5 px-2 sm:px-3 scroll-smooth will-change-scroll transform-gpu"
        >
          {children}
        </div>

        {/* Floating Right Large Overlay Arrow (Appears on Hover) */}
        {canScrollRight && (
          <button
            onClick={() => slide('right')}
            aria-label={`Slide ${title} forward`}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/80 hover:bg-[#E50914] text-white backdrop-blur-xl border border-white/20 transition-all hover:scale-110 active:scale-95 shadow-2xl cursor-pointer opacity-0 group-hover/slider-row:opacity-100"
          >
            <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>
        )}
      </div>
    </div>
  );
};

export default CardSliderRow;
