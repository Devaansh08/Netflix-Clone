/**
 * @file list.controller.js
 * @description Controllers for managing the user's personal watchlist ("My List").
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Atomic `$push` with `$ne` Predicate (Race Condition Prevention):
 *    Using `{ _id: req.user._id, 'myList.tmdbId': { $ne: tmdbId } }` ensures that even under concurrent
 *    network requests, MongoDB's atomic write lock guarantees an item cannot be inserted twice.
 * 2. Positional Prepend (`$position: 0`):
 *    Prepending newly bookmarked items to index 0 ensures the most recently added movies appear first
 *    on the user's row without requiring client-side sorting.
 * 3. Atomic `$pull` for Deletion:
 *    Removing items via `$pull: { myList: { tmdbId } }` executes in a single atomic database operation
 *    without fetching the entire document into Node memory first.
 */

import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * @route   POST /api/list
 * @desc    Add a movie or show to user's My List
 * @access  Private
 */
export const addToList = async (req, res, next) => {
  try {
    const { tmdbId, mediaType = 'movie', title, posterPath } = req.body;

    if (!tmdbId || !title) {
      return next(new AppError('TMDB ID and title are required to add to My List', 400));
    }

    const numericTmdbId = Number(tmdbId);

    // Atomically push to beginning of array if tmdbId is not already present
    const result = await User.updateOne(
      {
        _id: req.user._id,
        'myList.tmdbId': { $ne: numericTmdbId } // Only update if tmdbId does NOT exist in myList
      },
      {
        $push: {
          myList: {
            $each: [{
              tmdbId: numericTmdbId,
              mediaType: mediaType === 'tv' ? 'tv' : 'movie',
              title: title.trim(),
              posterPath: posterPath || null,
              addedAt: new Date()
            }],
            $position: 0 // Place newly added item at the front of the list
          }
        }
      }
    );

    // Fetch the updated list for the user
    const updatedUser = await User.findById(req.user._id).select('myList');

    res.status(200).json({
      success: true,
      message: result.modifiedCount > 0 ? 'Added to My List' : 'Item is already in My List',
      myList: updatedUser.myList
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/list/:tmdbId
 * @desc    Remove an item from user's My List
 * @access  Private
 */
export const removeFromList = async (req, res, next) => {
  try {
    const { tmdbId } = req.params;
    if (!tmdbId) {
      return next(new AppError('TMDB ID is required', 400));
    }

    const numericTmdbId = Number(tmdbId);

    // Atomically pull matching item from myList array
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: {
          myList: { tmdbId: numericTmdbId }
        }
      },
      { returnDocument: 'after', select: 'myList' }
    );

    res.status(200).json({
      success: true,
      message: 'Removed from My List',
      myList: updatedUser.myList
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/list
 * @desc    Get all items saved in user's My List
 * @access  Private
 */
export const getList = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('myList');
    res.status(200).json({
      success: true,
      count: user.myList.length,
      myList: user.myList
    });
  } catch (error) {
    next(error);
  }
};
