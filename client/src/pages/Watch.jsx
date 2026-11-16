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
import { useMovieDetails, useMovieVideos } from '../api/movieQueries.js';
import api from '../api/axios.js';

export const Watch = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [initialProgress, setInitialProgress] = useState(0);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);

  // Retrieve passed movie and episode from navigation state or URL query
  const passedMovie = location.state?.movie;
  const passedEpisode = location.state?.episode;
  const searchParams = new URLSearchParams(location.search);
  const episodeParam = searchParams.get('episode');

  const { data: fetchedMovie, isLoading: isMovieLoading } = useMovieDetails(!passedMovie ? id : null);
  const { data: videoData } = useMovieVideos(id);
  const activeMovie = passedMovie || fetchedMovie;

  const resolvedEpisode = passedEpisode || (
    episodeParam && activeMovie?.episodes
      ? activeMovie.episodes.find((ep) => ep.episodeNumber === Number(episodeParam))
      : null
  );

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

  if (isMovieLoading && !passedMovie) {
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

  const displayTitle = resolvedEpisode
    ? `${activeMovie?.title || 'Series'} - S1:E${resolvedEpisode.episodeNumber} ${resolvedEpisode.title}`
    : (activeMovie?.title || 'Feature Film');

  const resolvedTrailerKey = activeMovie?.trailerKey || activeMovie?.trailer_key || videoData?.trailerKey || null;

  const movieStreamUrl = resolvedEpisode?.streamUrl || activeMovie?.streamUrl || activeMovie?.videoClipUrl;
  const streamInfo = movieStreamUrl
    ? { title: displayTitle, streamUrl: movieStreamUrl, isDemo: true }
    : getStreamForMovie(id);

  return (
    <Player
      movie={{
        ...(activeMovie || { id: Number(id), title: 'Netflix Feature' }),
        title: displayTitle
      }}
      streamInfo={streamInfo}
      trailerKey={resolvedTrailerKey}
      initialProgress={initialProgress}
    />
  );
};

export default Watch;
