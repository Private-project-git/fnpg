'use client';

/**
 * ScrollProvider — Lenis smooth scroll + GSAP ScrollTrigger integration.
 *
 * CRITICAL FIX:
 * The original implementation had:
 *   <ScrollContext.Provider value={lenisRef.current}>
 * This always provided null because lenisRef.current is assigned inside
 * useEffect, which runs AFTER the first render. Consumers of useScroll()
 * always received null on first render and were never notified of the update.
 *
 * Fix: Use useState to hold the Lenis instance so React re-renders all
 * consumers when the instance is ready.
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP ScrollTrigger only in browser
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const ScrollContext = createContext<Lenis | null>(null);

export const ScrollProvider = ({ children }: { children: ReactNode }) => {
  // useState (not useRef) so consumers re-render when Lenis becomes ready
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    // Connect Lenis to GSAP ScrollTrigger
    lenisInstance.on('scroll', ScrollTrigger.update);

    const rafCallback = (time: number) => {
      lenisInstance.raf(time * 1000);
    };
    gsap.ticker.add(rafCallback);
    gsap.ticker.lagSmoothing(0);

    // Proxy the scroller so ScrollTrigger understands Lenis positions
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        return arguments.length
          ? lenisInstance.scrollTo(value!)
          : lenisInstance.scroll;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
    });

    // Notify consumers that Lenis is ready
    setLenis(lenisInstance);

    return () => {
      gsap.ticker.remove(rafCallback);
      lenisInstance.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <ScrollContext.Provider value={lenis}>
      {children}
    </ScrollContext.Provider>
  );
};

/** Returns the Lenis instance, or null before it is initialized. */
export const useScroll = () => useContext(ScrollContext);
