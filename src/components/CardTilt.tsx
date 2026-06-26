'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface CardTiltProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}

export const CardTilt = ({ children, className = '', maxTilt = 12 }: CardTiltProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Motion values to track mouse coordinates as percentages (0 to 1)
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  // Smooth springs to interpolate coordinates
  const springConfig = { damping: 22, stiffness: 180, mass: 1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  // Map coordinate percentages to angle rotations (maxTilt degrees)
  const rotateX = useTransform(springY, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(springX, [0, 1], [-maxTilt, maxTilt]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Mouse coordinates relative to card bounds
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    x.set(mouseX / width);
    y.set(mouseY / height);
  };

  const handleMouseLeave = () => {
    // Smoothly snap card back to center/flat position
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={`perspective-[1000px] cursor-pointer ${className}`}
    >
      {/* Children receive nested depth using Z translations */}
      <div 
        style={{ 
          transform: 'translateZ(25px)', 
          transformStyle: 'preserve-3d' 
        }}
        className="w-full h-full"
      >
        {children}
      </div>
    </motion.div>
  );
};
