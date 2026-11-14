/**
 * @file SafeImage.jsx
 * @description Resilient image component featuring skeleton shimmer loaders, smooth crossfade on load,
 * and automatic dynamic SVG poster generation on network/CDN failure.
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Zero Broken Image Icons (Defensive UI Engineering):
 *    Third-party CDNs (like TMDB) can occasionally experience 404s, CORS hiccups, or rate-limiting.
 *    Rather than showing a broken image icon (which looks amateurish), `SafeImage` intercepts `onError`
 *    and immediately renders a sleek, gradient-backed cinema poster with the movie's title and badges.
 * 2. Cumulative Layout Shift (CLS) Elimination:
 *    Maintains strict aspect ratios and renders a pulse skeleton placeholder so content below doesn't
 *    jump when images finish downloading.
 * 3. Native Smooth Transitions:
 *    Uses CSS opacity transitions (`opacity-0` to `opacity-100`) to eliminate harsh image popping.
 */

import React, { useState } from 'react';
import { Film, ImageOff } from 'lucide-react';

export const SafeImage = ({
  src,
  alt = 'Movie Poster',
  className = '',
  fallbackTitle = '',
  aspectRatio = 'aspect-[2/3]',
  priority = false
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // If no source is provided at all, immediately enter fallback mode
  const showFallback = hasError || !src;

  return (
    <div className={`relative overflow-hidden bg-neutral-900 ${aspectRatio} ${className}`}>
      {/* Loading Skeleton Shimmer */}
      {!isLoaded && !showFallback && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900" />
      )}

      {/* Main Image */}
      {!showFallback ? (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`h-full w-full object-cover transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : (
        /* Cinematic Dynamic Fallback Poster */
        <div className="absolute inset-0 flex flex-col items-center justify-between p-4 text-center bg-gradient-to-b from-neutral-800 via-neutral-900 to-black select-none border border-neutral-800">
          <div className="flex w-full items-center justify-between opacity-50">
            <Film className="h-4 w-4 text-red-500" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">StreamVerse</span>
          </div>

          <div className="my-auto space-y-1">
            <h4 className="line-clamp-3 text-xs sm:text-sm font-bold text-neutral-100 drop-shadow">
              {fallbackTitle || alt}
            </h4>
            <span className="inline-block text-[10px] text-neutral-400 font-medium">Cinema Edition</span>
          </div>

          <div className="flex w-full items-center justify-between border-t border-white/5 pt-2 text-[9px] text-neutral-400 font-semibold">
            <span className="rounded bg-neutral-800 px-1 py-0.5 text-neutral-300">4K HDR</span>
            <span className="text-red-500">PREVIEW</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SafeImage;
