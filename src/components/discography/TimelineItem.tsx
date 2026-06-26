'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Music, Clock, Play, Pause } from 'lucide-react';
import { Artwork } from './Artwork';
import { AlbumTracklist } from './AlbumTracklist';
import { useAudio } from '@/audio/AudioContext';

export type DiscographyRelease = {
  title: string;
  type: 'Album' | 'Single';
  date: string;
  artwork: string;
  description?: string;
  featuredArtists?: string[];
  trackCount?: number;
  duration?: string;
  tracks?: {
    title: string;
    featuredArtists?: string[];
  }[];
};

interface TimelineItemProps {
  release: DiscographyRelease;
  index: number;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ release, index }) => {
  const isEven = index % 2 === 0;
  const { state, transitionTo, audioManager, setActiveTrack } = useAudio();

  // Find the matching track from the audio manager
  let matchingTrack = audioManager.getTracks().find(
    (t) => t.title.toLowerCase() === release.title.toLowerCase() && !t.id.startsWith('ambient')
  );

  // Fallback for albums: if the title track doesn't have a preview URL, play the first track in the album that does
  if ((!matchingTrack || !matchingTrack.preview?.url) && release.type === 'Album' && release.tracks) {
    for (const albumTrack of release.tracks) {
      const trackInDb = audioManager.getTracks().find(
        (t) => t.title.toLowerCase() === albumTrack.title.toLowerCase() && !t.id.startsWith('ambient') && t.preview?.url
      );
      if (trackInDb) {
        matchingTrack = trackInDb;
        break;
      }
    }
  }

  const isPlaying = matchingTrack && state.currentTrackId === matchingTrack.id && state.isPlaying;

  const onPlayToggle = () => {
    if (!matchingTrack) return;
    if (state.currentTrackId === matchingTrack.id) {
      if (state.isPlaying) {
        audioManager.pause();
      } else {
        audioManager.resume();
      }
    } else {
      transitionTo(matchingTrack.id);
      setActiveTrack(matchingTrack);
    }
  };

  // Animation variants
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 40,
      x: 0 // Keep x neutral for mobile stacking
    },
    visible: { 
      opacity: 1, 
      y: 0,
      x: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1] as const
      }
    }
  };

  return (
    <div 
      className={`flex flex-col md:flex-row items-start md:items-center justify-between w-full relative ${
        isEven ? '' : 'md:flex-row-reverse'
      }`}
    >
      {/* Card Wrapper Panel */}
      <div 
        className={`w-full md:w-[45%] pl-12 md:pl-0 ${
          isEven ? 'md:text-right' : 'md:text-left'
        }`}
      >
        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          whileHover={{ y: -4 }}
          className={`p-5 sm:p-6 bg-[#0e0e0e] border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative transition-all duration-500 group flex flex-col sm:flex-row gap-5 items-start sm:items-stretch ${
            isPlaying ? 'border-crimson/50 shadow-[0_20px_50px_rgba(193,18,31,0.15)]' : 'border-white/5'
          }`}
        >
          {/* Left: Artwork component with interactive preview toggle */}
          <div 
            onClick={onPlayToggle}
            className={`w-full sm:w-[150px] md:w-[170px] shrink-0 relative overflow-hidden rounded-2xl ${
              matchingTrack ? 'cursor-pointer group/art' : ''
            }`}
          >
            <Artwork 
              src={release.artwork} 
              alt={release.title} 
              className="w-full h-full"
            />
            {matchingTrack && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover/art:opacity-100 transition-opacity duration-300">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3.5 rounded-full bg-crimson text-white shadow-xl flex items-center justify-center"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-white" />
                  ) : (
                    <Play className="w-5 h-5 fill-white translate-x-[1px]" />
                  )}
                </motion.div>
              </div>
            )}
          </div>

          {/* Right: Release metadata and lists */}
          <div className="flex-1 flex flex-col justify-between w-full">
            <div className="space-y-2.5">
              {/* Top row: Type badge & Date & Play Preview inline */}
              <div className="flex flex-wrap items-center justify-between gap-2 select-none">
                <div className="flex items-center gap-2 text-[10px] font-sans tracking-widest uppercase font-semibold text-text-secondary">
                  <span className="px-2.5 py-0.5 rounded-full border border-crimson/30 bg-crimson/10 text-crimson text-[9px]">
                    {release.type}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-text-secondary/55" />
                    {release.date}
                  </span>
                </div>
                
                {matchingTrack && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayToggle();
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-syne uppercase tracking-wider transition-all duration-300 font-bold ${
                      isPlaying 
                        ? 'border-crimson bg-crimson text-white shadow-[0_0_10px_rgba(193,18,31,0.4)]' 
                        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-text-secondary hover:text-white'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-2.5 h-2.5 fill-current" />
                        Playing Preview
                      </>
                    ) : (
                      <>
                        <Play className="w-2.5 h-2.5 fill-current translate-x-[0.5px]" />
                        Play Preview
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Title & Features */}
              <div className="space-y-1">
                <h3 className="font-bebas text-3xl sm:text-4xl text-foreground tracking-wide uppercase leading-none select-none">
                  {release.title}
                </h3>
                {release.featuredArtists && release.featuredArtists.length > 0 && (
                  <p className="text-[10px] font-sans text-crimson font-medium uppercase tracking-widest">
                    feat. {release.featuredArtists.join(' & ')}
                  </p>
                )}
              </div>

              {/* Optional Description */}
              {release.description && (
                <p className="text-[11px] font-sans text-text-secondary leading-relaxed tracking-wide select-none">
                  {release.description}
                </p>
              )}

              {/* Album track count / Single duration */}
              <div className="text-[10px] font-mono text-text-secondary/75 flex items-center gap-3 select-none">
                {release.type === 'Album' && release.trackCount && (
                  <span className="flex items-center gap-1">
                    <Music className="w-3 h-3 text-crimson" />
                    {release.trackCount} Tracks
                  </span>
                )}
                {release.type === 'Single' && release.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-crimson" />
                    {release.duration}
                  </span>
                )}
              </div>
            </div>

            {/* If Album, render AlbumTracklist */}
            {release.type === 'Album' && release.tracks && (
              <AlbumTracklist 
                tracks={release.tracks} 
                albumTitle={release.title} 
              />
            )}
          </div>
        </motion.div>
      </div>

      {/* Vertical Line Anchor Node: Sitting exactly on the connector line */}
      <div className="absolute left-6 md:left-1/2 top-10 md:top-1/2 w-4 h-4 rounded-full bg-[#050505] border-2 border-crimson -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
        <motion.div 
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          className="w-1.5 h-1.5 rounded-full bg-crimson shadow-[0_0_8px_rgba(193,18,31,0.8)]"
        />
      </div>

      {/* Empty buffer for spacing on desktop */}
      <div className="hidden md:block w-[45%]" />
    </div>
  );
};
