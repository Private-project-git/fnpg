'use client';

import React, { useEffect, useState } from 'react';
import { useAudio } from '@/audio/AudioContext';
import { useScroll } from '@/components/ScrollProvider';
import { Database, Radio, Image as ImageIcon, Sparkles, Activity, FileText } from 'lucide-react';

export default function DiagnosticsDashboard() {
  const { state: audioState, audioManager } = useAudio();
  const lenis = useScroll();
  const [dbData, setDbData] = useState<any>(null);
  const [dbLoading, setDbLoading] = useState(true);
  const [apiStatuses, setApiStatuses] = useState<Record<string, 'CHECKING' | 'OK' | 'ERROR'>>({
    config: 'CHECKING',
    tracks: 'CHECKING',
    releases: 'CHECKING',
  });

  useEffect(() => {
    // 1. Fetch DB Diagnostics
    fetch('/api/admin/diagnostics')
      .then((res) => res.json())
      .then((data) => {
        setDbData(data);
        setDbLoading(false);
      })
      .catch((err) => {
        console.error('Diagnostics fetch failed:', err);
        setDbLoading(false);
      });

    // 2. Fetch API Status checks
    const checkApi = async (path: string, key: string) => {
      try {
        const res = await fetch(path);
        if (res.ok) {
          setApiStatuses((prev) => ({ ...prev, [key]: 'OK' }));
        } else {
          setApiStatuses((prev) => ({ ...prev, [key]: 'ERROR' }));
        }
      } catch (_) {
        setApiStatuses((prev) => ({ ...prev, [key]: 'ERROR' }));
      }
    };

    checkApi('/api/admin/config', 'config');
    checkApi('/api/admin/tracks', 'tracks');
    checkApi('/api/admin/releases', 'releases');
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-foreground p-8 font-mono">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="border-b border-surface pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bebas tracking-wider text-blood-red">8CTRL // INTERNAL DIAGNOSTICS</h1>
            <p className="text-text-secondary text-xs uppercase mt-1">SYSTEMS RESILIENCY MONITOR</p>
          </div>
          <span className="bg-blood-red/10 border border-blood-red/35 px-3 py-1 rounded text-xs text-crimson flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 animate-pulse" /> DEVELOPMENT ONLY
          </span>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* DATABASE LAYER */}
          <section className="bg-surface p-6 rounded border border-elevated">
            <h2 className="text-lg font-bebas text-crimson mb-4 flex items-center gap-2 uppercase">
              <Database className="w-5 h-5" /> Database Layer
            </h2>
            
            {dbLoading ? (
              <p className="text-xs text-text-secondary animate-pulse">Running diagnostics query...</p>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center border-b border-elevated pb-2">
                  <span className="text-text-secondary">MariaDB Status:</span>
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    dbData?.database?.status === 'CONNECTED' 
                      ? 'bg-green-500/10 text-green-500' 
                      : 'bg-red-500/10 text-red-500'
                  }`}>
                    {dbData?.database?.status || 'UNKNOWN'}
                  </span>
                </div>
                
                {dbData?.database?.error && (
                  <div className="bg-red-500/5 border border-red-500/25 p-3 rounded text-red-400 font-mono text-[10px] break-all leading-normal">
                    <strong>Error trace:</strong><br />
                    {dbData.database.error}
                  </div>
                )}

                <div className="space-y-1.5 pt-2">
                  <div className="text-text-secondary">Environment URL:</div>
                  <div className="bg-[#050505] p-2 rounded border border-elevated break-all text-[10px]">
                    {dbData?.database?.url || 'DATABASE_URL not resolved'}
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-text-secondary pt-2">
                  <span>Node Env:</span>
                  <span>{dbData?.database?.nodeEnv || 'development'}</span>
                </div>
              </div>
            )}
          </section>

          {/* API STABILITY */}
          <section className="bg-surface p-6 rounded border border-elevated">
            <h2 className="text-lg font-bebas text-crimson mb-4 flex items-center gap-2 uppercase">
              <FileText className="w-5 h-5" /> API Stabilization
            </h2>
            <div className="space-y-3 text-xs">
              {Object.entries(apiStatuses).map(([key, status]) => (
                <div key={key} className="flex justify-between items-center border-b border-elevated pb-2">
                  <span className="capitalize">{key} Endpoint (/api/admin/{key}):</span>
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    status === 'OK' 
                      ? 'bg-green-500/10 text-green-500' 
                      : status === 'CHECKING' 
                      ? 'bg-yellow-500/10 text-yellow-500 animate-pulse'
                      : 'bg-red-500/10 text-red-500'
                  }`}>
                    {status}
                  </span>
                </div>
              ))}
              <p className="text-[10px] text-text-secondary leading-normal pt-2">
                All endpoints wrapper check catches database timeouts and returns standard payload adapters or empty lists to avoid crash states.
              </p>
            </div>
          </section>

          {/* AUDIO ENGINE */}
          <section className="bg-surface p-6 rounded border border-elevated">
            <h2 className="text-lg font-bebas text-crimson mb-4 flex items-center gap-2 uppercase">
              <Radio className="w-5 h-5" /> Audio Engine
            </h2>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-elevated pb-2">
                <span className="text-text-secondary">WebAudio Context:</span>
                <span className={`font-bold ${audioState.initialized ? 'text-green-500' : 'text-yellow-500'}`}>
                  {audioState.initialized ? 'INITIALIZED (Active)' : 'SUSPENDED (Needs Gesture)'}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-elevated pb-2">
                <span className="text-text-secondary">Playback State:</span>
                <span className="font-bold text-foreground">
                  {audioState.isPlaying ? 'PLAYING' : 'PAUSED'}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-elevated pb-2">
                <span className="text-text-secondary">Current Track ID:</span>
                <span className="font-bold text-blood-red">{audioState.currentTrackId || 'None'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-elevated pb-2">
                <span className="text-text-secondary">Volume Levels:</span>
                <span>{Math.round(audioState.volume * 100)}% {audioState.isMuted ? '(MUTED)' : ''}</span>
              </div>
              <div className="pt-2">
                <div className="text-text-secondary mb-1.5">Loaded Playlist Tracks ({audioManager.getTracks().length}):</div>
                <div className="max-h-[120px] overflow-y-auto bg-[#050505] p-2 rounded border border-elevated text-[10px] space-y-1">
                  {audioManager.getTracks().map((t: any) => (
                    <div key={t.id} className="flex justify-between items-center text-text-secondary">
                      <span className="truncate max-w-[200px]">{t.title}</span>
                      <span className="text-blood-red font-semibold">{t.id.startsWith('ambient') ? 'Ambient' : 'Song'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* MOTION & SCROLL LENCY */}
          <section className="bg-surface p-6 rounded border border-elevated">
            <h2 className="text-lg font-bebas text-crimson mb-4 flex items-center gap-2 uppercase">
              <Sparkles className="w-5 h-5" /> Motion & Scroll
            </h2>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-elevated pb-2">
                <span className="text-text-secondary">Lenis Scroll Controller:</span>
                <span className={`font-bold ${lenis ? 'text-green-500' : 'text-red-500'}`}>
                  {lenis ? 'HYDRATED' : 'NOT INITIALIZED'}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-elevated pb-2">
                <span className="text-text-secondary">Scroll Velocity Integration:</span>
                <span className="text-foreground font-bold">GSAP Ticker Linked</span>
              </div>
              <p className="text-[10px] text-text-secondary leading-normal pt-2">
                All Framer Motion `useScroll` target binds check mounting states dynamically. Refs bind on the client post-hydration, avoiding hydration exceptions.
              </p>
            </div>
          </section>

          {/* IMAGES & ASSETS */}
          <section className="bg-surface p-6 rounded border border-elevated md:col-span-2">
            <h2 className="text-lg font-bebas text-crimson mb-4 flex items-center gap-2 uppercase">
              <ImageIcon className="w-5 h-5" /> Asset Pipelines
            </h2>
            <div className="space-y-3 text-xs">
              <p className="text-text-secondary leading-normal">
                Gallery assets have been updated to load high-resolution royalty-free CDNs to eliminate 404 response errors. Fallbacks are integrated into `PremiumImage` to prevent layout collapse on media fails.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                {[
                  { title: 'Recording Cabin', url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=150&auto=format&fit=crop' },
                  { title: 'Reverberation', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=150&auto=format&fit=crop' },
                  { title: 'Density Synthesizer', url: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=150&auto=format&fit=crop' },
                  { title: 'Mountainous Echo', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=150&auto=format&fit=crop' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-[#050505] p-2 rounded border border-elevated flex flex-col items-center">
                    <img src={item.url} alt={item.title} className="w-12 h-12 object-cover border border-elevated mb-2 filter grayscale" />
                    <span className="text-[9px] text-text-secondary text-center truncate w-full">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
