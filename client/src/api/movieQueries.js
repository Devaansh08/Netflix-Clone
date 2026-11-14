/**
 * @file movieQueries.js
 * @description React Query hooks for fetching and caching movie catalog feeds and user watchlists.
 * 
 * DATA FLOW:
 * [UI Component (Home / Row / Modal / Search)]
 *      │
 *      ▼
 * [Custom Query Hook: useTrendingMovies, useGenreMovies, etc.]
 *      │ (Checks TanStack Query cache; staleTime: 5 min)
 *      ▼
 * [api.get('/movies/...')]
 *      │ (Sends credentials & hits Express backend)
 *      ▼
 * [Express /tmdbService (In-memory cached TMDB results)]
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. TanStack Query Caching & Deduping (`staleTime: 5 mins`):
 *    Multiple rows or components requesting the same feed share in-flight promises (no duplicate network requests)
 *    and serve instantaneous cached data when navigating back from `/watch` or `/search`.
 * 2. Background Revalidation:
 *    Keeps UI active and interactive immediately while silently fetching fresh data in the background.
 * 3. Central Query Keys:
 *    Using structured query keys `['movies', 'genre', genreId]` simplifies granular cache invalidation
 *    when users update lists or preferences.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './axios.js';

// Global cache fresh duration: 5 minutes
const FIVE_MINUTES_MS = 5 * 60 * 1000;

/**
 * Fetch trending movies feed.
 */
export const useTrendingMovies = (page = 1) => {
  return useQuery({
    queryKey: ['movies', 'trending', page],
    queryFn: async () => {
      const { data } = await api.get(`/movies/trending?page=${page}`);
      return data;
    },
    staleTime: FIVE_MINUTES_MS
  });
};

/**
 * Fetch top rated movies feed.
 */
export const useTopRatedMovies = (page = 1) => {
  return useQuery({
    queryKey: ['movies', 'top-rated', page],
    queryFn: async () => {
      const { data } = await api.get(`/movies/top-rated?page=${page}`);
      return data;
    },
    staleTime: FIVE_MINUTES_MS
  });
};

/**
 * Fetch popular movies feed.
 */
export const usePopularMovies = (page = 1) => {
  return useQuery({
    queryKey: ['movies', 'popular', page],
    queryFn: async () => {
      const { data } = await api.get(`/movies/popular?page=${page}`);
      return data;
    },
    staleTime: FIVE_MINUTES_MS
  });
};

/**
 * Fetch movies by specific TMDB genre ID.
 */
export const useGenreMovies = (genreId, page = 1) => {
  return useQuery({
    queryKey: ['movies', 'genre', genreId, page],
    queryFn: async () => {
      const { data } = await api.get(`/movies/genre/${genreId}?page=${page}`);
      return data;
    },
    staleTime: FIVE_MINUTES_MS,
    enabled: !!genreId
  });
};

/**
 * Fetch movies by audio/original language (en, ja, ko, es, hi, fr).
 */
export const useLanguageMovies = (languageCode, page = 1) => {
  return useQuery({
    queryKey: ['movies', 'language', languageCode, page],
    queryFn: async () => {
      const { data } = await api.get(`/movies/language/${languageCode}?page=${page}`);
      return data;
    },
    staleTime: FIVE_MINUTES_MS,
    enabled: !!languageCode
  });
};

/**
 * Fetch 18+ Mature content collection.
 */
export const useMature18PlusMovies = (page = 1) => {
  return useQuery({
    queryKey: ['movies', 'mature-18plus', page],
    queryFn: async () => {
      const { data } = await api.get(`/movies/mature-18plus?page=${page}`);
      return data;
    },
    staleTime: FIVE_MINUTES_MS
  });
};

/**
 * Search movies by keyword string.
 */
export const useSearchMovies = (query, page = 1) => {
  return useQuery({
    queryKey: ['movies', 'search', query, page],
    queryFn: async () => {
      const { data } = await api.get(`/movies/search?q=${encodeURIComponent(query)}&page=${page}`);
      return data;
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!query && query.trim().length > 0
  });
};

/**
 * Fetch specific movie details by TMDB ID.
 */
export const useMovieDetails = (id) => {
  return useQuery({
    queryKey: ['movie', 'details', id],
    queryFn: async () => {
      const { data } = await api.get(`/movies/${id}`);
      return data.movie;
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!id
  });
};

/**
 * Fetch video trailer embed keys for a movie.
 */
export const useMovieVideos = (id) => {
  return useQuery({
    queryKey: ['movie', 'videos', id],
    queryFn: async () => {
      const { data } = await api.get(`/movies/${id}/videos`);
      return data;
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!id
  });
};

/**
 * Fetch user's My List watchlist.
 */
export const useMyList = () => {
  return useQuery({
    queryKey: ['user', 'myList'],
    queryFn: async () => {
      const { data } = await api.get('/list');
      return data.myList || [];
    },
    staleTime: 1 * 60 * 1000
  });
};

/**
 * Fetch user's active continue-watching items.
 */
export const useContinueWatching = () => {
  return useQuery({
    queryKey: ['user', 'continueWatching'],
    queryFn: async () => {
      const { data } = await api.get('/history');
      return data.history || [];
    },
    staleTime: 30 * 1000 // 30 seconds fresh duration for active viewing
  });
};

/**
 * Mutation hook to add an item to My List with optimistic cache invalidation.
 */
export const useAddToListMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (movieItem) => {
      const { data } = await api.post('/list', movieItem);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'myList'] });
    }
  });
};

/**
 * Mutation hook to remove an item from My List with cache invalidation.
 */
export const useRemoveFromListMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tmdbId) => {
      const { data } = await api.delete(`/list/${tmdbId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'myList'] });
    }
  });
};
