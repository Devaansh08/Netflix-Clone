/**
 * @file NewTrailersSidebar.jsx
 * @description Vertical interactive trailer preview rail matching Image 1 ("New Trailers 🔥").
 * Renders quick trailer cards with thumbnail, title, and direct mini-player action.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Sparkles, Flame } from 'lucide-react';
import SafeImage from './SafeImage.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const NewTrailersSidebar = ({ trailers = [], onSelect }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePlayTrailer = (e, movie) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login', {
        state: {
          from: { pathname: `/watch/${movie.id}` },
          message: `Please sign in or create an account to preview ${movie.title}.`
        }
      });
      return;
    }
    navigate(`/watch/${movie.id}`, { state: { movie } });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 px-1">
        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white flex items-center gap-1">
          New Trailers
          <Flame className="h-4 w-4 text-[#E50914] fill-current animate-bounce" />
        </h3>
      </div>

      <div className="space-y-2.5">
        {trailers.slice(0, 3).map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect && onSelect(item)}
            className="group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-neutral-900/80 hover:bg-neutral-800/90 p-2 border border-white/10 hover:border-white/25 transition-all shadow-md cursor-pointer hover:scale-[1.02]"
          >
            {/* Thumbnail */}
            <div className="relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-950">
              <SafeImage
                src={item.backdropPath || item.posterPath}
                alt={item.title}
                aspectRatio="aspect-video"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
            </div>

            {/* Title & Type */}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors truncate">
                {item.title}
              </h4>
              <p className="text-[10px] font-medium text-neutral-400 truncate">
                {item.mediaType === 'tv' ? `${item.seasons || 1} Seasons` : (item.genres?.[0] || 'Trailer')}
              </p>
            </div>

            {/* Mini Play Pill Button (Matching Image 1) */}
            <button
              onClick={(e) => handlePlayTrailer(e, item)}
              aria-label={`Play trailer for ${item.title}`}
              title="Preview Trailer"
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/15 hover:bg-white text-white hover:text-black transition-all hover:scale-110 active:scale-95 shadow-sm"
            >
              <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewTrailersSidebar;
