'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, SkipForward } from 'lucide-react';
import { useAudio } from '@/audio/AudioContext';

export const AudioPlayer = () => {
  const { state, pause, resume, setVolume, toggleMute, seek } = useAudio();
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // If the audio context hasn't been initialized (user hasn't entered the landing page), hide player
  if (!state.initialized || !state.currentTrack) return null;

  const currentTrack = state.currentTrack;
  const isPlaying = state.isPlaying;
  const isMuted = state.isMuted;
  const progressPercent = state.progress * 100;

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handlePlayToggle = () => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickPercent = clickX / width;
    if (state.duration) {
      seek(clickPercent * state.duration);
    }
  };

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex flex-col w-[280px] md:w-[320px] bg-[#101010] border border-white/5 hover:border-white/10 rounded shadow-2xl overflow-hidden backdrop-blur-md"
    >
      {/* Visualizer bars at the top when playing */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-white/5 overflow-hidden">
        {isPlaying && (
          <motion.div
            initial={{ left: '-100%' }}
            animate={{ left: '100%' }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-accent to-transparent"
          />
        )}
      </div>

      {/* Main Track Detail Wrapper */}
      <div className="p-4 flex items-center justify-between gap-4">
        {/* Track Meta Details */}
        <div className="flex flex-col gap-1 overflow-hidden max-w-[150px] md:max-w-[180px]">
          <span className="font-bebas text-lg md:text-xl text-foreground tracking-wider truncate uppercase">
            {currentTrack.title}
          </span>
          <span className="text-[10px] tracking-[0.2em] font-syne text-text-secondary uppercase truncate">
            {currentTrack.artist}
          </span>
        </div>

        {/* Playback Controls Row */}
        <div className="flex items-center gap-3">
          {/* Mute Button & Hover Volume Slider */}
          <div
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
            className="relative flex items-center h-8"
          >
            <AnimatePresence>
              {showVolumeSlider && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 60, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center justify-center mr-2 overflow-hidden"
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : state.volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-12 h-1 bg-white/10 accent-accent rounded-lg appearance-none cursor-pointer"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={toggleMute}
              className="w-8 h-8 rounded-full border border-white/5 hover:border-white/10 flex items-center justify-center text-text-secondary hover:text-white transition-colors duration-300"
            >
              {isMuted || state.volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Master Play/Pause Button */}
          <button
            onClick={handlePlayToggle}
            className="w-10 h-10 rounded-full bg-accent hover:bg-accent/80 flex items-center justify-center text-white transition-colors duration-300 shadow-md shadow-accent/20"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-white translate-x-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Dynamic Seek bar / Progress wrapper */}
      <div className="px-4 pb-4 flex flex-col gap-1.5">
        <div
          onClick={handleProgressBarClick}
          className="relative w-full h-1 bg-white/5 hover:bg-white/10 rounded cursor-pointer transition-colors group"
        >
          {/* Highlight Fill progress */}
          <div
            className="absolute top-0 left-0 bottom-0 bg-accent rounded group-hover:bg-accent/90 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
          {/* Floating thumb handle */}
          <div
            className="absolute top-1/2 w-2 h-2 bg-white rounded-full -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{ left: `calc(${progressPercent}% - 4px)` }}
          />
        </div>

        {/* Time Indicators */}
        <div className="flex items-center justify-between text-[9px] tracking-widest font-syne text-text-secondary uppercase select-none">
          <span>{formatTime(state.currentTime)}</span>
          <span>{formatTime(state.duration)}</span>
        </div>
      </div>
    </motion.div>
  );
};
