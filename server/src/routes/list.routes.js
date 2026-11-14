/**
 * @file list.routes.js
 * @description Routing endpoints for managing the user's personal My List watchlist.
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { addToList, removeFromList, getList } from '../controllers/list.controller.js';

const router = Router();

// Protect all list endpoints
router.use(authenticate);

/**
 * @route   GET /api/list
 * @desc    Get user's personal list
 */
router.get('/', getList);

/**
 * @route   POST /api/list
 * @desc    Add item to personal list
 */
router.post('/', addToList);

/**
 * @route   DELETE /api/list/:tmdbId
 * @desc    Remove item from personal list
 */
router.delete('/:tmdbId', removeFromList);

export default router;
