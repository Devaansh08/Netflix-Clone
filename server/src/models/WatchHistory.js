/**
 * @file WatchHistory.js
 * @description Mongoose model for tracking video playback progress and continue-watching feeds.
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Compound Unique Index `{ user: 1, tmdbId: 1 }`:
 *    Enforcing a compound unique index at the database layer prevents race conditions where rapid,
 *    concurrent video heartbeat events could insert duplicate history records for the same movie.
 * 2. Dedicated Collection vs Embedded User Document:
 *    Unlike `myList` (which is typically capped at hundreds of items), watch history grows continuously
 *    with every media item a user previews or watches. Keeping history in a separate collection prevents
 *    violating MongoDB's 16MB document size limit (BSON document cap) and keeps user session documents lightweight.
 * 3. Sorting and Indexing:
 *    Indexing `updatedAt: -1` along with `user: 1` enables fast, indexed queries for "Continue Watching"
 *    without requiring in-memory collection scans.
 */

import mongoose from 'mongoose';

const WatchHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    index: true
  },
  tmdbId: {
    type: Number,
    required: [true, 'TMDB ID is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  posterPath: {
    type: String,
    default: null
  },
  progressSeconds: {
    type: Number,
    default: 0,
    min: 0
  },
  durationSeconds: {
    type: Number,
    default: 0,
    min: 0
  },
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Automatically tracks createdAt and updatedAt
});

// Ensure a user has at most ONE progress record per media item
WatchHistorySchema.index({ user: 1, tmdbId: 1 }, { unique: true });

// Optimize "Continue Watching" query sorting by most recently watched
WatchHistorySchema.index({ user: 1, updatedAt: -1 });

export const WatchHistory = mongoose.model('WatchHistory', WatchHistorySchema);
export default WatchHistory;
