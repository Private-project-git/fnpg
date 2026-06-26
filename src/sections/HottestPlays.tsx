'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { useAudio } from '@/audio/AudioContext';
import { PremiumImage } from '@/components/PremiumImage';

export const HottestPlays = () => {
  const { state, transitionTo, audioManager } = useAudio();

  // Filter trending tracks
  const tracks = audioManager.getTracks().filter(t => t.theme.trending);

  return (
    <section className="relative w-full py-32 bg-[#050505] overflow-hidden">
      
      {/* Background waveform visualization */}
      <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
        <div className="flex gap-2 items-end h-[60vh] w-[120%] -rotate-12">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ height: ['20%', '80%', '40%', '90%', '30%'] }}
              transition={{ duration: 1.5 + Math.random(), repeat: Infinity, ease: 'easeInOut' }}
              className="w-4 bg-blood-red rounded-t-full"
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <header className="mb-16 md:mb-24 text-center">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="text-5xl md:text-7xl font-bebas text-foreground tracking-widest drop-shadow-[0_0_20px_rgba(139,0,0,0.5)]"
          >
            TRENDING <span className="text-blood-red">TRACKS</span>
          </motion.h2>
          <p className="text-text-secondary font-syne text-[10px] uppercase tracking-[0.3em] mt-4">
            Curated Hot Releases
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tracks.length === 0 ? (
            <div className="col-span-3 text-center text-text-secondary font-syne text-xs uppercase tracking-widest">
              No trending tracks available.
            </div>
          ) : (
            tracks.slice(0, 3).map((item, index) => {
              const isPlaying = state.currentTrackId === item.id && state.isPlaying;
              const theme = item.visualIdentity;
              
              return (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className="bg-surface/80 backdrop-blur-md p-8 border border-elevated rounded-xl hover:border-blood-red/50 transition-colors flex flex-col justify-between cursor-pointer"
                  onClick={() => {
                    if (state.currentTrackId === item.id) {
                      if (state.isPlaying) {
                        audioManager.pause();
                      } else {
                        audioManager.resume();
                      }
                    } else {
                      transitionTo(item.id);
                    }
                  }}
                >
                  <div>
                    <div className="flex justify-between items-start mb-12">
                      <div className="w-12 h-12 rounded-full bg-blood-red/10 flex items-center justify-center border border-blood-red/25">
                        <span className="text-crimson font-syne text-[10px]">0{index + 1}</span>
                      </div>
                      <span className="text-blood-red font-syne text-[9px] uppercase tracking-widest border border-blood-red/35 px-2.5 py-0.5 rounded-full bg-blood-red/5">
                        Trending
                      </span>
                    </div>

                    {/* Mini Cover for context */}
                    <div className="w-24 h-24 mb-6 border border-elevated overflow-hidden shadow-lg">
                      <PremiumImage src={item.artwork.url} alt={item.title} />
                    </div>
                    
                    <h3 className="text-3xl font-bebas text-foreground tracking-wide mb-2 line-clamp-1 truncate" title={item.title}>
                      {item.title}
                    </h3>
                    <p className="text-text-secondary text-xs font-sans mb-6">
                      Artist: {item.artist} &bull; Genre: {item.genre}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-elevated pt-6 mt-6">
                    <span className="text-xs font-syne uppercase tracking-wider text-text-secondary">
                      {item.album || 'Single'}
                    </span>
                    
                    <div className="w-10 h-10 rounded-full bg-blood-red/15 text-blood-red flex items-center justify-center group-hover:bg-blood-red group-hover:text-white transition-all">
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
