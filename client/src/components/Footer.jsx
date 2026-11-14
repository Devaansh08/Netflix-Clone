/**
 * @file Footer.jsx
 * @description Enterprise Netflix / Apple TV style footer with multi-column links, language picker, and 18+ compliance disclosures.
 */

import React, { useState } from 'react';
import { Globe, ShieldAlert } from 'lucide-react';

export const Footer = () => {
  const [selectedLang, setSelectedLang] = useState('English');

  return (
    <footer className="mt-24 border-t border-neutral-800/80 bg-black/90 px-6 sm:px-12 md:px-20 py-14 text-neutral-400 text-xs select-none">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Contact / Help line */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm">
            Questions? Contact customer care at{' '}
            <span className="text-white hover:underline cursor-pointer font-semibold">
              1-800-STREAMVERSE
            </span>
          </p>

          {/* Language Selector Pill */}
          <div className="relative inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900/90 px-3 py-1.5 text-neutral-200">
            <Globe className="h-4 w-4 text-neutral-400" />
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              aria-label="Footer language selector"
              className="bg-transparent text-xs text-white outline-none cursor-pointer pr-2"
            >
              <option value="English" className="bg-neutral-900">English</option>
              <option value="Español" className="bg-neutral-900">Español</option>
              <option value="Français" className="bg-neutral-900">Français</option>
              <option value="日本語" className="bg-neutral-900">日本語</option>
              <option value="한국어" className="bg-neutral-900">한국어</option>
              <option value="हिन्दी" className="bg-neutral-900">हिन्दी</option>
            </select>
          </div>
        </div>

        {/* 4-Column Navigation Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-xs leading-relaxed text-neutral-500">
          <div className="space-y-2.5">
            <p className="text-neutral-400 hover:underline cursor-pointer">FAQ</p>
            <p className="text-neutral-400 hover:underline cursor-pointer">Investor Relations</p>
            <p className="text-neutral-400 hover:underline cursor-pointer">Privacy & Security</p>
            <p className="text-neutral-400 hover:underline cursor-pointer">Speed Test</p>
          </div>

          <div className="space-y-2.5">
            <p className="text-neutral-400 hover:underline cursor-pointer">Help Center</p>
            <p className="text-neutral-400 hover:underline cursor-pointer">Engineering Careers</p>
            <p className="text-neutral-400 hover:underline cursor-pointer">Cookie Preferences</p>
            <p className="text-neutral-400 hover:underline cursor-pointer">Legal Notices</p>
          </div>

          <div className="space-y-2.5">
            <p className="text-neutral-400 hover:underline cursor-pointer">Account & Subscription</p>
            <p className="text-neutral-400 hover:underline cursor-pointer">Ways to Watch</p>
            <p className="text-neutral-400 hover:underline cursor-pointer">Corporate Information</p>
            <p className="text-neutral-400 hover:underline cursor-pointer">StreamVerse Originals</p>
          </div>

          <div className="space-y-2.5">
            <p className="text-neutral-400 hover:underline cursor-pointer">Media Center</p>
            <p className="text-neutral-400 hover:underline cursor-pointer">Terms of Use</p>
            <p className="text-neutral-400 hover:underline cursor-pointer">Contact Support</p>
            <p className="text-neutral-400 hover:underline cursor-pointer">18+ Content Policy</p>
          </div>
        </div>

        {/* Regulatory 18+ Advisory Banner */}
        <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-4 text-[11px] text-neutral-300 leading-normal flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-red-400 uppercase tracking-wide">
              18+ Content Rating Advisory & Parental Guidelines:
            </span>{' '}
            Titles designated with 18+, TV-MA, or R ratings are intended exclusively for adult audiences. They may contain explicit violence, mature dialogue, or intense thematic elements. Content filters and age verification gates are active.
          </div>
        </div>

        {/* TMDB Attribution & Copyright */}
        <div className="border-t border-neutral-800/80 pt-6 text-[11px] text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>
            This product uses the TMDB API but is not endorsed or certified by TMDB. Creative Commons video streams provided courtesy of the Blender Open Movie Foundation.
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
