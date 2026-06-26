'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { useAudio } from '@/audio/AudioContext';
import { PremiumImage } from '@/components/PremiumImage';

export const ArtistFavorites = () => {
  const { state, transitionTo, audioManager } = useAudio();

  // Filter artist favorites
  const tracks = audioManager.getTracks().filter(t => t.theme.artistFavorite);


  return (
    <section className="relative w-full min-h-screen bg-[#050505] py-32 flex flex-col justify-center">
      <div className="max-w-7xl mx-auto px-6 w-full">
        
        <header className="mb-20 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-5xl md:text-7xl font-bebas text-foreground tracking-widest"
          >
            ARTIST'S <span className="text-crimson">FAVORITES</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-text-secondary font-syne text-xs uppercase tracking-[0.4em] mt-4"
          >
            Personally curated by 8CTRL
          </motion.p>
        </header>

        {/* Cards Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {tracks.length === 0 ? (
            <div className="col-span-3 text-center text-text-secondary font-syne text-xs uppercase tracking-widest">
              No favorites curated yet.
            </div>
          ) : (
            tracks.map((item, index) => {
              const isPlaying = state.currentTrackId === item.id && state.isPlaying;
              const theme = item.visualIdentity;
              
              return (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className="group cursor-pointer"
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
                  <div 
                    className="relative aspect-square mb-6 overflow-hidden rounded-sm bg-surface border transition-all duration-500 hover:scale-[1.02]"
                    style={{ borderColor: isPlaying ? theme.accentColor : '#181818' }}
                  >
                    <PremiumImage 
                      src={item.artwork.url} 
                      alt={item.title} 
                      className="w-full h-full object-cover filter grayscale-[50%] group-hover:grayscale-0 transition-all duration-700" 
                    />
                    
                    {/* Hover Glow */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-color-dodge flex items-center justify-center bg-black/35"
                    >
                      <div className="p-3.5 rounded-full bg-black/85 border border-white/5 text-white">
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bebas text-foreground tracking-wide mb-2 group-hover:text-blood-red transition-colors line-clamp-1 truncate" title={item.title}>
                    {item.title}
                  </h3>
                  <p className="text-text-secondary text-xs font-sans">
                    A personal favorite selected by 8CTRL, from the album "{item.album || 'Single'}".
                  </p>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
