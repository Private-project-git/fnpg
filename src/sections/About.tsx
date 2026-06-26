'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSectionAudio } from '@/hooks/useSectionAudio';

export const About = () => {
  // Triggers the "vinyl" crackle soundscape when this section is active
  const sectionRef = useSectionAudio('vinyl', 0.25);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 60, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const, // easeOutExpo
      },
    },
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative w-full min-h-screen bg-[#050505] py-24 md:py-36 px-[5%] md:px-[10%] flex flex-col justify-center border-t border-white/5"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
        
        {/* Left Column: Handcrafted Editorial Typography */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="lg:col-span-7 flex flex-col gap-8 text-left"
        >
          <motion.span 
            variants={itemVariants} 
            className="text-xs md:text-sm font-syne tracking-[0.5em] text-accent uppercase font-semibold"
          >
            THE ARTIST // 8CTRL
          </motion.span>

          <motion.h2 
            variants={itemVariants}
            className="text-[6.5vw] lg:text-[4vw] font-bebas leading-[1.0] text-foreground select-none"
          >
            ORIGINATING FROM THE MOUNTAINS OF JAMMU.
          </motion.h2>

          <div className="flex flex-col gap-6 font-sans text-text-secondary text-sm md:text-base leading-relaxed tracking-wide">
            <motion.p variants={itemVariants}>
              Operating under the moniker <strong className="text-foreground">8CTRL</strong>, he is an emerging voice in the Northern Indian underground hip-hop landscape. Rooted in Jammu, his releases explore dark textures, raw lyricism, and relentless cadence.
            </motion.p>
            <motion.p variants={itemVariants}>
              In late 2025, he established his sonic identity with the full-length album <em>Chaos</em>. Constantly expanding his cinematic universe, he frequently collaborates with artists like Asur and 4thrv to push the boundaries of regional hip-hop.
            </motion.p>
          </div>

          {/* Quick stats grid */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-3 gap-6 border-t border-white/10 pt-8 mt-4"
          >
            <motion.div variants={itemVariants} className="flex flex-col">
              <span className="text-[10px] tracking-widest text-text-secondary uppercase">Origin</span>
              <span className="font-bebas text-lg md:text-2xl text-foreground tracking-wider mt-1">Jammu, IN</span>
            </motion.div>
            <motion.div variants={itemVariants} className="flex flex-col">
              <span className="text-[10px] tracking-widest text-text-secondary uppercase">Label</span>
              <span className="font-bebas text-lg md:text-2xl text-foreground tracking-wider mt-1">Independent</span>
            </motion.div>
            <motion.div variants={itemVariants} className="flex flex-col">
              <span className="text-[10px] tracking-widest text-text-secondary uppercase">Debut Album</span>
              <span className="font-bebas text-lg md:text-2xl text-foreground tracking-wider mt-1">Chaos (2025)</span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Right Column: High-contrast Dark Portrait Image */}
        <div className="lg:col-span-5 relative w-full aspect-[4/5] lg:aspect-[3/4] overflow-hidden group border border-white/10 bg-[#101010] rounded">
          <motion.div
            initial={{ scale: 1.15, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, amount: 0.2 }}
            className="w-full h-full"
          >
            <img
              src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop"
              alt="8CTRL Silhouette Portrait"
              className="w-full h-full object-cover filter grayscale contrast-[1.25] brightness-[0.6] group-hover:scale-105 group-hover:brightness-[0.75] transition-all duration-700 ease-out"
            />
          </motion.div>
          
          {/* Subtle Ambient Red Glow behind border */}
          <div className="absolute inset-0 bg-gradient-to-t from-accent/15 via-transparent to-transparent pointer-events-none" />
        </div>

      </div>
    </section>
  );
};
