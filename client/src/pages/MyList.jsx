/**
 * @file MyList.jsx
 * @description Dedicated view displaying all movies bookmarked to the user's personal My List watchlist.
 * 
 * DATA FLOW:
 * [MyList Page Mount]
 *      │
 *      ▼
 * [useMyList() React Query Hook] ──► GET /api/list
 *      │
 *      ▼
 * [Renders bookmarks grid with quick removal & playback options]
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Plus } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import MovieCard from '../components/MovieCard.jsx';
import DetailsModal from '../components/DetailsModal.jsx';
import Footer from '../components/Footer.jsx';
import { useMyList } from '../api/movieQueries.js';

export const MyList = () => {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const { data: myList = [], isLoading } = useMyList();

  return (
    <div className="min-h-screen bg-[#141414] pb-20">
      <Navbar />

      <div className="px-4 sm:px-8 md:px-14 pt-24 sm:pt-28 max-w-7xl mx-auto space-y-6">
        <div className="border-b border-neutral-800 pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">My List</h1>
          <p className="text-sm text-neutral-400 mt-1">
            {myList.length} {myList.length === 1 ? 'title' : 'titles'} saved to your watchlist
          </p>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E50914] border-t-transparent" />
          </div>
        ) : myList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {myList.map((item) => (
              <MovieCard
                key={item.tmdbId}
                movie={{
                  ...item,
                  id: item.tmdbId,
                  title: item.title,
                  posterPath: item.posterPath,
                  mediaType: item.mediaType
                }}
                onSelect={setSelectedMovie}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 mb-4">
              <Bookmark className="h-8 w-8 text-neutral-500" />
            </div>
            <h3 className="text-xl font-bold text-white">Your list is currently empty</h3>
            <p className="text-sm text-neutral-400 max-w-sm mt-2 mb-6">
              Explore trending and top-rated titles on the home screen and click the plus (+) icon to build your custom watchlist.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded bg-[#E50914] px-6 py-2.5 font-bold text-white transition-colors hover:bg-red-700"
            >
              Browse Catalog
            </Link>
          </div>
        )}
      </div>

      {selectedMovie && (
        <DetailsModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MyList;
