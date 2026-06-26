'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

export const Platforms = () => {
  const platforms = [
    { name: 'Spotify', color: 'hover:border-[#1DB954]' },
    { name: 'Apple Music', color: 'hover:border-[#FA243C]' },
    { name: 'YouTube', color: 'hover:border-[#FF0000]' },
    { name: 'Instagram', color: 'hover:border-[#E1306C]' }
  ];

  return (
    <section className="relative w-full py-20 bg-[#050505]">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {platforms.map((platform, index) => (
          <motion.a
            key={platform.name}
            href="#"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className={`group relative flex flex-col items-center justify-center p-8 border border-elevated bg-surface hover:bg-elevated/50 transition-all duration-300 ${platform.color}`}
          >
            <span className="font-bebas text-2xl text-foreground group-hover:text-white mb-2">{platform.name}</span>
            <ExternalLink className="w-4 h-4 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Subtle red bottom glow on hover */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blood-red/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.a>
        ))}
      </div>
    </section>
  );
};
