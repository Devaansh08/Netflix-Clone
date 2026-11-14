/**
 * @file Row.jsx
 * @description Horizontally scrollable carousel row featuring smooth scrolling and chevron pagination.
 * 
 * DATA FLOW:
 * [Home Page] ──► Passes `movies` or invokes category query hook
 *      │
 *      ▼
 * [Row Component]
 *      │
 *      ├──► Calculates scroll offset via DOM ref (`scrollBy({ left: ±distance })`)
 *      └──► Maps movie items into `<MovieCard />` components
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Native Smooth Scrolling:
 *    Using standard DOM `scrollBy({ behavior: 'smooth' })` with CSS `scroll-behavior: smooth` leverages
 *    hardware-accelerated GPU scrolling without needing heavy external carousel libraries.
 * 2. Mobile Touch & Desktop Pointer Support:
 *    Supports natural touch swipe on smartphones and tablets while offering hover chevron arrows on desktops.
 */

import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard.jsx';
import { RowSkeleton } from './Skeleton.jsx';

export const Row = ({ title, movies = [], isLoading = false, onSelect }) => {
  const rowRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75; // Scroll 75% of visible width

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

  if (isLoading) {
    return <RowSkeleton title={title} />;
  }

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <div className="group/row relative space-y-2 px-4 md:px-12 my-6">
      {/* Category Row Title */}
      <h3 className="text-base sm:text-lg md:text-xl font-bold tracking-wide text-white drop-shadow">
        {title}
      </h3>

      <div className="relative">
        {/* Left Scroll Arrow */}
        {isScrolled && (
          <button
            onClick={() => handleScroll('left')}
            aria-label="Scroll left"
            className="absolute left-0 top-0 bottom-0 z-30 flex w-10 md:w-12 items-center justify-center bg-black/60 text-white opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 hover:bg-black/90"
          >
            <ChevronLeft className="h-8 w-8 transition-transform group-hover/row:scale-125" />
          </button>
        )}

        {/* Horizontal Card Container */}
        <div
          ref={rowRef}
          onScroll={onScrollCheck}
          className="no-scrollbar flex items-center gap-2 md:gap-3 overflow-x-auto overflow-y-hidden py-4 scroll-smooth"
        >
          {movies.map((movie) => (
            <MovieCard
              key={movie.id || movie.tmdbId}
              movie={{
                id: movie.id || movie.tmdbId,
                title: movie.title,
                posterPath: movie.posterPath,
                backdropPath: movie.backdropPath,
                rating: movie.rating,
                releaseDate: movie.releaseDate,
                mediaType: movie.mediaType
              }}
              onSelect={onSelect}
            />
          ))}
        </div>

        {/* Right Scroll Arrow */}
        <button
          onClick={() => handleScroll('right')}
          aria-label="Scroll right"
          className="absolute right-0 top-0 bottom-0 z-30 flex w-10 md:w-12 items-center justify-center bg-black/60 text-white opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 hover:bg-black/90"
        >
          <ChevronRight className="h-8 w-8 transition-transform group-hover/row:scale-125" />
        </button>
      </div>
    </div>
  );
};

export default Row;
