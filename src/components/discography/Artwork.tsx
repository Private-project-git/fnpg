'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ArtworkProps {
  src?: string | null;
  alt: string;
  className?: string;
}

export const Artwork: React.FC<ArtworkProps> = ({ src, alt, className = '' }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Reset states if src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const placeholderUrl = '/placeholders/artwork.jpg';

  return (
    <div 
      className={`relative overflow-hidden aspect-square rounded-2xl bg-[#0e0e0e] border border-white/5 shadow-2xl w-full ${className}`}
    >
      {/* Red/Black Evolving Blur Background Placeholder */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-[#1c0205] to-[#050505] animate-pulse z-0" 
        style={{ animationDuration: '3s' }}
      />

      {/* Loading Skeleton */}
      <AnimatePresence>
        {!isLoaded && !hasError && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent shimmer-effect z-10"
            style={{
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          />
        )}
      </AnimatePresence>

      {/* Image Element */}
      {!hasError && src ? (
        <motion.img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => {
            setIsLoaded(true);
            ScrollTrigger.refresh();
          }}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          whileHover={{ scale: 1.03 }}
        />
      ) : (
        /* Fallback Placeholder Image */
        <motion.img
          src={placeholderUrl}
          alt="Fallback Cover Art"
          onLoad={() => {
            setIsLoaded(true);
            ScrollTrigger.refresh();
          }}
          className="w-full h-full object-cover opacity-30 filter grayscale"
          whileHover={{ scale: 1.03 }}
        />
      )}

      {/* Dynamic Red Glow Shadow on Hover */}
      <div className="absolute inset-0 bg-radial-glow opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-color-dodge z-5" />

      {/* Global CSS for custom shimmer effect animation if not already defined */}
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .shimmer-effect {
          background-image: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(139, 0, 0, 0.05) 50%,
            rgba(255, 255, 255, 0) 100%
          );
        }
        .bg-radial-glow {
          background: radial-gradient(
            circle at center,
            rgba(193, 18, 31, 0.15) 0%,
            transparent 70%
          );
        }
      `}</style>
    </div>
  );
};
