'use client';

import { useEffect, useRef } from 'react';
import { useAudio } from '@/audio/AudioContext';

export const useSectionAudio = (trackId: string, threshold = 0.45) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const { transitionTo, state } = useAudio();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Only set up observers if the audio system has been unlocked/initialized by the landing page
    if (!state.initialized || !elementRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Switch to this section's track smoothly
          transitionTo(trackId);
        }
      },
      {
        threshold,
        // Using a negative margin so triggers occur closer to the center of the viewport
        rootMargin: '-5% 0px -5% 0px',
      }
    );

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
    };
  }, [trackId, state.initialized, transitionTo, threshold]);

  return elementRef;
};
