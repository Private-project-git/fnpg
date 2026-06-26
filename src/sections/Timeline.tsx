'use client';

import React, { useRef } from 'react';
import { motion, useSpring } from 'framer-motion';
import { useSafeScroll } from '@/hooks/useSafeScroll';
import { useSectionAudio } from '@/hooks/useSectionAudio';

interface Milestone {
  year: string;
  title: string;
  desc: string;
}

const MILESTONES: Milestone[] = [
  {
    year: '2025',
    title: 'THE CHAOS ERA',
    desc: 'The release of the full-length album "Chaos" in October 2025 marks a pivotal moment, featuring heavy-hitting tracks like "Discipline" and collaborative universe building with 4thrv.',
  },
  {
    year: 'JAN 2026',
    title: 'SESH IN THE POOL',
    desc: 'Kicking off the new year with "Sesh in the Pool", maintaining momentum and expanding his signature dark atmosphere.',
  },
  {
    year: 'FEB-MAR 2026',
    title: 'NO MELODY & PILLS',
    desc: 'Drops "No Melody" followed closely by "Pills" in March, showcasing dense lyricism and cold, driving production.',
  },
  {
    year: 'APR-MAY 2026',
    title: '911 & SUKUNA',
    desc: 'The intensity continues to scale up with the release of "911", followed by the hard-hitting single "SUKUNA" in late May.',
  },
];

export const Timeline = ({ settings }: { settings?: any }) => {
  // Triggers the ambient track soundscape when in this section
  const sectionRef = useSectionAudio('ambient', 0.25);

  // containerRef is on the inner content div (what the progress line tracks).
  // useSafeScroll waits until this node is mounted.
  const containerRef = useRef<HTMLDivElement>(null);

  const milestones = settings?.timeline_events || MILESTONES;

  const { scrollYProgress } = useSafeScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Scale the center vertical line based on scroll progress
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <section
      ref={sectionRef}
      id="timeline"
      className="relative w-full bg-[#050505] py-24 md:py-36 px-[5%] md:px-[10%] border-t border-white/5 overflow-hidden"
    >
      <div ref={containerRef} className="max-w-5xl mx-auto relative">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-20 md:mb-32">
          <span className="text-xs md:text-sm font-syne tracking-[0.5em] text-accent uppercase font-semibold mb-3">
            CHRONOLOGY
          </span>
          <h2 className="text-[7vw] md:text-[4vw] font-bebas tracking-wide text-foreground uppercase">
            Timeline of Static
          </h2>
          <div className="w-12 h-[1px] bg-accent mt-4" />
        </div>

        {/* Vertical Center Line */}
        <div className="absolute left-4 md:left-1/2 top-[180px] bottom-0 w-[1px] -translate-x-1/2 bg-white/10 hidden md:block">
          <motion.div
            style={{ scaleY, originY: 0 }}
            className="w-full h-full bg-accent"
          />
        </div>

        {/* Milestones Container */}
        <div className="flex flex-col gap-16 md:gap-24 relative z-10">
          {milestones.map((item: any, idx: number) => {
            const isEven = idx % 2 === 0;

            return (
              <div
                key={item.year}
                className={`flex flex-col md:flex-row items-start md:items-center justify-between w-full relative ${
                  isEven ? '' : 'md:flex-row-reverse'
                }`}
              >
                {/* Left/Right Card Panel */}
                <div className={`w-full md:w-[45%] pl-8 md:pl-0 ${
                  isEven ? 'md:text-right' : 'md:text-left'
                }`}>
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? -40 : 40, y: 20 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="p-6 md:p-8 bg-[#101010] border border-white/5 rounded relative hover:border-accent/30 transition-colors duration-500 group"
                  >
                    {/* Pulsing Accent Dot inside the card */}
                    <div className="absolute top-6 right-6 w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-accent transition-colors duration-500" />
                    
                    <span className="font-bebas text-3xl md:text-5xl text-accent tracking-widest block mb-2">
                      {item.year}
                    </span>
                    <h3 className="font-syne text-sm md:text-base text-foreground tracking-widest uppercase mb-3">
                      {item.title}
                    </h3>
                    <p className="font-sans text-xs md:text-sm text-text-secondary leading-relaxed tracking-wide">
                      {item.desc}
                    </p>
                  </motion.div>
                </div>

                {/* Vertical Line Anchor Node */}
                <div className="absolute left-4 md:left-1/2 top-4 md:top-1/2 w-3 h-3 rounded-full bg-[#050505] border-2 border-accent -translate-x-1/2 -translate-y-1/2 hidden md:block">
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    className="w-1.5 h-1.5 rounded-full bg-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  />
                </div>

                {/* Empty buffer for spacing out layouts */}
                <div className="hidden md:block w-[45%]" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
