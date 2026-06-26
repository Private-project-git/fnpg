// src/components/discography/Timeline.tsx
'use client';

import React, { useRef } from 'react';
import { useSpring } from 'framer-motion';
import { useSafeScroll } from '@/hooks/useSafeScroll';
import { TimelineItem, DiscographyRelease } from './TimelineItem';
import { TimelineConnector } from './TimelineConnector';

const DISCOGRAPHY_DATA: DiscographyRelease[] = [
  {
    title: 'Chaos',
    type: 'Album',
    date: 'OCTOBER 2025',
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/b2/a3/f9/b2a3f926-98a3-4ce6-4307-c31e5e9c2331/5063858925487_cover.jpg/600x600bb.jpg',
    description: "The debut full-length project that established the artist's signature sound. A dense atmospheric landscape.",
    trackCount: 14,
    tracks: [
      { title: 'Banger Banger' },
      { title: 'Chaos' },
      { title: 'Discipline' },
      { title: 'Al-Qaidi' },
      { title: 'J-Town' },
      { title: 'Bancho' },
      { title: 'Switch The Sound (Interlude)' },
      { title: 'Iceyyy' },
      { title: 'Backseat' },
      { title: 'Booze' },
      { title: 'Ek Aur Kashh' },
      { title: 'Kaalpanik' },
      { title: 'Afterdawn' },
      { title: '4thrverse (Outro)' }
    ]
  },
  {
    title: 'Sesh in the Pool',
    type: 'Single',
    date: 'JANUARY 2026',
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/97/d5/18/97d51833-d7c3-2a4e-e6d1-b670169f2971/5063904214824_cover.jpg/600x600bb.jpg',
    description: 'Standalone single released after the debut album. A late-night chill vibe.',
    duration: '3:05'
  },
  {
    title: 'No Melody',
    type: 'Single',
    date: 'FEBRUARY 2026',
    artwork: 'https://i.scdn.co/image/ab67616d00001e020f0c488f889a2c86e3dd052a',
    description: 'Beginning of a new chapter in the discography. Hard industrial dynamic production.',
    duration: '2:58'
  },
  {
    title: 'Pills',
    type: 'Single',
    date: 'MARCH 2026',
    artwork: 'https://i.scdn.co/image/ab67616d00001e02918e9c7ce58f3d6c978517ee',
    description: 'Evolving modular synth transitions combined with aggressive heavy trap beats.',
    duration: '3:12'
  },
  {
    title: '911',
    type: 'Single',
    date: 'APRIL 2026',
    artwork: 'https://i.scdn.co/image/ab67616d00001e02f824d2025b087b6dc1fdd021',
    description: 'Driving sub-bass glides and atmospheric sound design for a cinematic landscape.',
    duration: '2:45'
  },
  {
    title: 'SUKUNA',
    type: 'Single',
    date: 'MAY 2026',
    artwork: 'https://i.scdn.co/image/ab67616d00001e02fd415468919f9dc99a59dae0',
    description: 'Cinematic drill collaboration containing heavy 808s and raw experimental elements.',
    featuredArtists: ['4thrv'],
    duration: '2:48'
  },
  {
    title: 'Fuck You Bro',
    type: 'Single',
    date: 'JUNE 2026',
    artwork: 'https://i.scdn.co/image/ab67616d00001e02c670840d4da3c114d80a2f22',
    description: 'Hard-hitting energetic outro single wrapping up the recent body of work.',
    duration: '3:05'
  }
];

export const Timeline: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useSafeScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001,
  });

  return (
    <div ref={containerRef} className="max-w-5xl mx-auto relative px-4 sm:px-6">
      {/* Scroll-Animated Vertical Line */}
      <TimelineConnector progress={scaleY} />

      {/* Release list rendered chronologically (ascending order) */}
      <div className="flex flex-col gap-16 md:gap-24 relative z-10">
        {DISCOGRAPHY_DATA.map((release, idx) => (
          <TimelineItem 
            key={`${release.title}-${release.date}`} 
            release={release} 
            index={idx} 
          />
        ))}
      </div>
    </div>
  );
};
