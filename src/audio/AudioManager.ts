import { AMBIENT_TRACKS } from '../data/tracks';
import { Track as NormalizedTrack } from '../types/domain';

export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentTrackId: string | null = null;
  private dynamicTracks: NormalizedTrack[] = [];
  private activePlayers: Map<
    string,
    {
      audio: HTMLAudioElement;
      source: MediaElementAudioSourceNode;
      gain: GainNode;
      playPromise?: Promise<void>;
      hasError?: boolean;
    }
  > = new Map();

  private volume = 0.8;
  private isMuted = false;
  private initialized = false;
  private fadeTimers: Map<string, NodeJS.Timeout> = new Map();

  // Listeners for state changes (to trigger React re-renders)
  private listeners: Set<(state: AudioManagerState) => void> = new Set();

  constructor() {
    // Load persisted settings if in browser
    if (typeof window !== 'undefined') {
      const savedVolume = localStorage.getItem('8ctrl-volume');
      const savedMute = localStorage.getItem('8ctrl-muted');
      if (savedVolume !== null) this.volume = parseFloat(savedVolume);
      if (savedMute !== null) this.isMuted = savedMute === 'true';
    }
  }

  public init() {
    if (this.initialized) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      
      this.initialized = true;
      this.notify();
    } catch (e) {
      console.error('Failed to initialize AudioContext', e);
    }
  }

  public getContext() {
    return this.ctx;
  }

  public setDynamicTracks(tracks: NormalizedTrack[]) {
    this.dynamicTracks = tracks;
    this.notify();
  }

  public getTracks() {
    return [...AMBIENT_TRACKS, ...this.dynamicTracks];
  }

  // Preload upcoming preview clips in the background without playing them
  public preloadTrack(trackId: string) {
    this.getOrCreatePlayer(trackId);
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((listener) => listener(state));
  }

  public subscribe(listener: (state: AudioManagerState) => void) {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): AudioManagerState {
    const currentTrack = this.getTracks().find((t) => t.id === this.currentTrackId) || null;
    let isPlaying = false;
    let progress = 0;
    let duration = 0;
    let currentTime = 0;

    if (this.currentTrackId) {
      const player = this.activePlayers.get(this.currentTrackId);
      if (player) {
        isPlaying = !player.audio.paused;
        currentTime = player.audio.currentTime;
        duration = player.audio.duration || 0;
        progress = duration > 0 ? currentTime / duration : 0;
      }
    }

    return {
      currentTrackId: this.currentTrackId,
      currentTrack,
      isPlaying,
      volume: this.volume,
      isMuted: this.isMuted,
      initialized: this.initialized,
      progress,
      currentTime,
      duration,
    };
  }

  private getOrCreatePlayer(trackId: string) {
    this.init();
    if (!this.ctx || !this.masterGain) return null;

    let player = this.activePlayers.get(trackId);
    if (!player) {
      const track = this.getTracks().find((t) => t.id === trackId);
      if (!track) return null;

      const audio = new Audio();
      const playerObj: {
        audio: HTMLAudioElement;
        source: MediaElementAudioSourceNode;
        gain: GainNode;
        playPromise?: Promise<void>;
        hasError?: boolean;
      } = {
        audio,
        source: null as any,
        gain: null as any,
        hasError: false
      };

      audio.crossOrigin = 'anonymous';
      audio.loop = track.id.startsWith('ambient');
      audio.preload = 'auto';

      audio.addEventListener('error', (e) => {
        console.warn(`Audio source failed to load for track ${trackId}:`, e);
        playerObj.hasError = true;
        // Fallback to a silent WAV clip to satisfy the audio element and avoid unhandled exceptions
        audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAAA';
        try {
          audio.load();
        } catch (_) {}
      });

      if (track.preview.url) {
        audio.src = track.preview.url;
      }

      // Setup audio source and local gain node
      const source = this.ctx.createMediaElementSource(audio);
      const gain = this.ctx.createGain();
      
      gain.gain.setValueAtTime(0, this.ctx.currentTime); // Start silent
      source.connect(gain);
      gain.connect(this.masterGain);

      // Listen for timeupdate to push state changes to UI
      audio.addEventListener('timeupdate', () => {
        if (this.currentTrackId === trackId) {
          this.notify();
        }
      });

      audio.addEventListener('ended', () => {
        if (this.currentTrackId === trackId && !track.id.startsWith('ambient')) {
          this.notify();
        }
      });

      playerObj.source = source;
      playerObj.gain = gain;
      player = playerObj;
      this.activePlayers.set(trackId, playerObj);
    }

    return player;
  }

  /**
   * Play a procedural sci-fi audio sweep using Synthesizer Oscillators.
   * Gives a tactile glitch effect during user interactions and Easter Eggs.
   */
  public playGlitchSFX() {
    if (!this.initialized || !this.ctx || !this.masterGain) {
      this.init();
    }
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gainNode = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, now);
      // Fast sweep downwards
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);

      filter.type = 'bandpass';
      filter.Q.setValueAtTime(8, now);
      filter.frequency.setValueAtTime(1100, now);
      filter.frequency.exponentialRampToValueAtTime(120, now + 0.3);

      // Smooth fast volume ramp down
      gainNode.gain.setValueAtTime(this.isMuted ? 0 : 0.08, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.32);
    } catch (err) {
      console.warn('Procedural synth SFX blocked or failed:', err);
    }
  }

  /**
   * Transition to a track with advanced crossfading, exponential curves, and ducking.
   */
  private async validateAudioSource(url: string): Promise<boolean> {
    return true; // Allow HTMLAudioElement to resolve media loading and trigger error event handlers naturally.
  }

  public async transitionTo(trackId: string, durationSec = 1.5) {
    if (!this.initialized) {
      this.init();
    }
    
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    const nextTrack = this.getTracks().find((t) => t.id === trackId);
    const nextPlayer = this.getOrCreatePlayer(trackId);
    
    // Fail-safe check: do not trigger playback if the audio source is broken
    if (nextPlayer?.hasError) {
      console.warn(`Audio target ${trackId} is in error state. Skipping playback.`);
      return;
    }

    // Verify audio source URL is valid before playing
    if (nextTrack?.preview?.url && nextPlayer) {
      const isValid = await this.validateAudioSource(nextTrack.preview.url);
      if (!isValid) {
        console.warn(`Audio target ${trackId} is unreachable. Skipping playback.`);
        nextPlayer.hasError = true;
        nextPlayer.audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAAA';
        try {
          nextPlayer.audio.load();
        } catch (_) {}
        return;
      }
    }

    if (this.currentTrackId === trackId) {
      if (nextPlayer && nextPlayer.audio.paused && nextTrack?.preview?.url) {
        nextPlayer.playPromise = nextPlayer.audio.play();
        nextPlayer.playPromise.catch(err => console.warn('Audio playback error', err.message || err));
        this.notify();
      }
      return;
    }

    const prevTrackId = this.currentTrackId;
    const now = this.ctx ? this.ctx.currentTime : 0;
    
    if (!this.ctx || !nextTrack) return;

    // Detect if we are entering a main "song"
    const enteringSong = !nextTrack.id.startsWith('ambient');

    // FADE OUT previous track (or duck it if it's ambient and we're entering a song)
    if (prevTrackId) {
      const prevPlayer = this.activePlayers.get(prevTrackId);
      const prevTrack = this.getTracks().find((t) => t.id === prevTrackId);
      
      if (prevPlayer && prevTrack) {
        const timer = this.fadeTimers.get(prevTrackId);
        if (timer) clearTimeout(timer);

        // If previous is ambient and we are entering a song, we DUCK it instead of stopping
        if (prevTrack.id.startsWith('ambient') && enteringSong) {
          prevPlayer.gain.gain.cancelScheduledValues(now);
          prevPlayer.gain.gain.setValueAtTime(prevPlayer.gain.gain.value, now);
          // Duck to 15% volume exponentially
          prevPlayer.gain.gain.exponentialRampToValueAtTime(0.15, now + durationSec);
        } else {
          // Standard fade-out to silent exponentially
          prevPlayer.gain.gain.cancelScheduledValues(now);
          prevPlayer.gain.gain.setValueAtTime(prevPlayer.gain.gain.value || 0.001, now);
          prevPlayer.gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);
          prevPlayer.gain.gain.setValueAtTime(0, now + durationSec + 0.05);

          const fadeOutTimer = setTimeout(() => {
            if (this.currentTrackId !== prevTrackId) {
              if (prevPlayer.playPromise !== undefined) {
                prevPlayer.playPromise.then(() => {
                  prevPlayer.audio.pause();
                }).catch(() => {});
              } else {
                prevPlayer.audio.pause();
              }
            }
            this.fadeTimers.delete(prevTrackId);
          }, durationSec * 1000 + 100);

          this.fadeTimers.set(prevTrackId, fadeOutTimer);
        }
      }
    }

    // FADE IN new track
    this.currentTrackId = trackId;
    if (nextPlayer) {
      const timer = this.fadeTimers.get(trackId);
      if (timer) clearTimeout(timer);

      nextPlayer.gain.gain.cancelScheduledValues(now);
      nextPlayer.gain.gain.setValueAtTime(nextPlayer.gain.gain.value || 0.001, now);
      
      // Play target track if it has a source
      if (nextTrack?.preview?.url) {
        nextPlayer.playPromise = nextPlayer.audio.play();
        nextPlayer.playPromise.catch((e) => {
          if (e.name !== 'AbortError') {
            console.warn('Audio play block:', e.message);
          }
        });
      }
      // Fade in to 100% local volume exponentially
      nextPlayer.gain.gain.exponentialRampToValueAtTime(1.0, now + durationSec);

      // UNDUCK other active ambient tracks if we are exiting a song back to ambient
      if (!enteringSong) {
        this.activePlayers.forEach((player, id) => {
          const track = this.getTracks().find((t) => t.id === id);
          if (track && track.id.startsWith('ambient') && id !== trackId) {
            player.gain.gain.cancelScheduledValues(now);
            player.gain.gain.setValueAtTime(player.gain.gain.value, now);
            // Restore to full volume
            player.gain.gain.exponentialRampToValueAtTime(1.0, now + durationSec);
          }
        });
      }
    }

    this.notify();
  }

  public setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    if (typeof window !== 'undefined') {
      localStorage.setItem('8ctrl-volume', this.volume.toString());
    }

    if (this.initialized && this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : this.volume, now + 0.05);
    }
    this.notify();
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('8ctrl-muted', this.isMuted.toString());
    }

    if (this.initialized && this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : this.volume, now + 0.1);
    }
    this.notify();
  }

  public pause() {
    if (!this.currentTrackId) return;
    const player = this.activePlayers.get(this.currentTrackId);
    if (player) {
      if (player.playPromise !== undefined) {
        player.playPromise.then(() => {
          player.audio.pause();
          this.notify();
        }).catch(() => {});
      } else {
        player.audio.pause();
        this.notify();
      }
    }
  }

  public resume() {
    if (!this.currentTrackId) return;
    const track = this.getTracks().find(t => t.id === this.currentTrackId);
    const player = this.activePlayers.get(this.currentTrackId);
    if (player && track?.preview?.url) {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      player.playPromise = player.audio.play();
      player.playPromise.catch(err => {
        if (err.name !== 'AbortError') console.log('Audio playback error', err.message);
      });
      this.notify();
    }
  }

  public seek(seconds: number) {
    if (!this.currentTrackId) return;
    const player = this.activePlayers.get(this.currentTrackId);
    if (player) {
      player.audio.currentTime = seconds;
      this.notify();
    }
  }
}

export interface AudioManagerState {
  currentTrackId: string | null;
  currentTrack: NormalizedTrack | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  initialized: boolean;
  progress: number;
  currentTime: number;
  duration: number;
}

// Singleton helper for context
let managerInstance: AudioManager | null = null;
export const getAudioManager = (): AudioManager => {
  if (typeof window === 'undefined') {
    return new Proxy({} as any, {
      get: (target, prop) => {
        if (prop === 'getTracks') return () => [];
        if (prop === 'subscribe') return () => () => {};
        return () => {};
      },
    });
  }
  if (!managerInstance) {
    managerInstance = new AudioManager();
  }
  return managerInstance;
};
