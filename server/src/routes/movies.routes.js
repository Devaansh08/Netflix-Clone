/**
 * @file movies.routes.js
 * @description Catalog endpoints for fetching categorized movie feeds, search results, and trailers.
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Uniform Guarding with `router.use(authenticate)`:
 *    Applying `router.use(authenticate)` at the router level ensures every endpoint in the movie catalog
 *    is strictly guarded against unauthenticated access without needing to repeat the middleware on every route.
 * 2. Static Route Precedence:
 *    Static endpoints like `/trending`, `/top-rated`, `/popular`, and `/search` are defined BEFORE
 *    the parameterized route `/:id`. In Express, if `/:id` were declared first, a request to `/trending`
 *    would wrongly bind `req.params.id = 'trending'`.
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getTrending,
  getTopRated,
  getPopular,
  getByGenre,
  search,
  getDetails,
  getVideos
} from '../controllers/movies.controller.js';

const router = Router();

// Enforce authentication across all movie catalog endpoints
router.use(authenticate);

// HTTP Caching Headers: Allows browser and edge proxy caching for 5 minutes
router.use((req, res, next) => {
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
  }
  next();
});

// Specific collection routes (Must come before /:id)
router.get('/trending', getTrending);
router.get('/top-rated', getTopRated);
router.get('/popular', getPopular);
router.get('/genre/:genreId', getByGenre);
router.get('/search', search);

// Dynamic item routes
router.get('/:id', getDetails);
router.get('/:id/videos', getVideos);

export default router;
