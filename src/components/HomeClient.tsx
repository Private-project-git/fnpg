'use client';

import React, { useEffect, useState } from 'react';
import { useScroll } from '@/components/ScrollProvider';
import { AudioPlayer } from '@/components/AudioPlayer';

// The 11 Scenes / Section Components
import { Landing } from '@/sections/Landing'; // 01 & 02
import { Hero } from '@/sections/Hero'; // 03
import { Identity } from '@/sections/Identity'; // 04
import { FeaturedReleases } from '@/sections/FeaturedReleases'; // 05
import { ArtistFavorites } from '@/sections/ArtistFavorites'; // 06
import { FanFavorites } from '@/sections/FanFavorites'; // 07
import { HottestPlays } from '@/sections/HottestPlays'; // 08
import { Discography } from '@/sections/Discography'; // 09
import { Gallery } from '@/sections/Gallery'; // 10
import { Quotes } from '@/sections/Quotes'; // 11
import { Platforms } from '@/sections/Platforms'; // 12
import { Credits } from '@/sections/Credits'; // 13 & 14

const SECTION_COMPONENTS: Record<string, React.ComponentType<any>> = {
  'hero': Hero,
  'identity': Identity,
  'featured': FeaturedReleases,
  'artist-favs': ArtistFavorites,
  'fan-favs': FanFavorites,
  'trending': HottestPlays,
  'discography': Discography,
  'gallery': Gallery,
  'quotes': Quotes,
  'platforms': Platforms,
  'credits': Credits
};

const DEFAULT_SECTIONS = [
  { id: 'hero', enabled: true },
  { id: 'identity', enabled: true },
  { id: 'featured', enabled: true },
  { id: 'artist-favs', enabled: true },
  { id: 'fan-favs', enabled: true },
  { id: 'trending', enabled: true },
  { id: 'discography', enabled: true },
  { id: 'gallery', enabled: true },
  { id: 'quotes', enabled: true },
  { id: 'platforms', enabled: true },
  { id: 'credits', enabled: true }
];

interface HomeClientProps {
  initialSettings: any;
  initialReleases: any[];
}

export function HomeClient({ initialSettings, initialReleases }: HomeClientProps) {
  const [isEntered, setIsEntered] = useState(false);
  const [settings] = useState<any>(initialSettings);
  const lenis = useScroll();

  // Initially lock scroll when landing page is visible
  useEffect(() => {
    if (lenis) {
      if (!isEntered) {
        lenis.stop();
      } else {
        lenis.start();
      }
    }
  }, [lenis, isEntered]);

  const handleEnter = () => {
    setIsEntered(true);
  };

  // Apply visual style custom variables globally
  useEffect(() => {
    if (settings?.visual_studio_config) {
      const config = settings.visual_studio_config;
      const root = document.documentElement;
      if (config.borderRadius) root.style.setProperty('--border-radius', `${config.borderRadius}px`);
      if (config.glassBlur) root.style.setProperty('--glass-blur', `${config.glassBlur}px`);
      if (config.componentSpacing) root.style.setProperty('--component-spacing', `${config.componentSpacing}px`);
      if (config.animationSpeed) root.style.setProperty('--animation-speed', `${config.animationSpeed}s`);
      if (config.filmGrainOpacity !== undefined) {
        root.style.setProperty('--noise-opacity', `${config.filmGrainOpacity / 100}`);
      }
      if (config.vignetteSize !== undefined) {
        root.style.setProperty('--vignette-size', `${config.vignetteSize}px`);
      }
    }
  }, [settings]);

  const layoutSections = settings?.homepage_layout?.sections || DEFAULT_SECTIONS;

  return (
    <div className="relative w-full min-h-screen bg-[#050505] overflow-x-hidden">
      {/* Landing Experience Overlay (Scenes 01 & 02) */}
      <Landing onEnter={handleEnter} />

      {/* Main Experience Layout */}
      <div 
        className={`w-full transition-opacity duration-1000 ${
          isEntered ? 'opacity-100 pointer-events-auto' : 'opacity-0 h-screen overflow-hidden pointer-events-none'
        }`}
      >
        {/* Render sections dynamically in the configured order */}
        {layoutSections.map((section: any) => {
          if (!section.enabled) return null;
          const Component = SECTION_COMPONENTS[section.id];
          if (!Component) return null;
          
          return (
            <div 
              key={section.id} 
              className={section.spacing || ''} 
              style={{
                backgroundColor: section.backgroundOverride || undefined
              }}
            >
              {section.id === 'featured' ? (
                <Component settings={settings} initialReleases={initialReleases} />
              ) : (
                <Component settings={settings} />
              )}
            </div>
          );
        })}
        
        {/* Floating Mini Controller */}
        <AudioPlayer />
      </div>
    </div>
  );
}
