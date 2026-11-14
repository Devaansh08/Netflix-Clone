/**
 * @file Watch.jsx
 * @description Dedicated fullscreen video playback page rendering the adaptive HLS player.
 * 
 * DATA FLOW:
 * [Route /watch/:id Hit]
 *      │
 *      ├──► Resolves movie metadata (via route state or `useMovieDetails(id)`)
 *      ├──► Resolves verified CC HLS stream (.m3u8) via `getStreamForMovie(id)`
 *      └──► Queries `/api/history` to restore previous playback progress seconds
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Deep-Linking Resiliency:
 *    If a user directly bookmarks or shares a link to `/watch/157336`, the page gracefully fetches
 *    the movie details from the API rather than relying solely on ephemeral in-memory router state.
 * 2. Instant Resume:
 *    Pre-populates `initialProgress` from previous viewing session history.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Player from '../components/Player.jsx';
import { getStreamForMovie } from '../config/streamConfig.js';
import { useMovieDetails } from '../api/movieQueries.js';
import api from '../api/axios.js';

export const Watch = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [initialProgress, setInitialProgress] = useState(0);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);

  // Retrieve passed movie from navigation state, or fallback to fetching from API
  const passedMovie = location.state?.movie;
  const { data: fetchedMovie, isLoading: isMovieLoading } = useMovieDetails(!passedMovie ? id : null);
  const activeMovie = passedMovie || fetchedMovie;

  // Fetch saved progress for this movie
  useEffect(() => {
    let isMounted = true;
    const fetchSavedProgress = async () => {
      try {
        const { data } = await api.get('/history');
        const match = (data.history || []).find((h) => h.tmdbId === Number(id));
        if (isMounted && match && match.progressSeconds > 0) {
          setInitialProgress(match.progressSeconds);
        }
      } catch (err) {
        console.warn('Could not fetch prior watch history checkpoint:', err.message);
      } finally {
        if (isMounted) setIsHistoryLoaded(true);
      }
    };

    fetchSavedProgress();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isMovieLoading || !isHistoryLoaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-[#E50914] border-t-transparent" />
          <span className="text-sm font-semibold tracking-wider text-neutral-400">
            LOADING STREAM...
          </span>
        </div>
      </div>
    );
  }

  const movieStreamUrl = activeMovie?.streamUrl || activeMovie?.videoClipUrl;
  const streamInfo = movieStreamUrl
    ? { title: activeMovie?.title || 'Feature Film', streamUrl: movieStreamUrl, isDemo: true }
    : getStreamForMovie(id);

  return (
    <Player
      movie={activeMovie || { id: Number(id), title: 'StreamVerse Demo Feature' }}
      streamInfo={streamInfo}
      initialProgress={initialProgress}
    />
  );
};

export default Watch;
