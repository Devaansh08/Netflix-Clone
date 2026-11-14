/**
 * @file history.controller.js
 * @description Controllers for recording video playback heartbeats and fetching "Continue Watching" feeds.
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Atomic Upsert (`findOneAndUpdate` with `upsert: true`):
 *    Video players dispatch periodic playback heartbeats (e.g. every 10 seconds). Performing an atomic upsert
 *    guarantees that subsequent heartbeats continuously update progress on the single existing record
 *    rather than attempting a `findOne` followed by an `insert/update`, which would cause write races under high concurrency.
 * 2. Completion Detection (95% Threshold):
 *    When `progressSeconds >= 0.95 * durationSeconds`, the media is flagged as `completed: true`.
 *    This mimics production streaming platforms (Netflix, Prime) that do not clutter the "Continue Watching"
 *    rail with items the user already finished through the credits.
 * 3. Bounded Fetching (`limit(20)` & `sort({ updatedAt: -1 })`):
 *    Restricting the history rail to the 20 most recent entries minimizes database memory load and UI payload size.
 */

import WatchHistory from '../models/WatchHistory.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * @route   PUT /api/history
 * @desc    Upsert playback progress for a movie
 * @access  Private
 */
export const updateProgress = async (req, res, next) => {
  try {
    const {
      tmdbId,
      title,
      posterPath,
      progressSeconds = 0,
      durationSeconds = 0
    } = req.body;

    if (!tmdbId || !title) {
      return next(new AppError('TMDB ID and title are required to record watch progress', 400));
    }

    const numericTmdbId = Number(tmdbId);
    const progress = Math.max(0, Number(progressSeconds));
    const duration = Math.max(0, Number(durationSeconds));
    
    // Consider movie completed if user watched 95% or more of total runtime
    const completed = duration > 0 ? progress >= 0.95 * duration : false;

    const historyRecord = await WatchHistory.findOneAndUpdate(
      {
        user: req.user._id,
        tmdbId: numericTmdbId
      },
      {
        $set: {
          title: title.trim(),
          posterPath: posterPath || null,
          progressSeconds: Math.floor(progress),
          durationSeconds: Math.floor(duration),
          completed
        }
      },
      {
        upsert: true, // Create record if not present, otherwise update existing
        returnDocument: 'after', // Return modified document (Mongoose modern standard)
        setDefaultsOnInsert: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Playback progress updated',
      history: historyRecord
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/history
 * @desc    Get the 20 most recent continue-watching items
 * @access  Private
 */
export const getHistory = async (req, res, next) => {
  try {
    const history = await WatchHistory.find({
      user: req.user._id,
      completed: false // Exclude items already completed to keep the continue-watching rail actionable
    })
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean();

    res.status(200).json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    next(error);
  }
};
