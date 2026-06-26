'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useTransform } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { PremiumImage } from '@/components/PremiumImage';
import { useSafeScroll } from '@/hooks/useSafeScroll';

interface Release {
  id: string;
  title: string;
  description: string | null;
  releaseYear: number;
  coverUrl: string | null;
  spotifyUrl: string | null;
  appleUrl: string | null;
  type: string;
  isFeatured: boolean;
}

export const FeaturedReleases = ({ initialReleases }: { initialReleases?: Release[] }) => {
  // The ref MUST be declared and attached unconditionally.
  const containerRef = useRef<HTMLDivElement>(null);
  const [featuredRelease, setFeaturedRelease] = useState<Release | null>(null);

  useEffect(() => {
    if (initialReleases && initialReleases.length > 0) {
      const featured = initialReleases.find((r: Release) => r.isFeatured) || initialReleases[0];
      setFeaturedRelease(featured);
    } else {
      fetch('/api/admin/releases')
        .then(res => res.json())
        .then(resJson => {
          const data = resJson.success ? resJson.data : null;
          if (Array.isArray(data) && data.length > 0) {
            const featured = data.find((r: Release) => r.isFeatured) || data[0];
            setFeaturedRelease(featured);
          }
        })
        .catch(console.error);
    }
  }, [initialReleases]);

  // useSafeScroll: only subscribes once containerRef.current is a live DOM node.
  const { scrollYProgress } = useSafeScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  // Section is always rendered so containerRef stays attached.
  // Content fades in when data arrives.
  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen lg:h-screen bg-[#050505] overflow-hidden flex items-center py-20 lg:py-0"
      aria-hidden={!featuredRelease}
    >
      {/* Background Atmosphere — always present */}
      <motion.div 
        style={{ scale: bgScale }}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505] z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(139,0,0,0.2)_0%,transparent_60%)] z-10" />
      </motion.div>

      {/* Content: only shown when data is ready */}
      {featuredRelease && (
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center h-full">
          
          {/* Release Info */}
          <div className="order-2 md:order-1 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <p className="text-crimson font-syne text-[10px] tracking-[0.4em] uppercase mb-4">
                Featured {featuredRelease.type} &bull; {featuredRelease.releaseYear}
              </p>
              <h2 className="text-5xl md:text-7xl font-bebas tracking-wide text-foreground leading-[0.9] mb-6 uppercase">
                {featuredRelease.title}
              </h2>
              <p className="text-text-secondary font-sans max-w-md mb-8">
                {featuredRelease.description || "Discover the sonic textures and themes behind 8CTRL's latest creation. An immersive cinematic release."}
              </p>
              
              <div className="flex gap-6 items-center">
                {featuredRelease.appleUrl && (
                  <a 
                    href={featuredRelease.appleUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="bg-blood-red hover:bg-crimson text-white font-syne text-[10px] tracking-[0.2em] uppercase px-8 py-4 transition-colors flex items-center gap-2"
                  >
                    Apple Music <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {featuredRelease.spotifyUrl && (
                  <a 
                    href={featuredRelease.spotifyUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-text-secondary hover:text-foreground font-syne text-[10px] tracking-[0.2em] uppercase transition-colors flex items-center gap-2"
                  >
                    Spotify <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </motion.div>
          </div>

          {/* Artwork Reveal */}
          <div className="order-1 md:order-2 flex justify-center md:justify-end">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative w-[300px] h-[300px] md:w-[480px] md:h-[480px] shadow-[0_20px_50px_rgba(139,0,0,0.3)] perspective-[1000px] border border-elevated overflow-hidden"
            >
              <PremiumImage 
                src={featuredRelease.coverUrl} 
                alt={featuredRelease.title} 
                className="w-full h-full object-cover" 
              />
            </motion.div>
          </div>

        </div>
      )}

      {/* Skeleton while loading — keeps layout stable */}
      {!featuredRelease && (
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex items-center justify-center h-full">
          <div className="w-8 h-8 border border-blood-red/30 border-t-blood-red rounded-full animate-spin opacity-40" />
        </div>
      )}
    </section>
  );
};
