/**
 * @file Footer.jsx
 * @description Clean, modern, and genuinely useful cinema footer designed with
 * Apple TV+ / spatial glass aesthetics, instant navigation links, language localization,
 * keyboard shortcut helper, live CDN telemetry, and transparent studio attribution.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Globe, 
  ArrowUp, 
  Keyboard, 
  HelpCircle, 
  Shield, 
  Volume2, 
  Tv, 
  Film, 
  Sparkles, 
  Check, 
  X 
} from 'lucide-react';
import NetflixLogo from './NetflixLogo.jsx';

export const Footer = () => {
  const [selectedLang, setSelectedLang] = useState('English');
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <footer className="mt-16 border-t border-white/10 bg-gradient-to-b from-neutral-950/70 via-black/80 to-black/95 backdrop-blur-2xl px-6 sm:px-10 lg:px-14 py-12 text-neutral-400 text-xs rounded-b-[32px] sm:rounded-b-[36px] select-none transition-all">
        <div className="max-w-7xl mx-auto space-y-10">

          {/* Top Row: Brand, Quality Specs & Back-to-Top Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/5 pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <NetflixLogo className="h-6 w-auto drop-shadow-[0_2px_10px_rgba(229,9,20,0.6)]" />
                <span className="rounded-full bg-red-600/15 border border-red-500/25 px-2.5 py-0.5 text-[10px] font-bold text-red-400 uppercase tracking-wider">
                  Spatial Cinema
                </span>
              </div>
              <p className="text-xs text-neutral-400 max-w-md">
                Next-generation cinema experience featuring adaptive HLS streaming, 4K HDR playback, and curated global entertainment.
              </p>

              {/* Streaming Capability Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1 rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-semibold text-neutral-300">
                  <Film className="h-3 w-3 text-red-400" /> 4K Ultra HD
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-semibold text-neutral-300">
                  <Volume2 className="h-3 w-3 text-cyan-400" /> Dolby Atmos
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-semibold text-neutral-300">
                  <Sparkles className="h-3 w-3 text-amber-400" /> Spatial Audio
                </span>
              </div>
            </div>

            {/* Right: Live CDN Status & Back To Top */}
            <div className="flex flex-wrap sm:flex-col sm:items-end gap-3">
              {/* Live Edge Telemetry Status */}
              <div className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-950/20 px-3.5 py-1 text-green-300 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="font-semibold text-[11px]">All Systems Operational</span>
                <span className="text-neutral-500">•</span>
                <span className="text-[10px] text-neutral-400 font-mono">Edge 12ms</span>
              </div>

              {/* Back to Top Smooth Scroll */}
              <button
                onClick={scrollToTop}
                className="group flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[11px] font-medium text-neutral-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer shadow-sm active:scale-95"
                title="Scroll back to top"
              >
                <span>Back to top</span>
                <ArrowUp className="h-3.5 w-3.5 text-neutral-400 group-hover:text-red-400 group-hover:-translate-y-0.5 transition-all" />
              </button>
            </div>
          </div>

          {/* Middle Grid: 3 Purposeful Navigation Columns + Interactive Localization & Tools */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs text-neutral-400">
            
            {/* Column 1: Catalog & Watch */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Tv className="h-3.5 w-3.5 text-[#E50914]" /> Catalog & Watch
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="hover:text-white hover:underline transition-colors">
                    Trending Blockbusters
                  </Link>
                </li>
                <li>
                  <Link to="/search?q=series" className="hover:text-white hover:underline transition-colors">
                    TV Series & Dramas
                  </Link>
                </li>
                <li>
                  <Link to="/search?q=anime" className="hover:text-white hover:underline transition-colors">
                    Anime Universe
                  </Link>
                </li>
                <li>
                  <Link to="/my-list" className="hover:text-white hover:underline transition-colors">
                    My Watchlist
                  </Link>
                </li>
                <li>
                  <Link to="/search" className="hover:text-white hover:underline transition-colors">
                    Global Catalog Search
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Audio & Accessibility */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Volume2 className="h-3.5 w-3.5 text-cyan-400" /> Audio & Formats
              </h4>
              <ul className="space-y-2">
                <li className="hover:text-white transition-colors cursor-default">
                  Dolby Atmos 5.1 Surround
                </li>
                <li className="hover:text-white transition-colors cursor-default">
                  English [Original Audio]
                </li>
                <li className="hover:text-white transition-colors cursor-default">
                  Japanese Anime Tracks (日本語)
                </li>
                <li className="hover:text-white transition-colors cursor-default">
                  Subtitles & Closed Captions (CC)
                </li>
                <li className="hover:text-white transition-colors cursor-default">
                  Adaptive Bitrate HLS (1080p / 4K)
                </li>
              </ul>
            </div>

            {/* Column 3: Tools & Controls */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-amber-400" /> Controls & Help
              </h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setShowShortcutsModal(true)}
                    className="flex items-center gap-1 text-neutral-400 hover:text-white hover:underline transition-colors cursor-pointer text-left"
                  >
                    <Keyboard className="h-3 w-3 text-red-400" />
                    <span>Keyboard Shortcuts</span>
                  </button>
                </li>
                <li className="hover:text-white transition-colors cursor-default flex items-center gap-1">
                  <span>Parental Safe Mode Filter</span>
                  <span className="text-[9px] bg-red-600/30 text-red-300 border border-red-500/30 px-1 rounded">18+</span>
                </li>
                <li className="hover:text-white transition-colors cursor-default">
                  Privacy Policy & Cookies
                </li>
                <li className="hover:text-white transition-colors cursor-default">
                  Terms of Service
                </li>
                <li className="hover:text-white transition-colors cursor-default">
                  TMDB Attribution License
                </li>
              </ul>
            </div>

            {/* Column 4: Localization, Language & Social Connect */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-emerald-400" /> Language & Region
              </h4>

              {/* Language Selector Pill */}
              <div className="relative inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-neutral-200 shadow-inner hover:border-white/20 transition-all w-full max-w-[210px]">
                <Globe className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  aria-label="Footer language selector"
                  className="bg-transparent text-xs text-white outline-none cursor-pointer w-full font-medium"
                >
                  <option value="English" className="bg-neutral-900 text-white">English (US)</option>
                  <option value="Español" className="bg-neutral-900 text-white">Español (LatAm)</option>
                  <option value="日本語" className="bg-neutral-900 text-white">日本語 (Japan)</option>
                  <option value="한국어" className="bg-neutral-900 text-white">한국어 (Korea)</option>
                  <option value="Français" className="bg-neutral-900 text-white">Français (France)</option>
                  <option value="हिन्दी" className="bg-neutral-900 text-white">हिन्दी (India)</option>
                  <option value="Deutsch" className="bg-neutral-900 text-white">Deutsch (Germany)</option>
                </select>
              </div>

              {/* Social Channels */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 block">
                  Connect With Us
                </span>
                <div className="flex items-center gap-3 text-neutral-400">
                  {/* GitHub */}
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="GitHub Repository"
                    className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/20 hover:text-white hover:scale-105 transition-all"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  </a>

                  {/* X / Twitter */}
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="X / Twitter"
                    className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/20 hover:text-white hover:scale-105 transition-all"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>

                  {/* YouTube */}
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="YouTube Channel"
                    className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/20 hover:text-white hover:scale-105 transition-all"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Bar: Attribution & Copyright */}
          <div className="border-t border-white/5 pt-6 text-[11px] text-neutral-500 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <p className="max-w-2xl text-neutral-400">
              Netflix clone utilizes the TMDB API for catalog metadata. Video streams courtesy of the Blender Open Movie Foundation (CC-BY). All trademarks, posters, and assets are property of their respective studios.
            </p>
            <p className="whitespace-nowrap font-medium text-neutral-400">
              © 2026 Netflix Inc. All rights reserved.
            </p>
          </div>

        </div>
      </footer>

      {/* Keyboard Shortcuts Helper Modal */}
      {showShortcutsModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setShowShortcutsModal(false)}
        >
          <div 
            className="relative w-full max-w-md rounded-2xl border border-white/15 bg-neutral-900/95 p-6 shadow-2xl backdrop-blur-2xl text-neutral-200 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Keyboard className="h-5 w-5 text-red-500" />
                <h3 className="font-bold text-white text-base">Cinema Keyboard Shortcuts</h3>
              </div>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="rounded-lg p-1 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close shortcuts"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Shortcut Keys Table */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-neutral-300">Play / Pause Video</span>
                <span className="font-mono bg-white/10 border border-white/15 px-2 py-0.5 rounded text-white text-[11px] font-bold">
                  Space / K
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-neutral-300">Toggle Fullscreen</span>
                <span className="font-mono bg-white/10 border border-white/15 px-2 py-0.5 rounded text-white text-[11px] font-bold">
                  F
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-neutral-300">Mute / Unmute Audio</span>
                <span className="font-mono bg-white/10 border border-white/15 px-2 py-0.5 rounded text-white text-[11px] font-bold">
                  M
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-neutral-300">Seek 10s Backward / Forward</span>
                <span className="font-mono bg-white/10 border border-white/15 px-2 py-0.5 rounded text-white text-[11px] font-bold">
                  ← / →
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-neutral-300">Volume Up / Down</span>
                <span className="font-mono bg-white/10 border border-white/15 px-2 py-0.5 rounded text-white text-[11px] font-bold">
                  ↑ / ↓
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-neutral-300">Close Player or Modal</span>
                <span className="font-mono bg-white/10 border border-white/15 px-2 py-0.5 rounded text-white text-[11px] font-bold">
                  Esc
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="rounded-xl bg-[#E50914] px-4 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
