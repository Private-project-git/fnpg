'use client';

import React, { useRef } from 'react';
import { motion, useTransform } from 'framer-motion';
import { useSafeScroll } from '@/hooks/useSafeScroll';

export const Identity = ({ settings }: { settings?: any }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // useSafeScroll waits until the ref's DOM node is mounted before
  // registering the scroll observer — prevents "ref not hydrated" error.
  const { scrollYProgress } = useSafeScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  const profile = settings?.artist_profile || {};
  const biography = profile.biography || 'Hailing from Jammu, 8CTRL has redefined the regional hip-hop landscape by fusing raw emotion with cinematic production. An independent force. A creative anomaly. This space exists as the definitive archive of his sonic journey.';
  const name = profile.name || '8CTRL';
  const heroText = profile.heroText || 'BORN IN THE SHADOWS. RAISED BY THE SOUND.';
  const location = profile.location || 'Jammu & Kashmir // 32.73° N, 74.87° E';

  const platforms = [
    { name: 'Spotify', url: profile.streamingLinks?.spotify || '#' },
    { name: 'Apple Music', url: profile.streamingLinks?.appleMusic || '#' },
    { name: 'YouTube', url: profile.socialLinks?.youtube || '#' }
  ];

  return (
    // The ref MUST be on this element — it is always rendered (no conditional return).
    <section ref={containerRef} className="relative w-full min-h-screen bg-[#050505] flex items-center py-32">
      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32">
        
        {/* Left Column: Visual Impact */}
        <motion.div 
          style={{ y: y1, opacity }} 
          className="relative h-[60vh] md:h-[80vh] w-full"
        >
          <div className="absolute inset-0 bg-surface rounded-sm overflow-hidden filter grayscale-[80%] contrast-125 border border-elevated">
            {/* Placeholder for Artist Image */}
            <div className="w-full h-full bg-[#0E0E0E] flex items-center justify-center text-text-secondary font-syne text-xs uppercase tracking-widest">
              [ {name} VISUAL ]
            </div>
            
            {/* Subtle red overlay on image */}
            <div className="absolute inset-0 bg-blood-red/10 mix-blend-color-dodge pointer-events-none" />
          </div>
        </motion.div>

        {/* Right Column: Verified Identity */}
        <div className="flex flex-col justify-center space-y-12">
          
          <div>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-crimson font-syne text-[10px] tracking-[0.4em] uppercase mb-4"
            >
              {location}
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bebas tracking-wide text-foreground leading-[0.9] whitespace-pre-line"
            >
              {heroText}
            </motion.h2>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="h-[1px] w-full bg-gradient-to-r from-blood-red/50 to-transparent"
          />

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="space-y-6 text-text-secondary font-sans text-sm md:text-base max-w-md leading-relaxed"
          >
            <p>{biography}</p>
          </motion.div>

          {/* Quick Platform Links */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="flex gap-8"
          >
            {platforms.map((platform) => (
              <a 
                key={platform.name}
                href={platform.url} 
                className="font-syne text-[11px] tracking-widest uppercase text-foreground hover:text-crimson transition-colors"
              >
                {platform.name}
              </a>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
};
