/**
 * @file Footer.jsx
 * @description Enterprise-grade Apple TV+ / Netflix cinema footer featuring multi-column navigation,
 * interactive language selector, live system telemetry, diagnostics code generator, and 18+ compliance disclosures.
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Legal & Regulatory Compliance (MPAA / BBFC Standards):
 *    Streaming services must prominently surface terms, parental rating policies, and third-party attribution.
 * 2. Enterprise Telemetry & Diagnostics:
 *    Simulates real-world production support with a live CDN status indicator and a diagnostic Service Code generator.
 * 3. Accessibility & Global Localization:
 *    Supports multi-language selection, audio description notices, and high-contrast text ratios conforming to WCAG AA.
 */

import React, { useState } from 'react';
import { 
  Globe, 
  ShieldAlert, 
  Activity, 
  Headphones, 
  Tv, 
  HelpCircle, 
  CheckCircle2, 
  Copy
} from 'lucide-react';

export const Footer = () => {
  const [selectedLang, setSelectedLang] = useState('English');
  const [serviceCode, setServiceCode] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const generateServiceCode = () => {
    const randomCode = `SV-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100 + Math.random() * 900)}`;
    setServiceCode(randomCode);
    setCopiedCode(false);
  };

  const copyServiceCode = () => {
    if (serviceCode) {
      navigator.clipboard?.writeText(serviceCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  return (
    <footer className="mt-28 border-t border-neutral-800/80 bg-gradient-to-b from-neutral-950 via-black to-black px-6 sm:px-12 md:px-20 py-16 text-neutral-400 text-xs select-none">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Top Header Bar: Brand Mark, Telemetry Status, 24/7 Helpline */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-800/80 pb-8">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="text-xl font-black tracking-tighter text-white">
                STREAM<span className="text-[#E50914]">VERSE</span>
              </span>
              <span className="rounded-full bg-red-600/10 border border-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400 uppercase tracking-widest">
                Cinema Edition
              </span>
            </div>
            <p className="text-xs text-neutral-400 max-w-md">
              Next-generation streaming experience with Apple TV glass aesthetics, adaptive HLS playback, and TMDB intelligence.
            </p>
          </div>

          {/* System Telemetry & Live Support */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            {/* Live System Status Indicator */}
            <div className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-950/30 px-3 py-1.5 text-green-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="font-semibold text-[11px]">All Systems Operational</span>
              <span className="text-neutral-500">•</span>
              <span className="text-[10px] text-neutral-400">CDN Edge: 12ms</span>
            </div>

            {/* Helpline */}
            <div className="flex items-center gap-2 text-neutral-300">
              <Headphones className="h-4 w-4 text-red-500" />
              <span>24/7 Care:</span>
              <a href="tel:1800787326" className="font-bold text-white hover:underline hover:text-red-400 transition-colors">
                1-800-STREAMVERSE
              </a>
            </div>
          </div>
        </div>

        {/* 5-Column Navigation Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 text-xs leading-relaxed text-neutral-400">
          
          {/* Column 1: Explore & Categories */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-200">
              Explore & Stream
            </h4>
            <ul className="space-y-2">
              <li className="hover:text-white hover:underline cursor-pointer transition-colors">Trending Blockbusters</li>
              <li className="hover:text-white hover:underline cursor-pointer transition-colors">Top 10 Today</li>
              <li className="hover:text-white hover:underline cursor-pointer transition-colors">Anime Universe</li>
              <li className="hover:text-white hover:underline cursor-pointer transition-colors">18+ Mature Action</li>
              <li className="hover:text-white hover:underline cursor-pointer transition-colors">Sci-Fi & Cyberpunk</li>
              <li className="hover:text-white hover:underline cursor-pointer transition-colors">Award Winners</li>
            </ul>
          </div>

          {/* Column 2: Audio & Localization */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-200">
              Audio & Languages
            </h4>
            <ul className="space-y-2">
              <li className="hover:text-white hover:underline cursor-pointer transition-colors">English Audio [Original]</li>
              <li className="hover:text-white hover:underline cursor-pointer transition-colors">Japanese Anime (日本語)</li>
              <li className="hover:text-white hover:underline cursor-pointer transition-colors">Korean Cinema (한국어)</li>
              <li className="hover:text-white hover:underline cursor-pointer transition-colors">Spanish Tracks (Español)</li>
              <li className="hover:text-white hover:underline cursor-pointer transition-colors">Subtitles & Closed Captions</li>
              <li className="hover:text-white hover:underline cursor-pointer transition-colors">Dolby Atmos Spatial Audio</li>
            </ul>
          </div>

          {/* Column 3: Tech & Experience */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-200">
              Technology & Specs
            </h4>
            <ul className="space-y-2">
              <li className="hover:text-white hover:underline cursor-pointer transition-colors">Adaptive HLS Streaming</li>
              <li className="hover:text-white hover:underline cursor-pointer transition-colors">Apple TV Glass UI</li>
              <li className="hover:text-white hover:underline cursor-pointer transition-colors">Instant Hover Previews</li>
              <li className="hover:text-white hover:underline cursor-pointer transition-colors">Mobile Intersection Autoplay</li>
              <li className="hover:text-white hover:underline cursor-pointer transition-colors">MERN Stack Architecture</li>
              <li className="hover:text-white hover:underline cursor-pointer transition-colors">Central Central Error Handling</li>
            </ul>
          </div>

          {/* Column 4: Help & Support */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-200">
              Support & Tools
            </h4>
            <ul className="space-y-2">
              <li className="hover:text-white hover:underline cursor-pointer transition-colors">Help Center & FAQ</li>
              <li className="hover:text-white hover:underline cursor-pointer transition-colors">Account & Billing</li>
              <li className="hover:text-white hover:underline cursor-pointer transition-colors">Network Speed Test</li>
              <li className="hover:text-white hover:underline cursor-pointer transition-colors">Supported Smart TVs</li>
              <li className="hover:text-white hover:underline cursor-pointer transition-colors">Redeem Gift Card</li>
              <li className="hover:text-white hover:underline cursor-pointer transition-colors">Engineering Careers</li>
            </ul>
          </div>

          {/* Column 5: Compliance & Legal */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-200">
              Policies & Legal
            </h4>
            <ul className="space-y-2">
              <li className="hover:text-white hover:underline cursor-pointer transition-colors">18+ Age Policy & Gate</li>
              <li className="hover:text-white hover:underline cursor-pointer transition-colors">Parental Safe Mode</li>
              <li className="hover:text-white hover:underline cursor-pointer transition-colors">Terms of Service</li>
              <li className="hover:text-white hover:underline cursor-pointer transition-colors">Privacy Notice</li>
              <li className="hover:text-white hover:underline cursor-pointer transition-colors">Cookie Preferences</li>
              <li className="hover:text-white hover:underline cursor-pointer transition-colors">TMDB Attribution</li>
            </ul>
          </div>
        </div>

        {/* Regulatory 18+ Advisory Banner */}
        <div className="rounded-2xl border border-red-900/40 bg-gradient-to-r from-red-950/30 via-neutral-900/60 to-black p-5 text-xs text-neutral-300 leading-relaxed flex items-start gap-4">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-red-600/20 text-red-500 border border-red-500/30">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-red-400 uppercase tracking-wide">
                Regulatory Content Advisory & 18+ Parental Guidelines:
              </span>
              <span className="rounded bg-red-600 px-1.5 py-0.2 text-[9px] font-black text-white">
                STRICT
              </span>
            </div>
            <p className="text-neutral-400 text-[11px]">
              StreamVerse strictly enforces regional maturity classifications (MPAA, BBFC, TV-MA). Titles flagged with 18+ or R ratings are intended exclusively for verified adult audiences. Content contains mature themes, graphic action, or intense psychological drama. Safe Mode can be activated at any time from the top navigation bar to restrict adult content.
            </p>
          </div>
        </div>

        {/* Diagnostics Bar, Language Selector, and Socials */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-t border-neutral-800/80 pt-8">
          
          {/* Language Selector Pill */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative inline-flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900/90 px-3.5 py-2 text-neutral-200 shadow-inner">
              <Globe className="h-4 w-4 text-neutral-400" />
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                aria-label="Footer language selector"
                className="bg-transparent text-xs text-white outline-none cursor-pointer pr-3 font-medium"
              >
                <option value="English" className="bg-neutral-900">English (United States)</option>
                <option value="Español" className="bg-neutral-900">Español (España & LatAm)</option>
                <option value="日本語" className="bg-neutral-900">日本語 (Japan)</option>
                <option value="한국어" className="bg-neutral-900">한국어 (South Korea)</option>
                <option value="Français" className="bg-neutral-900">Français (France)</option>
                <option value="हिन्दी" className="bg-neutral-900">हिन्दी (India)</option>
              </select>
            </div>

            {/* Diagnostic Service Code Generator */}
            <div className="flex items-center gap-2">
              <button
                onClick={generateServiceCode}
                className="rounded-xl border border-neutral-700 bg-neutral-900/90 px-3.5 py-2 text-xs font-semibold text-neutral-300 hover:text-white hover:border-neutral-500 transition-all cursor-pointer"
              >
                {serviceCode ? 'Refresh Service Code' : 'Generate Service Code'}
              </button>

              {serviceCode && (
                <div 
                  onClick={copyServiceCode}
                  title="Click to copy diagnostic code"
                  className="flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-950/20 px-3 py-1.5 text-xs font-mono font-bold text-red-300 cursor-pointer hover:bg-red-950/40 transition-colors"
                >
                  <span>{serviceCode}</span>
                  {copiedCode ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5 text-neutral-400" />}
                </div>
              )}
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4 text-neutral-400">
            <span className="text-[11px] text-neutral-500">Connect:</span>
            {/* GitHub */}
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer" 
              aria-label="GitHub Repository" 
              className="hover:text-white hover:scale-110 transition-all p-1"
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
              className="hover:text-white hover:scale-110 transition-all p-1"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* Instagram */}
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noreferrer" 
              aria-label="Instagram" 
              className="hover:text-white hover:scale-110 transition-all p-1"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>

            {/* YouTube */}
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noreferrer" 
              aria-label="YouTube Channel" 
              className="hover:text-white hover:scale-110 transition-all p-1"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom Legal Attribution & Copyright */}
        <div className="border-t border-neutral-900 pt-6 text-[11px] text-neutral-500 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="max-w-2xl">
            This product uses the TMDB API but is not endorsed or certified by TMDB. Creative Commons video streams provided courtesy of the Blender Open Movie Foundation (CC-BY). All movie posters, backdrops, and trademarks are property of their respective studios.
          </p>
          <p className="whitespace-nowrap font-medium text-neutral-400">
            © 2026 StreamVerse Inc. Portfolio Engineering Build.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
