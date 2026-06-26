'use client';

import React, { useRef } from 'react';
import { motion, useTransform, useSpring } from 'framer-motion';
import { useSafeScroll } from '@/hooks/useSafeScroll';

export const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // useSafeScroll defers Motion's scroll observer until after hydration.
  // No mounted state needed — the hook handles that internally.
  const { scrollYProgress } = useSafeScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0px', '250px']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.15]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.8], [0.6, 0.95]);
  const redGlowOpacity = useTransform(scrollYProgress, [0, 0.5], [0.7, 0.2]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-[#050505] flex items-center justify-center"
      data-cursor-label="SCROLL"
    >
      {/* Parallax Background Image */}
      <motion.div
        style={{ y: bgY, scale: bgScale }}
        className="absolute inset-0 w-full h-full select-none pointer-events-none"
      >
        <img
          src="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1920&auto=format&fit=crop"
          alt="Cinematic backdrop"
          className="w-full h-full object-cover filter brightness-[0.25] contrast-[1.2] grayscale-[50%]"
        />
      </motion.div>

      {/* Blood Red Cinematic Lighting */}
      <motion.div 
        style={{ opacity: redGlowOpacity }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,0,0,0.4)_0%,transparent_80%)] pointer-events-none z-1 mix-blend-color-dodge" 
      />

      {/* Dark Ambient Gradient Overlay */}
      <motion.div 
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent pointer-events-none z-1" 
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/90 via-transparent to-[#050505]/90 pointer-events-none z-1" />

      {/* Hero Typography Container */}
      <motion.div
        style={{ y: textY }}
        className="relative z-10 w-full flex flex-col items-center text-center justify-center"
      >
        {/* Massive 8CTRL */}
        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: '100%', opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 1.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-[24vw] md:text-[18vw] font-bebas leading-[0.8] tracking-tight text-foreground select-none drop-shadow-[0_0_30px_rgba(139,0,0,0.3)]"
          >
            8CTRL
          </motion.h1>
        </div>

        {/* Editorial Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5, ease: 'easeOut' }}
          className="mt-6 text-xs md:text-sm tracking-[0.8em] uppercase text-text-secondary font-syne select-none"
        >
          Blood Red Cinematic
        </motion.p>

        {/* Floating Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 2.5, duration: 1.5 }}
          className="absolute bottom-[-20vh] flex flex-col items-center gap-4 cursor-pointer"
        >
          <span className="text-[9px] tracking-[0.5em] uppercase text-text-secondary font-syne">
            Scroll to Enter
          </span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-[1px] h-16 bg-gradient-to-b from-blood-red to-transparent"
          />
        </motion.div>
      </motion.div>
    </div>
  );
};
