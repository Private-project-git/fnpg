// src/engine/MotionProvider.tsx
import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import { Variants } from 'framer-motion';

/** Motion preset definitions. All variants are memoized and share a common timing/easing. */
export const motionPresets = {
  fade: (duration = 0.8, ease: number[] = [0.4, 0, 0.2, 1]) => ({
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration, ease } },
    exit: { opacity: 0, transition: { duration, ease } },
  } as any),
  blurReveal: (duration = 0.8) => ({
    initial: { filter: 'blur(20px)', opacity: 0 },
    animate: { filter: 'blur(0px)', opacity: 1, transition: { duration, ease: [0.42, 0, 0.58, 1] } },
    exit: { filter: 'blur(20px)', opacity: 0, transition: { duration, ease: [0.42, 0, 0.58, 1] } },
  } as any),
  maskReveal: (duration = 0.9) => ({
    initial: { clipPath: 'inset(0% 100% 0% 0%)' },
    animate: { clipPath: 'inset(0% 0% 0% 0%)', transition: { duration, ease: [0.25, 0.8, 0.25, 1] } },
    exit: { clipPath: 'inset(0% 100% 0% 0%)', transition: { duration, ease: [0.25, 0.8, 0.25, 1] } },
  } as any),
  characterReveal: (stagger = 0.03) => ({
    animate: {
      transition: { staggerChildren: stagger },
    },
    children: {
      initial: { y: '100%', opacity: 0 },
      animate: { y: '0%', opacity: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
    },
  } as any), // typed as any because it composes inner variants
  wordReveal: (stagger = 0.05) => ({
    animate: { transition: { staggerChildren: stagger } },
    children: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] } },
    },
  } as any),
  parallaxNear: (y = 30) => ({
    initial: { y: 0 },
    animate: {
      y,
      transition: { type: 'spring', stiffness: 30, damping: 20 },
    },
  } as any),
  parallaxFar: (y = 15) => ({
    initial: { y: 0 },
    animate: {
      y,
      transition: { type: 'spring', stiffness: 20, damping: 15 },
    },
  } as any),
  scaleReveal: (scale = 1.05, duration = 0.6) => ({
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale, opacity: 1, transition: { duration, ease: [0.25, 0.8, 0.25, 1] } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  } as any),
  depthShift: (z = -200) => ({
    initial: { translateZ: 0 },
    animate: { translateZ: z, transition: { type: 'spring', stiffness: 40 } },
  } as any),
  slideMask: (direction: 'left' | 'right' = 'right', duration = 0.7) => ({
    initial: { clipPath: direction === 'right' ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 0% 100%)' },
    animate: {
      clipPath: 'inset(0% 0% 0% 0%)',
      transition: { duration, ease: [0.42, 0, 0.58, 1] },
    },
    exit: {
      clipPath: direction === 'right' ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 0% 100%)',
      transition: { duration, ease: [0.42, 0, 0.58, 1] },
    },
  } as any),
};

type MotionContextProps = {
  presets: typeof motionPresets;
};

const MotionContext = createContext<MotionContextProps | undefined>(undefined);

export const MotionProvider = ({ children }: { children: ReactNode }) => {
  const presets = useMemo(() => motionPresets, []);
  return <MotionContext.Provider value={{ presets }}>{children}</MotionContext.Provider>;
};

export const useMotion = (): MotionContextProps => {
  const ctx = useContext(MotionContext);
  if (!ctx) throw new Error('useMotion must be used within MotionProvider');
  return ctx;
};
