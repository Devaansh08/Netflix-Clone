/**
 * @file Row.jsx
 * @description Horizontally scrollable carousel row featuring automatic smooth sliding, 
 * chevron pagination, pause on hover, and Top 10 rank indicator support.
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard.jsx';
import { RowSkeleton } from './Skeleton.jsx';

export const Row = ({ 
  title, 
  movies = [], 
  isLoading = false, 
  onSelect, 
  isTop10 = false,
  autoSlide = true,
  slideInterval = 6000
}) => {
  const rowRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;

      const targetScroll = direction === 'left' 
        ? scrollLeft - scrollAmount 
        : scrollLeft + scrollAmount;

      rowRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  const onScrollCheck = () => {
    if (rowRef.current) {
      setIsScrolled(rowRef.current.scrollLeft > 20);
    }
  };

  /**
   * Automatic Sliding Animation:
   * Periodically slides forward and loops back smoothly to start.
   */
  useEffect(() => {
    if (!autoSlide || isHovered || movies.length === 0) return;

    const stagger = (title.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 2000);
    const effectiveInterval = slideInterval + stagger;

    const timer = setInterval(() => {
      if (!rowRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;

      if (scrollLeft + clientWidth >= scrollWidth - 25) {
        rowRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        const step = Math.max(260, Math.round(clientWidth * 0.5));
        rowRef.current.scrollBy({ left: step, behavior: 'smooth' });
      }
    }, effectiveInterval);

    return () => clearInterval(timer);
  }, [autoSlide, isHovered, movies.length, slideInterval, title]);

  if (isLoading) {
    return <RowSkeleton title={title} />;
  }

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group/row relative space-y-2 px-4 md:px-12 my-6 select-none"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '320px' }}
    >
      {/* Category Row Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg md:text-xl font-bold tracking-wide text-white drop-shadow flex items-center gap-2">
          {title}
          {isTop10 && (
            <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase text-white tracking-wider shadow">
              TOP 10
            </span>
          )}
        </h3>
      </div>

      <div className="relative">
        {/* Left Scroll Arrow */}
        {isScrolled && (
          <button
            onClick={() => handleScroll('left')}
            aria-label="Scroll left"
            className="absolute left-0 top-0 bottom-0 z-30 flex w-10 md:w-12 items-center justify-center bg-black/70 text-white opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 hover:bg-black/95 rounded-r cursor-pointer"
          >
            <ChevronLeft className="h-8 w-8 transition-transform group-hover/row:scale-125" />
          </button>
        )}

        {/* Horizontal Card Container */}
        <div
          ref={rowRef}
          onScroll={onScrollCheck}
          className="no-scrollbar flex items-center gap-3 sm:gap-4 overflow-x-auto overflow-y-visible py-7 -my-3.5 scroll-smooth px-1"
        >
          {movies.map((movie, idx) => (
            <MovieCard
              key={movie.id || movie.tmdbId}
              movie={{
                ...movie,
                id: movie.id || movie.tmdbId
              }}
              onSelect={onSelect}
              rankNumber={isTop10 ? idx + 1 : null}
            />
          ))}
        </div>

        {/* Right Scroll Arrow */}
        <button
          onClick={() => handleScroll('right')}
          aria-label="Scroll right"
          className="absolute right-0 top-0 bottom-0 z-30 flex w-10 md:w-12 items-center justify-center bg-black/70 text-white opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 hover:bg-black/95 rounded-l cursor-pointer"
        >
          <ChevronRight className="h-8 w-8 transition-transform group-hover/row:scale-125" />
        </button>
      </div>
    </div>
  );
};

export default Row;
