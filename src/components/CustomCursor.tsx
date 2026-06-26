'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export const CustomCursor = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [cursorLabel, setCursorLabel] = useState<string | null>(null);

  // Position coordinates for physics loops
  const mouseCoords = useRef({ x: 0, y: 0 });
  const ringCoords = useRef({ x: 0, y: 0, vx: 0, vy: 0 });

  // References for magnetic targets
  const magneticTarget = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    const isAdmin = pathname?.startsWith('/admin');
    if (isAdmin) {
      document.documentElement.classList.remove('custom-cursor-active');
      setIsVisible(false);
      return;
    }

    // Detect touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      setIsVisible(false);
      return;
    }

    // Enable custom cursor styles globally by adding class to html/body
    document.documentElement.classList.add('custom-cursor-active');
    setIsVisible(true);

    const onMouseMove = (e: MouseEvent) => {
      mouseCoords.current.x = e.clientX;
      mouseCoords.current.y = e.clientY;
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    // Event delegation to check if hovering over links/buttons/interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // 1. Check for cursor labels (data-cursor-label="...")
      const labelEl = target.closest('[data-cursor-label]') as HTMLElement;
      if (labelEl) {
        setCursorLabel(labelEl.getAttribute('data-cursor-label'));
      } else {
        setCursorLabel(null);
      }

      // 2. Check for magnetic targets (data-magnetic)
      const magneticEl = target.closest('[data-magnetic]') as HTMLElement;
      if (magneticEl) {
        magneticTarget.current = magneticEl;
      } else {
        magneticTarget.current = null;
      }

      // 3. Toggle hovered class
      const interactiveEl =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.classList.contains('interactive') ||
        target.closest('.interactive') ||
        magneticEl ||
        labelEl;
        
      setIsHovered(!!interactiveEl);
    };

    window.addEventListener('mouseover', handleMouseOver);

    // Spring Physics values
    const mass = 15;
    const tension = 0.55;
    const friction = 0.72;

    let animationFrameId: number;

    const render = () => {
      let targetX = mouseCoords.current.x;
      let targetY = mouseCoords.current.y;

      // Magnetic Pull calculation: attract target coordinates to the center of the hovered element
      if (magneticTarget.current) {
        const rect = magneticTarget.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Blend 65% of the element center with 35% of the actual mouse coordinates to prevent complete lock
        targetX = centerX + (targetX - centerX) * 0.35;
        targetY = centerY + (targetY - centerY) * 0.35;
      }

      // Instantly position the center dot
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${mouseCoords.current.x}px, ${mouseCoords.current.y}px, 0)`;
      }

      // Spring acceleration math for the trailing ring
      const dx = targetX - ringCoords.current.x;
      const dy = targetY - ringCoords.current.y;

      const forceX = dx * tension;
      const forceY = dy * tension;

      const ax = forceX / mass;
      const ay = forceY / mass;

      ringCoords.current.vx = (ringCoords.current.vx + ax) * friction;
      ringCoords.current.vy = (ringCoords.current.vy + ay) * friction;

      ringCoords.current.x += ringCoords.current.vx;
      ringCoords.current.y += ringCoords.current.vy;

      if (cursorRingRef.current) {
        cursorRingRef.current.style.transform = `translate3d(${ringCoords.current.x}px, ${ringCoords.current.y}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mounted, pathname]);

  if (!mounted || !isVisible) return null;


  return (
    <>
      {/* Tiny solid dot at the pointer coordinate */}
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 w-2.5 h-2.5 bg-accent rounded-full pointer-events-none z-[99999] -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out mix-blend-screen"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      />
      
      {/* Physics-based trailing ring surrounding the dot */}
      <div
        ref={cursorRingRef}
        className={`fixed top-0 left-0 rounded-full border border-accent/40 pointer-events-none z-[99998] -translate-x-1/2 -translate-y-1/2 transition-[width,height,background-color,border-color] duration-300 ease-out flex items-center justify-center mix-blend-difference ${
          isClicking
            ? 'w-7 h-7 bg-accent/25 border-accent'
            : isHovered
            ? cursorLabel 
              ? 'w-20 h-20 bg-accent/10 border-accent/70' 
              : 'w-16 h-16 bg-accent/5 border-accent scale-105'
            : 'w-12 h-12 border-foreground/35'
        }`}
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      >
        {/* Dynamic Context Label */}
        {cursorLabel && (
          <span className="text-[9px] tracking-[0.25em] font-syne text-foreground font-bold uppercase select-none animate-fade-in animate-duration-300">
            {cursorLabel}
          </span>
        )}
      </div>
    </>
  );
};
