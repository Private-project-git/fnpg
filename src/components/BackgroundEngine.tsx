'use client';

import React, { useEffect, useRef } from 'react';
import { useScroll } from '@/components/ScrollProvider';
import { useAudio } from '@/audio/AudioContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  alpha: number;
  baseAlpha: number;
  speedMultiplier: number;
}

function hexToRgba(hex: string, alpha: number) {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return `rgba(200, 10, 43, ${alpha})`;
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const BackgroundEngine = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollPosition = useRef(0);
  const mouseCoords = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const lastMouseCoords = useRef({ x: 0, y: 0 });

  const { activeTrack, state } = useAudio();
  const currentThemeTrack = activeTrack || state.currentTrack;
  const visualIdentityRef = useRef<any>(null);

  useEffect(() => {
    visualIdentityRef.current = currentThemeTrack?.visualIdentity || null;
  }, [currentThemeTrack]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animationFrameId: number;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Track mouse coordinates and calculate velocity
    const handleMouseMove = (e: MouseEvent) => {
      mouseCoords.current.x = e.clientX;
      mouseCoords.current.y = e.clientY;

      mouseCoords.current.vx = e.clientX - lastMouseCoords.current.x;
      mouseCoords.current.vy = e.clientY - lastMouseCoords.current.y;

      lastMouseCoords.current.x = e.clientX;
      lastMouseCoords.current.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Track scroll updates for camera parallax simulation
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        scrollPosition.current = window.scrollY;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initialize particles
    const particleCount = 60;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const baseAlpha = Math.random() * 0.15 + 0.05;
      const size = Math.random() * 1.5 + 0.5;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        size: size,
        baseSize: size,
        alpha: baseAlpha,
        baseAlpha: baseAlpha,
        speedMultiplier: Math.random() * 1.5 + 0.5,
      });
    }

    // Light Leak State
    let lightLeakAlpha = 0;
    let lightLeakTargetAlpha = 0;
    let lightLeakX = 0;
    let lightLeakTimer = 0;

    let time = 0;

    // Animation loop
    const render = () => {
      time += 1;
      
      const theme = visualIdentityRef.current;
      const accent = theme?.accentColor || '#8B0000';
      const particlePreset = theme?.particlePreset || 'dust';
      const lightingPreset = theme?.lightingPreset || 'soft';

      // Background clearing
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, width, height);

      // --- 1. VOLUMETRIC GRADIENT ORBS (ORBITAL GLOWS) ---
      if (lightingPreset !== 'none') {
        const cx1 = width * 0.5 + Math.cos(time * 0.001) * (width * 0.18);
        const cy1 = height * 0.5 + Math.sin(time * 0.0008) * (height * 0.15) - (scrollPosition.current * 0.1);
        const radius1 = Math.max(width, height) * (lightingPreset === 'harsh' ? 0.35 : 0.5);
        
        const grad1 = ctx.createRadialGradient(cx1, cy1, 0, cx1, cy1, radius1);
        grad1.addColorStop(0, hexToRgba(accent, lightingPreset === 'harsh' ? 0.08 : 0.05));
        grad1.addColorStop(0.5, hexToRgba(accent, 0.01));
        grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = grad1;
        ctx.fillRect(0, 0, width, height);

        // Orbital Glow 2
        const cx2 = width * 0.45 + Math.sin(time * 0.0006) * (width * 0.22);
        const cy2 = height * 0.52 + Math.cos(time * 0.0009) * (height * 0.18) - (scrollPosition.current * 0.05);
        const radius2 = Math.max(width, height) * 0.4;
        
        const grad2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, radius2);
        grad2.addColorStop(0, hexToRgba(accent, 0.035));
        grad2.addColorStop(0.5, hexToRgba(accent, 0.005));
        grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = grad2;
        ctx.fillRect(0, 0, width, height);
      }

      // --- 2. LIGHT LEAK SIMULATION ---
      if (lightingPreset === 'spotlight' || lightingPreset === 'harsh') {
        lightLeakTimer++;
        if (lightLeakTimer > 200) {
          if (Math.random() < 0.35) {
            lightLeakTargetAlpha = Math.random() * 0.04 + 0.01;
            lightLeakX = Math.random() * width;
          } else {
            lightLeakTargetAlpha = 0;
          }
          lightLeakTimer = 0;
        }

        lightLeakAlpha += (lightLeakTargetAlpha - lightLeakAlpha) * 0.02;
        
        if (lightLeakAlpha > 0.001) {
          const leakGrad = ctx.createLinearGradient(lightLeakX - 150, 0, lightLeakX + 150, height);
          leakGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
          leakGrad.addColorStop(0.5, hexToRgba(accent, lightLeakAlpha));
          leakGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          
          ctx.fillStyle = leakGrad;
          ctx.fillRect(0, 0, width, height);
        }
      }

      // --- 3. VELOCITY-RESPONSIVE PARTICLES ---
      if (particlePreset !== 'none') {
        // Decay mouse velocity
        mouseCoords.current.vx *= 0.95;
        mouseCoords.current.vy *= 0.95;

        particles.forEach((p) => {
          // Adjust velocity based on presets
          if (particlePreset === 'ash') {
            // Drift downwards
            p.vy += 0.001 * p.speedMultiplier;
            p.vx += (Math.random() - 0.5) * 0.01;
          } else if (particlePreset === 'spark') {
            // Fast sparks popping upward/sideward
            p.vy -= 0.003 * p.speedMultiplier;
            p.vx += (Math.random() - 0.5) * 0.04;
          } else if (particlePreset === 'smoke') {
            // Slow, thick floating cloud
            p.vx += (Math.random() - 0.5) * 0.005;
            p.vy += (Math.random() - 0.5) * 0.005;
          } else if (particlePreset === 'noise') {
            // High frequency jitter
            p.x += (Math.random() - 0.5) * 0.6;
            p.y += (Math.random() - 0.5) * 0.6;
          }

          // Apply mouse velocity vector
          p.vx += mouseCoords.current.vx * 0.0004 * p.speedMultiplier;
          p.vy += mouseCoords.current.vy * 0.0004 * p.speedMultiplier;

          // Damp velocity back towards float limits
          p.vx += ((Math.random() - 0.5) * 0.12 - p.vx) * 0.03;
          p.vy += ((Math.random() - 0.5) * 0.12 - p.vy) * 0.03;

          p.x += p.vx;
          p.y += p.vy - (scrollPosition.current * 0.00025 * p.speedMultiplier);

          // Wrap boundaries
          if (p.x < -50) p.x = width + 50;
          if (p.x > width + 50) p.x = -50;
          if (p.y < -50) p.y = height + 50;
          if (p.y > height + 50) p.y = -50;

          // Size transition depending on preset
          if (particlePreset === 'smoke') {
            p.size += (p.baseSize * 18 - p.size) * 0.05;
          } else {
            p.size += (p.baseSize - p.size) * 0.05;
          }

          // Alpha transition
          p.alpha = p.baseAlpha + Math.sin(time * 0.015 + p.x) * 0.02;

          // Coloring
          if (particlePreset === 'spark') {
            ctx.fillStyle = hexToRgba(accent, Math.max(0, p.alpha * 2));
          } else if (particlePreset === 'smoke') {
            ctx.fillStyle = hexToRgba(accent, Math.max(0, p.alpha * 0.25));
          } else {
            ctx.fillStyle = `rgba(244, 244, 244, ${Math.max(0, p.alpha)})`;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.closePath();
          ctx.fill();
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none bg-[#050505]"
      aria-hidden="true"
    />
  );
};
