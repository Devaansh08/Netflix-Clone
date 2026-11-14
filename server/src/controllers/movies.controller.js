/**
 * @file movies.controller.js
 * @description Controllers for catalog browsing, categorization, search, details, and video trailer retrieval.
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Clean Architectural Layering: Controllers receive HTTP requests, parse query params, delegate to
 *    `tmdbService`, and wrap responses in the standardized `{ success: true, data }` format.
 * 2. Defensive Parameter Parsing: Explicitly parses `page` as integer and bounds it (`Math.max(1, ...)`),
 *    preventing NaN or negative values from propagating downstream to external APIs.
 * 3. Central Error Propagation: Delegates all service errors to Express `next(error)` so that centralized
 *    middleware formats the HTTP status and JSON response cleanly.
 */

import tmdbService from '../services/tmdbService.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * @route   GET /api/movies/trending
 * @desc    Get trending movies for the week
 * @access  Private
 */
export const getTrending = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const data = await tmdbService.getTrending(page);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/movies/top-rated
 * @desc    Get top rated movies
 * @access  Private
 */
export const getTopRated = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const data = await tmdbService.getTopRated(page);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/movies/popular
 * @desc    Get popular movies
 * @access  Private
 */
export const getPopular = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const data = await tmdbService.getPopular(page);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/movies/genre/:genreId
 * @desc    Get movies belonging to a specific TMDB genre ID
 * @access  Private
 */
export const getByGenre = async (req, res, next) => {
  try {
    const { genreId } = req.params;
    const page = Math.max(1, parseInt(req.query.page || '1', 10));

    if (!genreId) {
      return next(new AppError('Genre ID is required', 400));
    }

    const data = await tmdbService.getByGenre(genreId, page);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/movies/language/:languageCode
 * @desc    Get movies filtered by audio/original language (en, ja, ko, es, hi, fr)
 * @access  Public
 */
export const getByLanguage = async (req, res, next) => {
  try {
    const { languageCode } = req.params;
    const page = Math.max(1, parseInt(req.query.page || '1', 10));

    if (!languageCode) {
      return next(new AppError('Language code is required', 400));
    }

    const data = await tmdbService.getByLanguage(languageCode, page);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/movies/mature-18plus
 * @desc    Get 18+ adult / mature rated catalog items
 * @access  Public (Subject to client-side age confirmation policy)
 */
export const getMature18Plus = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const data = await tmdbService.getMature18Plus(page);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/movies/search?q=
 * @desc    Search movies by query string
 * @access  Private
 */
export const search = async (req, res, next) => {
  try {
    const query = req.query.q || '';
    const page = Math.max(1, parseInt(req.query.page || '1', 10));

    const data = await tmdbService.search(query, page);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/movies/:id
 * @desc    Get comprehensive details for a specific movie
 * @access  Private
 */
export const getDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(new AppError('Movie ID is required', 400));
    }

    const data = await tmdbService.getDetails(id);
    res.status(200).json({ success: true, movie: data });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/movies/:id/videos
 * @desc    Get official trailer keys for YouTube embedding
 * @access  Private
 */
export const getVideos = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(new AppError('Movie ID is required', 400));
    }

    const data = await tmdbService.getVideos(id);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};
