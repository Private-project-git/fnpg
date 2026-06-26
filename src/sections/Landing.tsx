'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '@/audio/AudioContext';
import { useScroll } from '@/components/ScrollProvider';

interface LandingProps {
  onEnter: () => void;
}

export const Landing = ({ onEnter }: LandingProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { transitionTo } = useAudio();
  const lenis = useScroll();
  const [isExiting, setIsExiting] = useState(false);

  // Initialize particles background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track mouse coordinates for interactive push
    const mouse = { x: -1000, y: -1000, radius: 150 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    // Particle class
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      baseX: number;
      baseY: number;
      density: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.baseX = this.x;
        this.baseY = this.y;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.density = Math.random() * 30 + 1;
      }

      update() {
        // Slow float
        this.x += this.speedX;
        this.y += this.speedY;

        // Boundaries check
        if (this.x < 0 || this.x > width) this.speedX *= -1;
        if (this.y < 0 || this.y > height) this.speedY *= -1;

        // Mouse interaction (push away)
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const maxDistance = mouse.radius;
          const force = (maxDistance - distance) / maxDistance;
          const directionX = forceDirectionX * force * this.density * 0.5;
          const directionY = forceDirectionY * force * this.density * 0.5;

          this.x -= directionX;
          this.y -= directionY;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = 'rgba(244, 244, 244, 0.15)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }
    }

    const particlesArray: Particle[] = [];
    const initParticles = () => {
      const particleCount = Math.floor((width * height) / 15000);
      for (let i = 0; i < particleCount; i++) {
        particlesArray.push(new Particle());
      }
    };

    initParticles();

    // Loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particlesArray.forEach((p) => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Handle entry sequence
  const handleEnterClick = async () => {
    setIsExiting(true);
    
    // Play transition sound & unlock AudioContext
    await transitionTo('ambient-1', 2.0);
    
    // Unlock Lenis scroll
    if (lenis) {
      lenis.start();
    }

    // Trigger parent callback after transition finishes
    setTimeout(() => {
      onEnter();
    }, 1500); // match duration of slide-out animation
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          ref={containerRef}
          className="fixed inset-0 z-[9900] flex flex-col items-center justify-center bg-[#050505] overflow-hidden"
          exit={{
            y: '-100%',
            transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] }, // Cinematic split slide-up
          }}
        >
          {/* Particles Background */}
          <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

          {/* Glowing Vignette Center */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,0,0,0.15)_0%,transparent_70%)] pointer-events-none" />

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
            className="absolute top-12 text-[10px] tracking-[0.4em] uppercase text-text-secondary select-none"
          >
            A Digital Installation
          </motion.p>

          {/* Stage Name */}
          <div className="relative overflow-hidden mb-12 select-none">
            <motion.h1
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1.5, ease: [0.215, 0.61, 0.355, 1] }}
              className="text-[12vw] md:text-[8vw] font-bebas tracking-[0.1em] text-foreground"
            >
              8CTRL
            </motion.h1>
          </div>

          {/* Enter Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="z-20"
          >
            <button
              onClick={handleEnterClick}
              className="relative px-12 py-4 group overflow-hidden border border-foreground/10 hover:border-blood-red/40 rounded-full transition-colors duration-500"
            >
              {/* Button bg hover slide-in */}
              <span className="absolute inset-0 bg-blood-red translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.76,0,0.24,1]" />
              
              <span className="relative z-10 font-syne text-xs uppercase tracking-[0.25em] text-foreground group-hover:text-white transition-colors duration-500">
                Enter Experience
              </span>
            </button>
          </motion.div>

          {/* Location indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="absolute bottom-12 text-[9px] tracking-[0.3em] uppercase text-text-secondary select-none"
          >
            JAMMU & KASHMIR // 32.73° N, 74.87° E
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
