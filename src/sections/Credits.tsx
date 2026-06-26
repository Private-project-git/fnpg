'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Credits = () => {
  const [showSecret, setShowSecret] = useState(false);

  return (
    <>
      <section className="relative w-full bg-[#050505] pt-32 pb-16 px-6 border-t border-elevated flex flex-col items-center justify-center overflow-hidden">
        {/* Cinematic bottom glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[100vw] h-[40vh] bg-[radial-gradient(ellipse_at_bottom,rgba(139,0,0,0.1)_0%,transparent_70%)] pointer-events-none mix-blend-color-dodge" />

        <div className="max-w-4xl w-full flex flex-col items-center gap-16 text-center z-10">
          
          <div className="flex flex-col gap-4">
            <h2 className="font-bebas text-4xl md:text-6xl tracking-widest text-foreground drop-shadow-[0_0_10px_rgba(139,0,0,0.3)]">
              RESPECTFULLY DEDICATED TO 8CTRL
            </h2>
            <p className="font-syne text-[10px] tracking-[0.5em] uppercase text-text-secondary">
              Built by fans. The frequency remains eternal.
            </p>
          </div>

          <div className="w-full border-t border-elevated pt-8 flex flex-col md:flex-row items-center justify-between text-[9px] tracking-[0.4em] uppercase text-text-secondary gap-6">
            <span>ALL RIGHTS RESERVED © {new Date().getFullYear()} 8CTRL FANS</span>
            <button 
              onClick={() => setShowSecret(true)}
              className="hover:text-crimson hover:tracking-[0.5em] transition-all duration-700 cursor-pointer"
            >
              INITIATE FINAL SEQUENCE
            </button>
          </div>
        </div>
      </section>

      {/* Scene 14: After Credits Secret */}
      <AnimatePresence>
        {showSecret && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="fixed inset-0 z-[9999] bg-[#050505] flex items-center justify-center cursor-crosshair overflow-hidden"
            onClick={() => setShowSecret(false)}
          >
            {/* Ambient Loop Animation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div 
                animate={{ scale: [1, 1.5, 1], rotate: [0, 90, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] rounded-full border border-blood-red/20 absolute mix-blend-screen"
              />
              <motion.div 
                animate={{ scale: [1.5, 1, 1.5], rotate: [90, 0, 90] }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="w-[60vw] h-[60vw] md:w-[30vw] md:h-[30vw] rounded-full border border-crimson/30 absolute mix-blend-screen"
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,0,0,0.1)_0%,transparent_60%)]" />
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2, duration: 3 }}
              className="relative z-10 text-center flex flex-col items-center gap-8"
            >
              <h1 className="text-8xl md:text-[12rem] font-bebas text-blood-red opacity-80 mix-blend-color-dodge filter blur-[2px]">
                8CTRL
              </h1>
              <p className="text-white/50 font-syne tracking-[1em] text-xs uppercase animate-pulse">
                Click to return
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
