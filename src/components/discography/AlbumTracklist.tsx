'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Play, Pause } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAudio } from '@/audio/AudioContext';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface Track {
  title: string;
  featuredArtists?: string[];
}

interface AlbumTracklistProps {
  tracks: Track[];
  albumTitle: string;
}

export const AlbumTracklist: React.FC<AlbumTracklistProps> = ({ tracks, albumTitle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { state, transitionTo, audioManager, setActiveTrack } = useAudio();

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
    // Refresh ScrollTrigger positions after accordion animation starts and finishes
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 450); // After Framer Motion transition completes (duration is 0.4s)
  };

  const onPlayToggle = (title: string) => {
    const trackInDb = audioManager.getTracks().find(
      (t) => t.title.toLowerCase() === title.toLowerCase() && !t.id.startsWith('ambient')
    );
    if (!trackInDb) return;
    if (state.currentTrackId === trackInDb.id) {
      if (state.isPlaying) {
        audioManager.pause();
      } else {
        audioManager.resume();
      }
    } else {
      transitionTo(trackInDb.id);
      setActiveTrack(trackInDb);
    }
  };

  const idSafe = albumTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return (
    <div className="border border-white/5 bg-[#0a0a0a] rounded-xl overflow-hidden mt-4 w-full">
      {/* Trigger Button */}
      <button
        type="button"
        id={`accordion-trigger-${idSafe}`}
        aria-expanded={isOpen}
        aria-controls={`accordion-panel-${idSafe}`}
        onClick={toggleAccordion}
        className="w-full flex items-center justify-between px-5 py-4 bg-[#0e0e0e] hover:bg-[#141414] text-foreground transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-crimson font-sans text-xs tracking-wider uppercase font-semibold text-text-secondary select-none"
      >
        <span className="flex items-center gap-2">
          <span>Tracklist</span>
          <span className="bg-white/5 text-[9px] px-2 py-0.5 rounded-full text-foreground/75 font-mono normal-case">
            {tracks.length} Songs
          </span>
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-4 h-4 text-text-secondary" />
        </motion.div>
      </button>

      {/* Expandable Panel */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`accordion-panel-${idSafe}`}
            role="region"
            aria-labelledby={`accordion-trigger-${idSafe}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: 'auto', 
              opacity: 1,
              transition: {
                height: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.25, delay: 0.05 }
              }
            }}
            exit={{ 
              height: 0, 
              opacity: 0,
              transition: {
                height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.15 }
              }
            }}
            className="overflow-hidden bg-[#070707] divide-y divide-white/5 border-t border-white/5"
          >
            <ol className="p-2 font-mono text-[11px] leading-relaxed text-text-secondary select-none">
              {tracks.map((track, index) => {
                const matchingTrack = audioManager.getTracks().find(
                  (t) => t.title.toLowerCase() === track.title.toLowerCase() && !t.id.startsWith('ambient')
                );
                const isCurrent = matchingTrack && state.currentTrackId === matchingTrack.id;
                const isPlaying = isCurrent && state.isPlaying;
                const isPlayable = matchingTrack && !!matchingTrack.preview?.url;

                return (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => {
                      if (isPlayable) {
                        onPlayToggle(track.title);
                      }
                    }}
                    className={`px-4 py-2 flex items-center justify-between hover:bg-white/5 transition-all duration-300 group rounded relative ${
                      isPlayable ? 'cursor-pointer' : 'cursor-default opacity-50'
                    } ${
                      isCurrent ? 'bg-crimson/5 border-l border-crimson' : 'border-l border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      {isPlayable ? (
                        <div className="w-5 flex items-center justify-center shrink-0">
                          {isPlaying ? (
                            <Pause className="w-3.5 h-3.5 text-crimson fill-crimson animate-pulse" />
                          ) : (
                            <div className="relative w-full h-full flex items-center justify-center">
                              <Play className="w-3.5 h-3.5 text-crimson fill-crimson opacity-0 group-hover:opacity-100 transition-opacity translate-x-[0.5px]" />
                              <span className="text-[#333] group-hover:opacity-0 transition-opacity font-mono text-[11px] absolute">
                                {index + 1}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#333] w-5 text-center shrink-0 font-mono text-[11px]">
                          {index + 1}
                        </span>
                      )}
                      
                      <span className={`font-sans text-xs font-medium truncate ${isCurrent ? 'text-crimson' : 'text-foreground'}`}>
                        {track.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {track.featuredArtists && track.featuredArtists.length > 0 && (
                        <span className="text-[9px] font-sans text-crimson border border-crimson/20 bg-crimson/5 px-2 py-0.5 rounded-full tracking-wider">
                          feat. {track.featuredArtists.join(', ')}
                        </span>
                      )}
                      {isPlayable && !isCurrent && (
                        <span className="text-[9px] font-sans text-text-secondary/40 group-hover:text-text-secondary/70 transition-colors uppercase tracking-wider font-semibold">
                          Preview
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-[9px] font-sans text-crimson uppercase tracking-wider font-bold animate-pulse">
                          {isPlaying ? 'Playing' : 'Paused'}
                        </span>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
