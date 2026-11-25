/**
 * @file Footer.jsx
 * @description Minimal, clean Apple/iOS-inspired cinema footer featuring
 * streamlined navigation, smooth back-to-top scroll, and simple "Devansh @2023" copyright.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import NetflixLogo from './NetflixLogo.jsx';

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-12 sm:mt-16 border-t border-white/10 bg-black/60 backdrop-blur-2xl px-4 sm:px-8 lg:px-14 py-8 sm:py-10 text-neutral-400 text-xs rounded-b-[24px] sm:rounded-b-[36px] select-none transition-all">
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-between gap-6 sm:gap-8">
        
        {/* Top: Brand Logo & Minimal Nav Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4 sm:gap-6 border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="group transition-transform active:scale-95" aria-label="Netflix Home">
              <NetflixLogo className="h-6 sm:h-7 w-auto drop-shadow-[0_2px_10px_rgba(229,9,20,0.6)]" />
            </Link>
          </div>

          {/* Minimal Quick Links */}
          <nav className="flex flex-wrap items-center justify-center gap-5 sm:gap-7 text-xs font-medium text-neutral-400">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/?category=movies" className="hover:text-white transition-colors">
              Movies
            </Link>
            <Link to="/?category=tv" className="hover:text-white transition-colors">
              TV Series
            </Link>
            <Link to="/my-list" className="hover:text-white transition-colors">
              My List
            </Link>
            <Link to="/search" className="hover:text-white transition-colors">
              Search
            </Link>
          </nav>

          {/* Minimal Smooth Back-to-Top Button */}
          <button
            onClick={scrollToTop}
            aria-label="Scroll back to top"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white border border-white/10 hover:border-white/20 transition-all cursor-pointer shadow-sm active:scale-95 group"
          >
            <ArrowUp className="h-4 w-4 text-neutral-400 group-hover:text-white group-hover:-translate-y-0.5 transition-all" />
          </button>
        </div>

        {/* Bottom: Simple Minimal Copyright: Devansh @2023 */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full text-center sm:text-left gap-2 text-[11px] text-neutral-400">
          <p className="tracking-wide font-medium text-neutral-300">
            Devansh @2023
          </p>
          <p className="text-[10px] text-neutral-500">
            Minimal iOS design • Responsive for mobile, tablet & desktop
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
