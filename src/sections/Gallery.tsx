'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSectionAudio } from '@/hooks/useSectionAudio';
import { PremiumImage } from '@/components/PremiumImage';

// Registers GSAP ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface GalleryItem {
  id: number;
  url: string;
  title: string;
  category: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600&auto=format&fit=crop',
    title: 'THE RECORDING CABIN',
    category: 'STUDIO SESSION',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
    title: 'STATIC REVERBERATION',
    category: 'LIVE SETTING',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=600&auto=format&fit=crop',
    title: 'FREQUENCY DENSITY',
    category: 'MODULAR SYNTH',
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop',
    title: 'MOUNTAINOUS VIBRATION',
    category: 'LANDSCAPE ECHO',
  },
];

export const Gallery = ({ settings }: { settings?: any }) => {
  // Triggers crossfade back to ambient soundtrack during gallery interaction
  const sectionRef = useSectionAudio('ambient', 0.2);
  const scrollSectionRef = useRef<HTMLDivElement>(null);

  const items = settings?.gallery_config || GALLERY_ITEMS;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const scrollSection = scrollSectionRef.current;
    if (!scrollSection) return;

    // Calculate translation distance
    const getScrollAmount = () => {
      return -(scrollSection.scrollWidth - window.innerWidth);
    };

    // Horizontal Scroll Trigger
    const scrollAnimation = gsap.to(scrollSection, {
      x: getScrollAmount,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        pin: true,
        scrub: 1,
        start: 'top top',
        end: () => `+=${scrollSection.scrollWidth - window.innerWidth}`,
        invalidateOnRefresh: true, // Recalculates sizes on window resize
      },
    });

    // Sub-animation: Image Parallax inside frames
    const images = scrollSection.querySelectorAll('.gallery-image');
    images.forEach((img) => {
      gsap.fromTo(
        img,
        { x: -50 },
        {
          x: 50,
          ease: 'none',
          scrollTrigger: {
            trigger: img.closest('.gallery-card'),
            containerAnimation: scrollAnimation, // Links it to the horizontal motion
            scrub: true,
            start: 'left right',
            end: 'right left',
          },
        }
      );
    });

    return () => {
      scrollAnimation.scrollTrigger?.kill();
    };
  }, [sectionRef, items]);

  return (
    <div
      ref={sectionRef}
      id="gallery"
      className="relative w-full h-screen bg-[#050505] overflow-hidden border-t border-white/5"
    >
      <div
        ref={scrollSectionRef}
        className="h-full flex items-center gap-12 md:gap-24 px-[10vw] w-max relative"
        data-cursor-label="DRAG"
      >
        {/* Gallery Intro Block */}
        <div className="flex flex-col justify-center min-w-[300px] md:min-w-[450px]">
          <span className="text-xs font-syne tracking-[0.5em] text-crimson uppercase font-semibold mb-3">
            VISUALS
          </span>
          <h2 className="text-5xl md:text-7xl font-bebas tracking-wider text-foreground leading-[0.9] select-none">
            CINEMATIC
            <br />
            STATIONS
          </h2>
          <p className="font-sans text-xs md:text-sm text-text-secondary leading-relaxed tracking-wider mt-6 max-w-sm">
            Captured moments of raw audio development and cold mountainous static. Drag or scroll to browse the documentation.
          </p>
        </div>

        {/* Gallery Item Cards */}
        {items.map((item: any) => (
          <div
            key={item.id}
            className="gallery-card relative w-[75vw] h-[55vh] md:w-[45vw] md:h-[60vh] flex-shrink-0 overflow-hidden bg-[#101010] border border-white/5 rounded group"
            data-cursor-label="VIEW"
          >
            {/* Inner Parallax Image Frame */}
            <div className="absolute inset-[-50px] w-[calc(100%+100px)] h-full overflow-hidden">
              <PremiumImage
                src={item.url}
                alt={item.title}
                imgClassName="gallery-image w-full h-full object-cover filter grayscale-[80%] contrast-110 brightness-[0.4] group-hover:scale-105 group-hover:brightness-[0.7] group-hover:grayscale-0 transition-all duration-700 ease-out"
                className="w-full h-full"
              />
              <div className="absolute inset-0 bg-blood-red/10 mix-blend-color-dodge opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>

            {/* Content Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 pointer-events-none" />

            {/* Image Details */}
            <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 flex flex-col gap-1 z-10">
              <span className="text-[10px] tracking-[0.3em] font-syne text-crimson uppercase font-semibold">
                {item.category}
              </span>
              <h3 className="font-bebas text-2xl md:text-3xl text-foreground tracking-wider uppercase">
                {item.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
