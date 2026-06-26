'use client';

import { useEffect, useRef } from 'react';
import { getAudioManager } from '@/audio/AudioManager';

export const useEasterEgg = () => {
  const keysPressed = useRef<string[]>([]);
  const secretCode = ['8', 'c', 't', 'r', 'l'];

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Append key to buffer
      keysPressed.current.push(e.key.toLowerCase());

      // Limit buffer size to length of secret code
      if (keysPressed.current.length > secretCode.length) {
        keysPressed.current.shift();
      }

      // Check if buffer matches secret code
      const isMatch = secretCode.every(
        (char, idx) => keysPressed.current[idx] === char
      );

      if (isMatch) {
        // 1. Play procedural glitch synthesizer sound sweep
        const manager = getAudioManager();
        manager.playGlitchSFX();

        // 2. Trigger Glitch visual overlay (shaking + difference noise filter)
        document.body.classList.add('glitch-active');
        
        // Clear buffer
        keysPressed.current = [];

        // Restore body state after short delay
        setTimeout(() => {
          document.body.classList.remove('glitch-active');
        }, 1500);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
};
