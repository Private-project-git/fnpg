'use client';

import React, { useState, useEffect } from 'react';
import { Music } from 'lucide-react';

interface PremiumImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  sizes?: string;
}

export const PremiumImage: React.FC<PremiumImageProps> = ({
  src,
  alt,
  className = '',
  imgClassName = '',
  sizes,
}) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    if (!src) {
      setStatus('error');
      return;
    }
    
    setStatus('loading');
    
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setStatus('loaded');
    };
    
    img.onerror = () => {
      setStatus('error');
    };
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  if (status === 'error' || !src) {
    return (
      <div 
        className={`w-full h-full bg-[#0E0E0E] border border-[#181818] flex flex-col items-center justify-center text-text-secondary select-none gap-3 p-4 text-center ${className}`}
        aria-label={`${alt} fallback placeholder`}
      >
        <div className="w-10 h-10 rounded-full bg-blood-red/10 flex items-center justify-center text-crimson">
          <Music className="w-5 h-5" />
        </div>
        <span className="text-[9px] font-syne uppercase tracking-widest leading-none">
          Artwork Unavailable
        </span>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden bg-[#050505] ${className}`}>
      {/* Blur Pulse Placeholder during loading */}
      {status === 'loading' && (
        <div className="absolute inset-0 bg-gradient-to-br from-blood-red/20 to-[#0E0E0E] animate-pulse blur-xl scale-110 z-10" />
      )}
      
      {/* Actual Image */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        sizes={sizes}
        className={`w-full h-full object-cover transition-all duration-700 ease-[0.16,1,0.3,1] ${imgClassName} ${
          status === 'loaded' 
            ? 'opacity-100 blur-0 scale-100' 
            : 'opacity-0 blur-md scale-105'
        }`}
      />
    </div>
  );
};
