'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSectionAudio } from '@/hooks/useSectionAudio';
import { Timeline as DiscographyTimeline } from '@/components/discography/Timeline';

export const Discography = () => {
  // Triggers the ambient track soundscape when in this section
  const sectionRef = useSectionAudio('ambient', 0.25);

  return (
    <section 
      ref={sectionRef}
      id="discography" 
      className="relative w-full bg-[#050505] flex flex-col py-32 overflow-hidden border-t border-white/5"
    >
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
          CHRONOLOGICAL AUDIO TIMELINE
        </p>
      </header>

      <div className="relative z-10">
        <DiscographyTimeline />
      </div>
    </section>
  );
};

