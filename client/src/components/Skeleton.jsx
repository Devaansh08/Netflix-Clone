/**
 * @file Skeleton.jsx
 * @description Sleek shimmer skeleton placeholder components to eliminate Cumulative Layout Shift (CLS).
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Zero Cumulative Layout Shift (CLS):
 *    Reserving exact aspect-ratio bounding boxes (16:9 for hero, 2:3 for movie cards) before images
 *    finish loading avoids content jumps that hurt Google Core Web Vitals and distract users.
 * 2. Perceived Performance:
 *    Shimmer animations reassure users that content is actively streaming into the view.
 */

import React from 'react';

/**
 * Skeleton loader for full-width Hero banner.
 */
export const HeroSkeleton = () => {
  return (
    <div className="relative h-[65vh] md:h-[80vh] w-full animate-pulse bg-neutral-900">
      <div className="absolute bottom-16 left-8 md:left-16 max-w-xl space-y-4">
        <div className="h-10 w-72 rounded bg-neutral-800"></div>
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-neutral-800"></div>
          <div className="h-4 w-5/6 rounded bg-neutral-800"></div>
          <div className="h-4 w-4/6 rounded bg-neutral-800"></div>
        </div>
        <div className="flex gap-4 pt-2">
          <div className="h-11 w-28 rounded-md bg-neutral-800"></div>
          <div className="h-11 w-32 rounded-md bg-neutral-800"></div>
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton loader for a horizontal row of movie cards.
 */
export const RowSkeleton = ({ title = 'Loading...' }) => {
  return (
    <div className="space-y-3 px-4 md:px-12 my-6">
      <div className="h-6 w-48 rounded bg-neutral-800 animate-pulse"></div>
      <div className="flex gap-3 overflow-hidden">
        {[...Array(6)].map((_, idx) => (
          <div
            key={idx}
            className="h-48 md:h-64 w-32 md:w-44 flex-shrink-0 rounded-md bg-neutral-800 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
};

export default { HeroSkeleton, RowSkeleton };
