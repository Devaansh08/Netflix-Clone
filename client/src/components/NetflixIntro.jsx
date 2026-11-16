/**
 * @file NetflixIntro.jsx
 * @description Iconic Netflix cinematic opening animation with the arched red logo,
 * synthesized "Ta-Dum" Web Audio bass & shimmer resonance, dynamic prism light ribbons,
 * and smooth fade-in reveal of the main streaming dashboard.
 */

import React, { useState, useEffect, useRef } from 'react';
import NetflixLogo from './NetflixLogo.jsx';

/**
 * Synthesizes the iconic Netflix "Ta-Dum" sound using Web Audio API:
 * - Strike 1: "TA" (sub-bass cello thud with low-pass frequency drop)
 * - Strike 2: "DUM" (heavy sub-bass transient impact with metallic reverb shimmer)
 */
const playTaDumAudio = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    const createStrike = (startTime, freq, duration, gainLevel, filterCutoff) => {
      // Primary Oscillator (Triangle sub)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, startTime);
      osc1.frequency.exponentialRampToValueAtTime(Math.max(20, freq * 0.45), startTime + duration);

      gain1.gain.setValueAtTime(gainLevel, startTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(startTime);
      osc1.stop(startTime + duration);

      // Punch Filtered Sawtooth
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterCutoff, startTime);
      filter.frequency.exponentialRampToValueAtTime(60, startTime + duration);

      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(freq * 1.4, startTime);
      osc2.frequency.exponentialRampToValueAtTime(Math.max(20, freq * 0.4), startTime + duration);

      gain2.gain.setValueAtTime(gainLevel * 0.65, startTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc2.connect(filter);
      filter.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(startTime);
      osc2.stop(startTime + duration);
    };

    // 1. "TA" strike (0.05s)
    createStrike(now + 0.04, 82, 0.42, 0.65, 380);

    // 2. "DUM" strike (0.38s)
    createStrike(now + 0.38, 62, 1.6, 0.95, 260);

    // 3. Cinematic high metallic shimmer overtone
    const shimmerOsc = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    shimmerOsc.type = 'sine';
    shimmerOsc.frequency.setValueAtTime(540, now + 0.39);
    shimmerOsc.frequency.exponentialRampToValueAtTime(1100, now + 1.2);

    shimmerGain.gain.setValueAtTime(0.06, now + 0.39);
    shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    shimmerOsc.connect(shimmerGain);
    shimmerGain.connect(ctx.destination);
    shimmerOsc.start(now + 0.39);
    shimmerOsc.stop(now + 1.8);

  } catch (e) {
    console.debug('Web Audio autoplay restriction', e);
  }
};

export const NetflixIntro = ({ forcePlay = false, onComplete = null }) => {
  const [isVisible, setIsVisible] = useState(() => {
    if (forcePlay) return true;
    try {
      return !sessionStorage.getItem('netflix_intro_seen');
    } catch {
      return true;
    }
  });

  const [phase, setPhase] = useState('initial'); // 'initial' | 'impact' | 'bloom' | 'zoom' | 'fade'
  const hasTriggeredAudio = useRef(false);

  // Replay event listener
  useEffect(() => {
    const handleReplay = () => {
      setIsVisible(true);
      setPhase('initial');
      hasTriggeredAudio.current = false;
      playTaDumAudio();
    };

    window.addEventListener('replay_netflix_intro', handleReplay);
    return () => window.removeEventListener('replay_netflix_intro', handleReplay);
  }, []);

  const finishIntro = () => {
    try {
      sessionStorage.setItem('netflix_intro_seen', 'true');
    } catch {}
    setPhase('fade');
    setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 450);
  };

  useEffect(() => {
    if (!isVisible) return;

    // Phase 1: Immediate sound & logo focus
    const t0 = setTimeout(() => {
      if (!hasTriggeredAudio.current) {
        playTaDumAudio();
        hasTriggeredAudio.current = true;
      }
      setPhase('impact');
    }, 120);

    // Phase 2: Ta-Dum impact & light bloom (at 420ms)
    const t1 = setTimeout(() => {
      setPhase('bloom');
    }, 420);

    // Phase 3: Kinetic zoom towards camera (at 1600ms)
    const t2 = setTimeout(() => {
      setPhase('zoom');
    }, 1600);

    // Phase 4: Dissolve & reveal app (at 2350ms)
    const t3 = setTimeout(() => {
      finishIntro();
    }, 2350);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div 
      onClick={finishIntro}
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden select-none cursor-pointer transition-opacity duration-500 ease-out ${
        phase === 'fade' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Cinematic Ambient Radial Red Glow */}
      <div 
        className={`absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,9,20,0.35)_0%,rgba(0,0,0,0.95)_70%)] transition-opacity duration-700 ${
          phase === 'bloom' || phase === 'zoom' ? 'opacity-100 scale-125' : 'opacity-40 scale-100'
        }`} 
      />

      {/* Vertical Spectral Light Ribbons (Prism Effect on Impact) */}
      <div 
        className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-700 ${
          phase === 'bloom' ? 'opacity-85 scale-y-125' : phase === 'zoom' ? 'opacity-0 scale-150' : 'opacity-0'
        }`}
      >
        <div className="w-[1200px] h-[700px] flex justify-between items-center opacity-65 blur-md">
          <div className="w-1.5 h-full bg-gradient-to-b from-transparent via-red-600 to-transparent animate-pulse" />
          <div className="w-1 h-full bg-gradient-to-b from-transparent via-purple-600 to-transparent" />
          <div className="w-2 h-full bg-gradient-to-b from-transparent via-[#E50914] to-transparent shadow-[0_0_20px_#E50914]" />
          <div className="w-1 h-full bg-gradient-to-b from-transparent via-cyan-500 to-transparent" />
          <div className="w-2 h-full bg-gradient-to-b from-transparent via-red-500 to-transparent shadow-[0_0_25px_#E50914]" />
          <div className="w-1 h-full bg-gradient-to-b from-transparent via-amber-500 to-transparent" />
          <div className="w-1.5 h-full bg-gradient-to-b from-transparent via-rose-600 to-transparent" />
        </div>
      </div>

      {/* Central Iconic Arched NETFLIX Logo */}
      <div 
        className={`relative z-20 flex flex-col items-center justify-center transition-all ease-[cubic-bezier(0.25,1,0.5,1)] ${
          phase === 'initial' 
            ? 'scale-90 opacity-0 blur-sm' 
            : phase === 'impact' 
            ? 'scale-100 opacity-100 blur-0 duration-300' 
            : phase === 'bloom' 
            ? 'scale-105 opacity-100 drop-shadow-[0_0_60px_rgba(229,9,20,0.95)] duration-500' 
            : 'scale-[2.4] opacity-0 blur-lg duration-700'
        }`}
      >
        {/* Render Arched Logo (100% Vector Transparent SVG - Zero Box) */}
        <NetflixLogo 
          className="w-72 sm:w-96 md:w-[480px] lg:w-[560px] h-auto drop-shadow-[0_0_45px_rgba(229,9,20,0.95)]" 
        />

        {/* Dynamic Lens Flare Flare Ring */}
        <div 
          className={`absolute inset-0 -inset-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-1000 ${
            phase === 'bloom' ? 'translate-x-full' : ''
          }`} 
        />
      </div>

      {/* Skip Button in Top Right */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          finishIntro();
        }}
        className="absolute top-6 right-6 z-50 rounded-full border border-white/20 bg-white/10 hover:bg-white/25 px-4 py-1.5 text-xs font-bold text-white/80 hover:text-white backdrop-blur-xl transition-all cursor-pointer shadow-lg active:scale-95"
      >
        Skip Intro &rarr;
      </button>

      {/* Bottom Hint */}
      <div className="absolute bottom-6 z-30 text-[11px] font-medium text-neutral-500 tracking-wider">
        CLICK ANYWHERE TO SKIP
      </div>
    </div>
  );
};

export default NetflixIntro;
