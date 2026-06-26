// src/components/discography/TimelineConnector.tsx
'use client';

import React from 'react';
import { motion, MotionValue } from 'framer-motion';

interface TimelineConnectorProps {
  progress: MotionValue<number>;
}

export const TimelineConnector: React.FC<TimelineConnectorProps> = ({ progress }) => {
  return (
    /* Left line on mobile (left-6), centered on desktop (left-1/2) */
    <div className="absolute left-6 md:left-1/2 top-[160px] bottom-10 w-[2px] -translate-x-1/2 bg-white/10 z-0">
      {/* Animated Filled Line */}
      <motion.div
        style={{ scaleY: progress, originY: 0 }}
        className="w-full h-full bg-gradient-to-b from-crimson via-blood-red to-highlight-red shadow-[0_0_12px_rgba(193,18,31,0.5)]"
      />
    </div>
  );
};
