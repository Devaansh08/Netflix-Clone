/**
 * @file history.routes.js
 * @description Routing endpoints for recording playback progress and fetching continue-watching data.
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { updateProgress, getHistory } from '../controllers/history.controller.js';

const router = Router();

// Protect all history endpoints
router.use(authenticate);

/**
 * @route   GET /api/history
 * @desc    Get user's recent continue watching items
 */
router.get('/', getHistory);

/**
 * @route   PUT /api/history
 * @desc    Upsert playback progress for media
 */
router.put('/', updateProgress);

export default router;
