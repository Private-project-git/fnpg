'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { useAudio } from '@/audio/AudioContext';
import { PremiumImage } from '@/components/PremiumImage';

export const FanFavorites = () => {
  const { state, transitionTo, audioManager } = useAudio();

  // Filter fan favorites
  const tracks = audioManager.getTracks().filter(t => t.theme.fanFavorite);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <section className="relative w-full py-32 bg-[#050505]">
      <div className="max-w-5xl mx-auto px-6">
        
        <header className="mb-20">
          <motion.h2 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="text-4xl md:text-6xl font-bebas text-foreground tracking-widest"
          >
            FAN <span className="text-blood-red">FAVORITES</span>
          </motion.h2>
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="h-[1px] w-32 bg-crimson mt-4 origin-left"
          />
        </header>

        <div className="space-y-6">
          {tracks.length === 0 ? (
            <div className="text-text-secondary font-syne text-xs uppercase tracking-widest">
              No fan favorites found.
            </div>
          ) : (
            tracks.map((item, index) => {
              const isPlaying = state.currentTrackId === item.id && state.isPlaying;
              const theme = item.visualIdentity;
              
              return (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group flex items-center gap-6 p-4 rounded bg-surface/50 border border-transparent hover:border-blood-red/30 transition-all duration-300 cursor-pointer relative overflow-hidden"
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
                  {/* Hover bg sweep */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blood-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10 text-2xl font-bebas text-text-secondary w-8 text-center group-hover:text-crimson transition-colors">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  
                  <div className="relative z-10 w-16 h-16 bg-[#181818] rounded-sm flex items-center justify-center border border-elevated overflow-hidden">
                    <PremiumImage 
                      src={item.artwork.url} 
                      alt={item.title} 
                      className="w-full h-full object-cover filter grayscale-[50%] group-hover:grayscale-0 transition-all duration-300" 
                    />
                  </div>
                  
                  <div className="relative z-10 flex-1">
                    <h4 className="text-lg font-bebas text-foreground tracking-wide group-hover:text-white transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-text-secondary font-sans mt-1">
                      {item.artist} &bull; Album: {item.album || 'Single'}
                    </p>
                  </div>

                  {/* Playback indicators / Equalizer block */}
                  <div className="relative z-10 flex items-center gap-4">
                    {isPlaying ? (
                      <div className="flex gap-0.5 items-end h-5 w-6">
                        {[1, 2, 3, 4].map((bar) => (
                          <motion.div
                            key={bar}
                            animate={{ height: ['25%', '100%', '40%', '85%', '25%'] }}
                            transition={{ duration: 0.6 + bar * 0.15, repeat: Infinity, ease: 'linear' }}
                            className="w-1 bg-blood-red"
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs font-syne text-text-secondary">
                        {formatDuration(item.duration)}
                      </span>
                    )}
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
