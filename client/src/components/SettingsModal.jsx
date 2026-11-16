/**
 * @file SettingsModal.jsx
 * @description Sleek, modern, and simple Apple VisionOS / spatial cinema settings panel.
 * Features categorized preference cards with colored icon pods, tactile iOS-style switches,
 * segmented quality controls, and persistent local storage sync.
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Tv, 
  Volume2, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  RotateCcw,
  Gauge,
  Film
} from 'lucide-react';

const STORAGE_KEY = 'streamverse_settings';

/**
 * Reusable iOS-style toggle switch
 */
const ToggleSwitch = ({ checked, onChange, activeColor = 'bg-[#E50914]' }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none active:scale-95 ${
      checked ? activeColor : 'bg-neutral-800'
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

export const SettingsModal = ({ isOpen, onClose, is18PlusAllowed, onToggle18Plus }) => {
  // Load saved preferences or defaults
  const [quality, setQuality] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return saved.quality || '4k';
    } catch {
      return '4k';
    }
  });

  const [defaultAudio, setDefaultAudio] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return saved.audio || 'en';
    } catch {
      return 'en';
    }
  });

  const [autoplayPreviews, setAutoplayPreviews] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return saved.autoplayPreviews !== undefined ? saved.autoplayPreviews : true;
    } catch {
      return true;
    }
  });

  const [ambientGlow, setAmbientGlow] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return saved.ambientGlow !== undefined ? saved.ambientGlow : true;
    } catch {
      return true;
    }
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Close on Escape key & manage scroll lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Persist settings
  const handleSave = () => {
    try {
      const payload = {
        quality,
        audio: defaultAudio,
        autoplayPreviews,
        ambientGlow,
        is18PlusAllowed
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      window.dispatchEvent(new CustomEvent('streamverse_settings_changed', { detail: payload }));
    } catch (e) {
      console.warn('Could not persist settings', e);
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 500);
  };

  // Reset to original defaults
  const handleResetDefaults = () => {
    setQuality('4k');
    setDefaultAudio('en');
    setAutoplayPreviews(true);
    setAmbientGlow(true);
    if (is18PlusAllowed && onToggle18Plus) {
      onToggle18Plus();
    }
  };

  const qualityOptions = [
    { id: '4k', label: '4K Ultra HD', tag: '2160p HDR' },
    { id: '1080p', label: '1080p Full HD', tag: 'High Speed' },
    { id: 'data', label: 'Data Saver', tag: '720p Adaptive' }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl bg-neutral-900/95 border border-white/15 p-6 sm:p-7 shadow-[0_25px_80px_rgba(0,0,0,0.95)] backdrop-blur-2xl text-neutral-300 space-y-5 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-lg shadow-red-950 flex-shrink-0">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                Netflix Settings
              </h3>
              <p className="text-[11px] text-neutral-400">
                Playback quality, audio preferences & parental controls
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Settings"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Setting Items List */}
        <div className="space-y-3.5 text-xs">
          
          {/* 1. Streaming Video Quality Card */}
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/5 hover:border-white/10 transition-all space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-600/20 to-red-600/5 text-red-400 border border-red-500/20 flex-shrink-0">
                <Gauge className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Streaming Video Quality</p>
                <p className="text-[11px] text-neutral-400">Max bitrate and resolution for cinema playback</p>
              </div>
            </div>

            {/* Segmented Selector */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10">
              {qualityOptions.map((q) => {
                const isSelected = quality === q.id;
                return (
                  <button
                    key={q.id}
                    onClick={() => setQuality(q.id)}
                    className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-lg text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white/15 text-white font-bold shadow-md border border-white/20'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <span className="text-xs font-bold leading-tight">{q.label}</span>
                    <span className="text-[10px] text-neutral-400 font-normal leading-tight">{q.tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Audio & Dubbing Preference Card */}
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/5 hover:border-white/10 transition-all space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex-shrink-0">
                <Volume2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Audio Track & Dubbing</p>
                <p className="text-[11px] text-neutral-400">Default audio language for international cinema</p>
              </div>
            </div>

            <div className="relative pt-1">
              <select
                value={defaultAudio}
                onChange={(e) => setDefaultAudio(e.target.value)}
                className="w-full rounded-xl bg-neutral-950/90 border border-white/10 px-3.5 py-2 text-xs font-semibold text-white outline-none focus:border-red-500/60 transition-colors cursor-pointer"
              >
                <option value="en">English · Original Studio Audio (Dolby 5.1)</option>
                <option value="ja">Japanese · 日本語 (Dolby Atmos Master)</option>
                <option value="es">Spanish · Español (Castilian & LatAm)</option>
                <option value="ko">Korean · 한국어 (Original Soundtrack)</option>
                <option value="hi">Hindi · हिन्दी (5.1 Dubbed Master)</option>
                <option value="de">German · Deutsch (Stereo HD)</option>
                <option value="fr">French · Français (5.1 Surround)</option>
              </select>
            </div>
          </div>

          {/* 3. Autoplay Hover Previews Item */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] border border-white/5 hover:border-white/10 transition-all">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex-shrink-0">
                <Film className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white">Autoplay Preview Clips</p>
                <p className="text-[11px] text-neutral-400">Stream preview clips when hovering cards</p>
              </div>
            </div>
            <ToggleSwitch 
              checked={autoplayPreviews} 
              onChange={() => setAutoplayPreviews((prev) => !prev)} 
              activeColor="bg-[#E50914]"
            />
          </div>

          {/* 4. Parental Safe Mode (18+ Content) Item */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] border border-white/5 hover:border-white/10 transition-all">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl border flex-shrink-0 ${
                is18PlusAllowed 
                  ? 'bg-red-500/15 border-red-500/30 text-red-400' 
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              }`}>
                {is18PlusAllowed ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-white">Parental Safe Mode</p>
                  <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                    is18PlusAllowed 
                      ? 'bg-red-950/60 border-red-500/40 text-red-300' 
                      : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  }`}>
                    {is18PlusAllowed ? '18+ Unlocked' : 'Safe Mode Active'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  {is18PlusAllowed 
                    ? 'Adult-rated crime thrillers and mature scenes enabled' 
                    : 'Filters out 18+ titles from catalog recommendations'}
                </p>
              </div>
            </div>
            <ToggleSwitch 
              checked={is18PlusAllowed} 
              onChange={onToggle18Plus} 
              activeColor="bg-red-600"
            />
          </div>

          {/* 5. Spatial Ambient Glow Item */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] border border-white/5 hover:border-white/10 transition-all">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex-shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white">Spatial Ambient Glow</p>
                <p className="text-[11px] text-neutral-400">Cast studio backlighting behind the cinema console</p>
              </div>
            </div>
            <ToggleSwitch 
              checked={ambientGlow} 
              onChange={() => setAmbientGlow((prev) => !prev)} 
              activeColor="bg-amber-600"
            />
          </div>

          {/* 6. Replay Netflix Intro */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] border border-white/5 hover:border-white/10 transition-all">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600/10 border border-red-500/20 text-[#E50914] flex-shrink-0">
                <Film className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white">Netflix Opening Intro</p>
                <p className="text-[11px] text-neutral-400">Play the iconic arched logo & Ta-Dum sound</p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                window.dispatchEvent(new Event('replay_netflix_intro'));
              }}
              className="rounded-xl border border-red-500/30 bg-red-950/40 hover:bg-[#E50914] px-3 py-1.5 text-[11px] font-bold text-red-300 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
            >
              Play Intro
            </button>
          </div>

          {/* Telemetry Status Bar */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-black/30 border border-white/5 text-[11px] text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="font-semibold text-neutral-300">Live CDN Edge: Active</span>
              <span className="text-neutral-500">•</span>
              <span className="font-mono text-green-400 text-[10px]">12ms</span>
            </div>
            <span className="text-neutral-400 font-mono text-[10px]">Netflix Engine v2.4</span>
          </div>

        </div>

        {/* Modal Action Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Reset all settings to default values"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-xl bg-[#E50914] px-5 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-red-950 hover:bg-red-600 active:scale-95 transition-all cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="h-4 w-4 text-green-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;
