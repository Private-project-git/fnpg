'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const Quotes = ({ settings }: { settings?: any }) => {
  const quotesList = settings?.verified_quotes || [];
  const publishedQuotes = quotesList.filter((q: any) => q.status === 'published' || !q.status);
  const activeQuote = publishedQuotes.length > 0 
    ? publishedQuotes[0] 
    : { text: "I DIDN'T CHOOSE THIS FREQUENCY. IT CHOSE ME.", author: "8CTRL", source: "" };

  return (
    <section className="relative w-full py-40 bg-[#050505] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,0,0,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 text-center z-10">
        <motion.p 
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="text-3xl md:text-5xl lg:text-6xl font-bebas text-foreground leading-[1.1] tracking-wide uppercase"
        >
          "{activeQuote.text}"
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-12 flex flex-col items-center gap-4"
        >
          <div className="w-[1px] h-12 bg-blood-red" />
          <span className="text-[10px] tracking-[0.4em] font-syne uppercase text-text-secondary">
            — {activeQuote.author} {activeQuote.source ? `(${activeQuote.source})` : ''}
          </span>
        </motion.div>
      </div>
    </section>
  );
};
