/**
 * @file NotificationCenter.jsx
 * @description Apple VisionOS & Netflix inspired interactive Notification System.
 * Features live alert badges, categorized filtering (Releases, Activity, System),
 * 1-click playback routing, individual dismissal, mark-as-read, and localStorage persistence.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  X, 
  Play, 
  Sparkles, 
  Flame, 
  Clock, 
  Trash2, 
  Tv, 
  Film, 
  ShieldCheck,
  Check
} from 'lucide-react';
import SafeImage from './SafeImage.jsx';
import api from '../api/axios.js';

const STORAGE_KEY = 'streamverse_notifications_v2';

const DEFAULT_NOTIFICATIONS = [
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

export const NotificationCenter = ({ onSelectMovie = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'releases' | 'activity' | 'system'
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse notifications from localStorage:', e);
    }
    return DEFAULT_NOTIFICATIONS;
  });

  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Persist notifications on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.warn('Failed to persist notifications to localStorage:', e);
    }
  }, [notifications]);

  // Fetch real-time server notification updates
  useEffect(() => {
    let isMounted = true;
    const fetchLatest = async () => {
      try {
        const { data } = await api.get('/notifications');
        if (isMounted && data.notifications && Array.isArray(data.notifications)) {
          setNotifications((prev) => {
            const readMap = new Map(prev.map((n) => [n.id, n.read]));
            const merged = data.notifications.map((n) => ({
              ...n,
              read: readMap.has(n.id) ? readMap.get(n.id) : n.read
            }));
            return merged.length > 0 ? merged : prev;
          });
        }
      } catch (err) {
        // Fallback cleanly to local notifications
      }
    };
    fetchLatest();
    return () => {
      isMounted = false;
    };
  }, []);

  // Click outside and Escape key handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismissNotification = (id, e) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id);
    setIsOpen(false);

    if (notif.tmdbId && onSelectMovie) {
      onSelectMovie({
        id: notif.tmdbId,
        title: notif.title.split('—')[0].replace('Resume Watching:', '').trim(),
        posterPath: notif.image,
        backdropPath: notif.image
      });
    } else if (notif.actionUrl) {
      navigate(notif.actionUrl);
    }
  };

  const handleWatchDirect = (notif, e) => {
    e.stopPropagation();
    markAsRead(notif.id);
    setIsOpen(false);
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
    }
  };

  // Filtered notifications
  const filtered = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    return n.category === activeFilter;
  });

  return (
    <div ref={menuRef} className="relative select-none">
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
        title="View Notifications"
        className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition-all cursor-pointer ${
          isOpen
            ? 'bg-[#E50914] text-white border-red-500 shadow-lg shadow-red-950/60 scale-105'
            : 'bg-white/5 hover:bg-white/15 border-white/10 text-neutral-300 hover:text-white active:scale-95'
        }`}
      >
        <Bell className="h-4 w-4" />

        {/* Live Glowing Unread Notification Indicator */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E50914] px-1 text-[9px] font-black text-white ring-2 ring-black shadow-lg shadow-red-600 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Floating Notifications Dropdown Panel (Apple VisionOS / Netflix Glass) */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-neutral-900/95 backdrop-blur-2xl border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.95)] z-50 text-white overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600/20 text-[#E50914]">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-[#E50914] px-2 py-0.2 text-[9px] font-black uppercase text-white shadow-sm">
                      {unreadCount} New
                    </span>
                  )}
                </h3>
              </div>
            </div>

            {/* Actions: Mark all as read */}
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                title="Mark all notifications as read"
                className="flex items-center gap-1 text-[11px] font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <CheckCheck className="h-3.5 w-3.5 text-green-400" />
                <span className="hidden sm:inline">Mark read</span>
              </button>
            )}
          </div>

          {/* Categorized Filter Tabs */}
          <div className="flex items-center gap-1.5 p-2 px-3 border-b border-white/5 bg-black/20 overflow-x-auto no-scrollbar text-[11px] font-bold">
            {[
              { id: 'all', label: 'All' },
              { id: 'releases', label: 'Releases' },
              { id: 'activity', label: 'Activity' },
              { id: 'system', label: 'System' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`rounded-full px-2.5 py-1 transition-all cursor-pointer whitespace-nowrap ${
                  activeFilter === tab.id
                    ? 'bg-white text-black shadow-md font-extrabold'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notification List Body */}
          <div className="max-h-96 overflow-y-auto no-scrollbar divide-y divide-white/5">
            {filtered.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-white/5 text-neutral-500">
                  <ShieldCheck className="h-6 w-6 text-green-400" />
                </div>
                <p className="text-xs font-bold text-white">You're all caught up!</p>
                <p className="text-[11px] text-neutral-400 max-w-xs mx-auto">
                  No new alerts in this section. New releases and continue-watching updates will appear here.
                </p>
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`group relative flex items-start gap-3 p-3.5 transition-colors cursor-pointer ${
                    item.read
                      ? 'bg-transparent hover:bg-white/5 opacity-80 hover:opacity-100'
                      : 'bg-red-950/20 hover:bg-red-950/35 border-l-2 border-[#E50914]'
                  }`}
                >
                  {/* Thumbnail / Icon */}
                  {item.image ? (
                    <div className="relative h-14 w-12 sm:w-14 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-950 border border-white/10 shadow">
                      <SafeImage
                        src={item.image}
                        alt={item.title}
                        aspectRatio="aspect-[2/3]"
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-neutral-800 text-neutral-300 border border-white/10">
                      <Sparkles className="h-5 w-5 text-amber-400" />
                    </div>
                  )}

                  {/* Text Content */}
                  <div className="flex-1 min-w-0 pr-5">
                    <div className="flex items-center gap-1.5 mb-1">
                      {item.badge && (
                        <span className={`rounded-full px-2 py-0.2 text-[8px] sm:text-[9px] font-black uppercase tracking-wider ${item.badgeColor || 'bg-neutral-800 text-white'}`}>
                          {item.badge}
                        </span>
                      )}
                      <span className="text-[10px] text-neutral-400 flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {item.time}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors leading-snug line-clamp-1">
                      {item.title}
                    </h4>

                    <p className="text-[11px] text-neutral-300 line-clamp-2 mt-0.5 leading-relaxed">
                      {item.message}
                    </p>

                    {/* Quick Watch Action Button */}
                    {item.actionUrl && (
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={(e) => handleWatchDirect(item, e)}
                          className="flex items-center gap-1.5 rounded-lg bg-white/15 hover:bg-[#E50914] text-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition-all shadow-sm hover:scale-105"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>Stream</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Dismiss Individual Button */}
                  <button
                    onClick={(e) => dismissNotification(item.id, e)}
                    aria-label="Dismiss notification"
                    title="Dismiss"
                    className="absolute top-3 right-3 text-neutral-500 hover:text-white p-1 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Bar */}
          {notifications.length > 0 && (
            <div className="p-2.5 px-4 border-t border-white/10 bg-black/40 flex items-center justify-between text-[11px]">
              <span className="text-neutral-400 font-medium">
                {notifications.length} total alert{notifications.length > 1 ? 's' : ''}
              </span>

              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-red-400 hover:text-red-300 font-bold transition-colors cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
                <span>Clear all</span>
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
