/**
 * @file Player.jsx
 * @description Production-grade HLS adaptive video player featuring custom controls and progress sync.
 * 
 * DATA FLOW:
 * [Watch Page Mounts <Player />]
 *      │
 *      ├──► Initializes `Hls.js` (or native Safari HLS)
 *      ├──► Attaches playback listeners (timeupdate, waiting, playing)
 *      ├──► Fetches previous playback checkpoint ──► Resumes video time
 *      └──► Heartbeat Timer (every 10s & pause/unmount) ──► PUT /api/history
 * 
 * HOW ADAPTIVE BITRATE STREAMING (ABR) WORKS:
 * Instead of serving one large video file, video encoders chop content into short 2-6 second chunks (.ts or fMP4)
 * and encode them at multiple bitrates (360p, 720p, 1080p, 4K). An HLS master playlist (.m3u8) indexes them.
 * Hls.js monitors the browser's download speed and buffer fullness:
 * - If Wi-Fi degrades, it requests smaller bitrate chunks to prevent buffering.
 * - When Wi-Fi recovers, it seamlessly ramps up to crystal-clear 1080p without stopping playback.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Hls from 'hls.js';
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  RotateCcw,
  RotateCw,
  Globe
} from 'lucide-react';
import api from '../api/axios.js';

export const Player = ({ movie, streamInfo, initialProgress = 0 }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Controls visibility & HLS Levels
  const [showControls, setShowControls] = useState(true);
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1); // -1 = Auto
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState(
    movie?.originalLanguage === 'ja' ? 'Japanese [Original]' :
    movie?.originalLanguage === 'ko' ? 'Korean [Original]' :
    movie?.originalLanguage === 'es' ? 'Spanish [Original]' :
    movie?.originalLanguage === 'hi' ? 'Hindi [Original]' : 'English [Original]'
  );
  const [selectedSubtitle, setSelectedSubtitle] = useState('Off');

  const controlsTimeoutRef = useRef(null);
  const lastSavedTimeRef = useRef(0);

  /**
   * Save current playback progress to backend watch history.
   */
  const saveProgress = useCallback(async (timeToSave, totalDuration) => {
    if (!movie?.id || !timeToSave) return;
    try {
      await api.put('/history', {
        tmdbId: movie.id,
        title: movie.title,
        posterPath: movie.posterPath,
        progressSeconds: Math.floor(timeToSave),
        durationSeconds: Math.floor(totalDuration || duration)
      });
      lastSavedTimeRef.current = timeToSave;
    } catch (err) {
      console.warn('Failed to save playback heartbeat:', err.message);
    }
  }, [movie, duration]);

  // ============================================================================
  // HLS Stream Setup & Teardown
  // ============================================================================
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamInfo?.streamUrl) return;

    const streamUrl = streamInfo.streamUrl;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        setLevels(data.levels);
        // Resume from saved progress if available
        if (initialProgress > 0 && initialProgress < video.duration) {
          video.currentTime = initialProgress;
        }
        video.play().catch(() => setIsPlaying(false));
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        setCurrentLevel(data.level);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Apple Safari HLS Engine
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        if (initialProgress > 0) video.currentTime = initialProgress;
        video.play().catch(() => setIsPlaying(false));
      });
    }

    return () => {
      // Flush final progress on component unmount
      if (videoRef.current) {
        saveProgress(videoRef.current.currentTime, videoRef.current.duration);
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [streamInfo, initialProgress, saveProgress]);

  // ============================================================================
  // Periodic Heartbeat Progress Sync (Every 10 Seconds)
  // ============================================================================
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && videoRef.current) {
        const current = videoRef.current.currentTime;
        // Save progress if advanced by at least 5 seconds
        if (Math.abs(current - lastSavedTimeRef.current) >= 5) {
          saveProgress(current, videoRef.current.duration);
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isPlaying, saveProgress]);

  // ============================================================================
  // Player Video Event Handlers
  // ============================================================================
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handlePlayState = (playing) => {
    setIsPlaying(playing);
    if (!playing && videoRef.current) {
      // Immediately save progress when user pauses
      saveProgress(videoRef.current.currentTime, videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  const handleSeek = (e) => {
    const newTime = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const skipTime = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration));
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const targetMute = !isMuted;
      videoRef.current.muted = targetMute;
      setIsMuted(targetMute);
      if (!targetMute && volume === 0) {
        setVolume(0.5);
        videoRef.current.volume = 0.5;
      }
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  const handleQualityChange = (levelIndex) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex; // -1 = Auto
      setCurrentLevel(levelIndex);
      setShowQualityMenu(false);
    }
  };

  // Autohide controls on inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3500);
  };

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (secs) => {
    if (isNaN(secs)) return '00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative h-screen w-screen select-none overflow-hidden bg-black font-sans text-white"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => handlePlayState(true)}
        onPause={() => handlePlayState(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        className="h-full w-full object-contain cursor-pointer"
        playsInline
      />

      {/* Buffering Spinner */}
      {isBuffering && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#E50914] border-t-transparent shadow-lg" />
        </div>
      )}

      {/* Top Bar (Back Button + Title) */}
      <div
        className={`absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-6 transition-opacity duration-300 bg-gradient-to-b from-black/80 to-transparent ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          onClick={() => navigate(-1)}
          aria-label="Back to browsing"
          className="flex items-center gap-2 text-white transition-transform hover:scale-110"
        >
          <ArrowLeft className="h-7 w-7" />
          <span className="text-sm font-semibold tracking-wide hidden sm:inline">Back</span>
        </button>

        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-bold">{movie?.title || 'StreamVerse Player'}</h2>
          <span className="rounded bg-neutral-800/80 px-2 py-0.5 text-[10px] font-semibold text-neutral-400">
            CC Open-Source HLS Demo Stream
          </span>
        </div>

        <div className="w-10" /> {/* Balancer */}
      </div>

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 space-y-3 p-4 sm:p-6 transition-opacity duration-300 bg-gradient-to-t from-black/90 via-black/50 to-transparent ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Timeline Seek Bar */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-300 font-mono">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            aria-label="Video seek slider"
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-neutral-600 accent-[#E50914] transition-all hover:h-2.5"
          />
          <span className="text-xs text-neutral-300 font-mono">{formatTime(duration)}</span>
        </div>

        {/* Buttons Control Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="text-white hover:text-neutral-300 transition-transform hover:scale-110"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
            </button>

            {/* Skip Back 10s */}
            <button
              onClick={() => skipTime(-10)}
              aria-label="Skip back 10 seconds"
              className="text-white hover:text-neutral-300 transition-transform hover:scale-110"
            >
              <RotateCcw className="h-5 w-5" />
            </button>

            {/* Skip Forward 10s */}
            <button
              onClick={() => skipTime(10)}
              aria-label="Skip forward 10 seconds"
              className="text-white hover:text-neutral-300 transition-transform hover:scale-110"
            >
              <RotateCw className="h-5 w-5" />
            </button>

            {/* Volume + Slider */}
            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                className="text-white hover:text-neutral-300"
              >
                {isMuted || volume === 0 ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                aria-label="Volume slider"
                className="h-1 w-16 sm:w-20 cursor-pointer appearance-none rounded-lg bg-neutral-600 accent-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Audio & Subtitles Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowAudioMenu((prev) => !prev);
                  setShowQualityMenu(false);
                }}
                aria-label="Audio and subtitles"
                className="flex items-center gap-1.5 text-sm font-semibold text-neutral-300 hover:text-white transition-colors"
              >
                <Globe className="h-5 w-5" />
                <span className="hidden sm:inline text-xs">{selectedAudio.split(' ')[0]}</span>
              </button>

              {showAudioMenu && (
                <div className="absolute bottom-10 right-0 mb-2 w-64 rounded-xl bg-neutral-900/95 backdrop-blur-2xl p-3 shadow-2xl border border-neutral-700 text-xs z-50">
                  <div className="mb-2 pb-1 border-b border-neutral-800">
                    <span className="font-bold text-neutral-400 uppercase tracking-wider text-[10px]">Audio Language</span>
                    {['English [Original]', 'Japanese (Dolby Atmos)', 'Korean (5.1)', 'Spanish', 'Hindi'].map((aud) => (
                      <button
                        key={aud}
                        onClick={() => {
                          setSelectedAudio(aud);
                          setShowAudioMenu(false);
                        }}
                        className={`w-full py-1 text-left px-2 rounded hover:bg-neutral-800 transition-colors ${
                          selectedAudio === aud ? 'text-[#E50914] font-bold' : 'text-neutral-300'
                        }`}
                      >
                        {aud}
                      </button>
                    ))}
                  </div>

                  <div>
                    <span className="font-bold text-neutral-400 uppercase tracking-wider text-[10px]">Subtitles</span>
                    {['Off', 'English [CC]', 'Spanish', 'French', 'Japanese', 'Korean'].map((sub) => (
                      <button
                        key={sub}
                        onClick={() => {
                          setSelectedSubtitle(sub);
                          setShowAudioMenu(false);
                        }}
                        className={`w-full py-1 text-left px-2 rounded hover:bg-neutral-800 transition-colors ${
                          selectedSubtitle === sub ? 'text-[#E50914] font-bold' : 'text-neutral-300'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quality Selector (HLS levels) */}
            {levels.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowQualityMenu((prev) => !prev)}
                  aria-label="Quality settings"
                  className="flex items-center gap-1 text-sm font-semibold text-neutral-300 hover:text-white"
                >
                  <Settings className="h-5 w-5" />
                  <span className="hidden sm:inline">
                    {currentLevel === -1 ? 'Auto' : `${levels[currentLevel]?.height || ''}p`}
                  </span>
                </button>

                {showQualityMenu && (
                  <div className="absolute bottom-10 right-0 mb-2 w-32 rounded bg-neutral-900/95 py-2 shadow-2xl border border-neutral-700 text-xs">
                    <button
                      onClick={() => handleQualityChange(-1)}
                      className={`w-full px-4 py-1.5 text-left hover:bg-neutral-800 ${
                        currentLevel === -1 ? 'text-[#E50914] font-bold' : 'text-neutral-300'
                      }`}
                    >
                      Auto
                    </button>
                    {levels.map((lvl, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQualityChange(idx)}
                        className={`w-full px-4 py-1.5 text-left hover:bg-neutral-800 ${
                          currentLevel === idx ? 'text-[#E50914] font-bold' : 'text-neutral-300'
                        }`}
                      >
                        {lvl.height}p ({Math.round(lvl.bitrate / 1000)}k)
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              className="text-white hover:text-neutral-300 transition-transform hover:scale-110"
            >
              {isFullscreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
