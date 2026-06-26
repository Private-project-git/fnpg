'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAudioManager, AudioManager, AudioManagerState } from './AudioManager';
import { Track as NormalizedTrack } from '@/types/domain';
import { FALLBACK_SONGS } from '@/data/tracks';


interface AudioContextType {
  state: AudioManagerState;
  audioManager: AudioManager;
  transitionTo: (trackId: string, durationSec?: number) => Promise<void>;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  pause: () => void;
  resume: () => void;
  seek: (seconds: number) => void;
  activeTrack: NormalizedTrack | null;
  setActiveTrack: (track: NormalizedTrack | null) => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const audioManager = getAudioManager();
  const [activeTrack, setActiveTrack] = useState<NormalizedTrack | null>(null);
  const [state, setState] = useState<AudioManagerState>({
    currentTrackId: null,
    currentTrack: null,
    isPlaying: false,
    volume: 0.8,
    isMuted: false,
    initialized: false,
    progress: 0,
    currentTime: 0,
    duration: 0,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const unsubscribe = audioManager.subscribe((newState) => {
        setState({ ...newState });
      });
      
      // Fetch dynamic tracks from DB Content Source
      fetch('/api/admin/tracks')
        .then(res => res.json())
        .then(resJson => {
          const data = resJson.success ? resJson.data : null;
          if (Array.isArray(data) && data.length > 0) {
            audioManager.setDynamicTracks(data);
          } else {
            console.warn('API returned empty/error list. Using static fallback tracks.');
            audioManager.setDynamicTracks(FALLBACK_SONGS);
          }
        })
        .catch(err => {
          console.error('Failed to fetch tracks. Falling back to static curated tracks:', err);
          audioManager.setDynamicTracks(FALLBACK_SONGS);
        });

      return unsubscribe;
    }
  }, [audioManager]);

  const transitionTo = async (trackId: string, durationSec = 1.5) => {
    await audioManager.transitionTo(trackId, durationSec);
  };

  const setVolume = (v: number) => {
    audioManager.setVolume(v);
  };

  const toggleMute = () => {
    audioManager.toggleMute();
  };

  const pause = () => {
    audioManager.pause();
  };

  const resume = () => {
    audioManager.resume();
  };

  const seek = (seconds: number) => {
    audioManager.seek(seconds);
  };

  return (
    <AudioContext.Provider
      value={{
        state,
        audioManager,
        transitionTo,
        setVolume,
        toggleMute,
        pause,
        resume,
        seek,
        activeTrack,
        setActiveTrack
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

