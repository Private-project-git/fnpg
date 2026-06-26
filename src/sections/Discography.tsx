'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Play, Pause } from 'lucide-react';
import { useAudio } from '@/audio/AudioContext';
import { PremiumImage } from '@/components/PremiumImage';

export const Discography = () => {
  const { state, transitionTo, setActiveTrack, audioManager } = useAudio();
  
  // Filter out ambient loop tracks, keeping only main music tracks
  const songs = audioManager.getTracks().filter((t) => !t.id.startsWith('ambient'));

  return (
    <section id="discography" className="relative w-full bg-[#050505] flex flex-col py-32 overflow-hidden">
      {/* Subtle background noise texture */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22 opacity=%220.05%22/%3E%3C/svg%3E')] pointer-events-none opacity-20" />
      
      <header className="mb-32 text-center relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl font-bebas text-foreground tracking-widest"
        >
          CINEMATIC <span className="text-blood-red">DISCOGRAPHY</span>
        </motion.h2>
        <p className="text-text-secondary font-syne text-[10px] uppercase tracking-[0.4em] mt-4">
          Dynamic Cinematic Chapters
        </p>
      </header>

      <div className="max-w-5xl mx-auto w-full px-6 relative z-10">
        {songs.length === 0 ? (
          <div className="text-center text-text-secondary font-syne text-xs uppercase tracking-widest py-12">
            Synchronizing tracks...
          </div>
        ) : (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-blood-red/45 to-transparent transform -translate-x-1/2 hidden md:block" />
            
            {songs.map((track, index) => (
              <TrackChapter
                key={track.id}
                track={track}
                index={index}
                totalSongs={songs.length}
                isPlaying={state.currentTrackId === track.id && state.isPlaying}
                onPlayToggle={() => {
                  if (state.currentTrackId === track.id) {
                    if (state.isPlaying) {
                      audioManager.pause();
                    } else {
                      audioManager.resume();
                    }
                  } else {
                    transitionTo(track.id);
                  }
                }}
                nextTrackId={index + 1 < songs.length ? songs[index + 1].id : null}
                setActiveTrack={setActiveTrack}
                audioManager={audioManager}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

interface TrackChapterProps {
  track: any;
  index: number;
  totalSongs: number;
  isPlaying: boolean;
  onPlayToggle: () => void;
  nextTrackId: string | null;
  setActiveTrack: (t: any) => void;
  audioManager: any;
}

const TrackChapter: React.FC<TrackChapterProps> = ({
  track,
  index,
  totalSongs,
  isPlaying,
  onPlayToggle,
  nextTrackId,
  setActiveTrack,
  audioManager,
}) => {
  const chapterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 1. Shift the background atmosphere to this track's theme!
            setActiveTrack(track);

            // 2. Preload the next track's preview clip to prevent delay!
            if (nextTrackId) {
              audioManager.preloadTrack(nextTrackId);
            }
          }
        });
      },
      {
        root: null, // viewport
        rootMargin: '-30% 0px -30% 0px', // Trigger near center screen
        threshold: 0.1,
      }
    );

    if (chapterRef.current) {
      observer.observe(chapterRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [track, nextTrackId, setActiveTrack, audioManager]);

  const theme = track.visualIdentity;
  const isEven = index % 2 === 0;

  return (
    <motion.div 
      ref={chapterRef}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: '-100px' }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col md:flex-row gap-12 items-center mb-36 relative ${isEven ? 'md:flex-row-reverse' : ''}`}
    >
      {/* Chapter Text Details */}
      <div className={`flex-1 flex flex-col ${isEven ? 'md:items-start text-left' : 'md:items-end text-right'} z-10`}>
        <span 
          className="font-bebas text-xl mb-2 font-bold tracking-widest"
          style={{ color: theme.accentColor }}
        >
          CHAPTER 0{index + 1}
        </span>
        
        <h3 className={`text-4xl md:text-5xl uppercase mb-3 ${theme.typographyStyle}`}>
          {track.title}
        </h3>
        
        <span className="text-[10px] font-syne tracking-[0.25em] text-text-secondary uppercase mb-6">
          {track.album || 'Single'} &bull; {track.genre}
        </span>

        <p className="text-text-secondary font-sans text-xs max-w-sm mb-6 leading-relaxed">
          Experience the auditory canvas of {track.title}. A curated release exploring rich soundscapes.
        </p>

        <div className="flex gap-6 items-center">
          <button 
            onClick={onPlayToggle}
            className="flex items-center gap-2.5 px-6 py-2.5 rounded-full border text-[10px] font-syne uppercase tracking-wider transition-all duration-300 hover:text-white"
            style={{ 
              borderColor: theme.accentColor + '50', 
              backgroundColor: isPlaying ? theme.accentColor + '20' : 'transparent',
              color: isPlaying ? '#ffffff' : '#a0a0a0'
            }}
          >
            {isPlaying ? (
              <>
                Pause <Pause className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                Play Preview <Play className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          {track.platforms.appleMusicUrl && (
            <a 
              href={track.platforms.appleMusicUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] font-syne uppercase tracking-widest text-text-secondary hover:text-white transition-colors flex items-center gap-1.5"
            >
              Apple Music <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Center Timeline Node */}
      <div className="hidden md:flex w-12 h-12 relative items-center justify-center z-15">
        <motion.div 
          animate={{ scale: isPlaying ? [1, 1.3, 1] : 1 }}
          transition={{ repeat: isPlaying ? Infinity : 0, duration: 1.5 }}
          className="w-4 h-4 rounded-full shadow-lg z-10 transition-colors duration-500"
          style={{ 
            backgroundColor: theme.accentColor,
            boxShadow: `0 0 20px ${theme.accentColor}`
          }}
        />
      </div>

      {/* Chapter Artwork presentation */}
      <div className="flex-1 flex justify-center z-10 w-full">
        <div 
          onClick={onPlayToggle}
          className="relative w-72 h-72 shadow-[0_25px_60px_rgba(0,0,0,0.95)] group overflow-hidden border cursor-pointer transition-all duration-500 hover:scale-[1.02]"
          style={{ borderColor: theme.accentColor + '30' }}
        >
          <PremiumImage 
            src={track.artwork.url} 
            alt={track.title} 
            className="filter grayscale-[40%] group-hover:grayscale-0 transition-all duration-700"
          />
          
          {/* Accent Overlays */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" 
            style={{ backgroundColor: theme.accentColor }}
          />

          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="p-4 rounded-full bg-black/75 border border-white/10 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white" />}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
