/**
 * @file notifications.routes.js
 * @description API endpoints for real-time user alerts, releases, and platform updates.
 */

import express from 'express';

const router = express.Router();

const SYSTEM_NOTIFICATIONS = [
  {
    id: 'notif-1',
    tmdbId: 60574,
    title: 'Peaky Blinders — Season 5 Streaming Now',
    message: 'Tommy Shelby returns to Birmingham. All episodes are now live in 4K Ultra HD with Spatial Audio.',
    category: 'releases',
    badge: 'New Season',
    badgeColor: 'bg-[#E50914] text-white',
    time: '12m ago',
    image: 'https://image.tmdb.org/t/p/w500/vUUqzWa2LnHIVqkaKVlVGkVcZIW.jpg',
    read: false,
    actionUrl: '/watch/60574'
  },
  {
    id: 'notif-2',
    tmdbId: 48891,
    title: 'Brooklyn Nine-Nine in Popcorn Mania',
    message: 'Nine-Nine! All 7 seasons of comedy brilliance added to your personal spotlight.',
    category: 'releases',
    badge: 'Trending Series',
    badgeColor: 'bg-amber-500 text-black',
    time: '1h ago',
    image: 'https://upload.wikimedia.org/wikipedia/en/7/7b/Brooklyn_Nine-Nine_season_7_poster.jpg',
    read: false,
    actionUrl: '/watch/48891'
  },
  {
    id: 'notif-3',
    tmdbId: 512195,
    title: 'Resume Watching: Red Notice',
    message: 'You have 1h 12m remaining. Jump back into the high-stakes heist right where you paused.',
    category: 'activity',
    badge: 'Continue Watching',
    badgeColor: 'bg-cyan-500 text-black',
    time: '3h ago',
    image: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
    read: false,
    actionUrl: '/watch/512195'
  },
  {
    id: 'notif-4',
    tmdbId: 333339,
    title: 'Ready Player One Remastered in 4K',
    message: 'Steven Spielberg’s virtual reality masterpiece is now unlocked in Dolby Vision.',
    category: 'releases',
    badge: '4K Premiere',
    badgeColor: 'bg-emerald-500 text-black',
    time: '6h ago',
    image: 'https://image.tmdb.org/t/p/w500/pU1j1NuU8w0691WzC4qU2qL3nFz.jpg',
    read: true,
    actionUrl: '/watch/333339'
  },
  {
    id: 'notif-5',
    title: 'Spatial Audio & Live Official Previews Active',
    message: 'Your player engine has been upgraded to StreamVerse 2.5 with official studio video pairing.',
    category: 'system',
    badge: 'System Update',
    badgeColor: 'bg-neutral-700 text-white',
    time: 'Yesterday',
    read: true,
    actionUrl: null
  }
];

/**
 * @route   GET /api/notifications
 * @desc    Get active catalog releases and user notifications
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    total: SYSTEM_NOTIFICATIONS.length,
    unreadCount: SYSTEM_NOTIFICATIONS.filter((n) => !n.read).length,
    notifications: SYSTEM_NOTIFICATIONS
  });
});

/**
 * @route   POST /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Public
 */
router.post('/read-all', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

export default router;
