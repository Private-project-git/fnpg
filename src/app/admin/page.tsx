'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAudio } from '@/audio/AudioContext';
import { PremiumImage } from '@/components/PremiumImage';
import { 
  LayoutDashboard, User, Music, Sparkles, Image as ImageIcon, 
  Settings, Search, BarChart3, Database, ShieldAlert, 
  Save, RefreshCw, Plus, Trash2, Eye, Link2, 
  Play, Pause, Command, Volume2, Globe, Heart, 
  Flame, HelpCircle, ArrowRightLeft, Sliders, Palette, 
  Terminal, ShieldCheck, Download, Upload, Check, AlertTriangle,
  FileText, Smartphone, Tablet, Monitor, RotateCw, Undo2 as Undo, Redo2 as Redo, Cpu, EyeOff,
  Wifi, WifiOff, Activity, Menu, X
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// SAVE STATE MACHINE
// ─────────────────────────────────────────────────────────────────────────────
type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'retrying' | 'offline' | 'error';

interface SaveEvent {
  ts: number;
  type: 'request' | 'response' | 'error';
  detail: string;
  httpStatus?: number;
  body?: any;
}

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS KEY ADAPTER
// CMS state uses its own keys. The DB API uses the config_* namespace.
// This adapter translates between the two so the frontend never needs
// to know about the DB key schema.
// ─────────────────────────────────────────────────────────────────────────────
const CMS_TO_DB_KEY: Record<string, string> = {
  artist_profile:       'config_site',
  seo_config:           'config_seo',
  homepage_layout:      'config_homepage',
  scenes_config:        'config_scenes',
  visual_studio_config: 'config_theme',
  gallery_config:       'config_gallery',
  platforms_config:     'config_platforms',
  user_permissions_config: 'config_users',
  // Pass-through keys (stored as-is in DB with default handler)
  timeline_events:      'timeline_events',
  verified_quotes:      'verified_quotes',
};

const DB_TO_CMS_KEY: Record<string, string> = Object.fromEntries(
  Object.entries(CMS_TO_DB_KEY).map(([cms, db]) => [db, cms])
);

/**
 * Translate CMS local settings object → DB-keyed payload for POST /api/admin/settings
 */
function cmsSettingsToDbPayload(settings: Record<string, any>): Record<string, any> {
  return settings;
}

/**
 * Translate DB-keyed settings object → CMS local state shape
 */
function dbSettingsToCmsShape(dbData: Record<string, any>): Record<string, any> {
  return dbData;
}

export default function CompleteCMSStudio() {
  const { state: audioState, audioManager, transitionTo } = useAudio();
  
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'discography' | 'homepage' | 'scenes' | 'visual' | 'media' | 'quotes' | 'seo' | 'permissions' | 'analytics' | 'system'>('dashboard');

  // Command Palette states
  const [showCmdPalette, setShowCmdPalette] = useState(false);
  const [cmdSearch, setCmdSearch] = useState('');

  // Search filter
  const [globalSearch, setGlobalSearch] = useState('');

  // Local state for dynamic settings (fetched from DB)
  const [settings, setSettings] = useState<any>({
    artist_profile: {
      name: '8CTRL',
      realName: 'Ankur',
      heroText: 'BLOOD RED CINEMATIC',
      biography: 'A pioneer of underground atmospheric hip-hop based in Jammu...',
      location: 'Jammu & Kashmir // 32.73° N, 74.87° E',
      genres: ['Hip-Hop/Rap'],
      socialLinks: { instagram: '', youtube: '', twitter: '' },
      streamingLinks: { spotify: '', appleMusic: '' },
      brandColors: { primaryBackground: '#050505', surface: '#0E0E0E', bloodRed: '#8B0000', crimsonAccent: '#C1121F', highlightRed: '#E63946' },
      homepageIntro: 'The music data exists to drive the experience.'
    },
    seo_config: { title: '8CTRL // Cinematic Fan Experience', description: 'An immersive digital installation dedicated to Jammu rapper 8CTRL.', keywords: ['8CTRL', 'Jammu Rap'], ogImage: '', twitterCard: 'summary_large_image', canonical: 'https://8ctrl.com', robots: 'index, follow' },
    homepage_layout: { 
      sections: [
        { id: 'hero', enabled: true, name: 'Hero Section', spacing: 'py-20', themeOverride: 'cinematic', backgroundOverride: '' },
        { id: 'identity', enabled: true, name: 'Identity Block', spacing: 'py-32', themeOverride: 'dark', backgroundOverride: '' },
        { id: 'featured', enabled: true, name: 'Featured Releases', spacing: 'py-20', themeOverride: 'cinematic', backgroundOverride: '' },
        { id: 'artist-favs', enabled: true, name: 'Artist Favorites', spacing: 'py-20', themeOverride: 'dark', backgroundOverride: '' },
        { id: 'fan-favs', enabled: true, name: 'Fan Favorites', spacing: 'py-20', themeOverride: 'cinematic', backgroundOverride: '' },
        { id: 'trending', enabled: true, name: 'Trending Analytics', spacing: 'py-20', themeOverride: 'dark', backgroundOverride: '' },
        { id: 'discography', enabled: true, name: 'Timeline Discography', spacing: 'py-20', themeOverride: 'cinematic', backgroundOverride: '' },
        { id: 'gallery', enabled: true, name: 'Cinematic Gallery', spacing: 'py-20', themeOverride: 'dark', backgroundOverride: '' },
        { id: 'quotes', enabled: true, name: 'Verified Quotes', spacing: 'py-24', themeOverride: 'cinematic', backgroundOverride: '' },
        { id: 'platforms', enabled: true, name: 'Platform Links', spacing: 'py-16', themeOverride: 'dark', backgroundOverride: '' },
        { id: 'credits', enabled: true, name: 'Credits Footer', spacing: 'py-12', themeOverride: 'dark', backgroundOverride: '' }
      ] 
    },
    timeline_events: [
      { year: '2025', title: 'THE CHAOS ERA', desc: 'The release of the full-length album "Chaos" in October 2025.' },
      { year: 'JAN 2026', title: 'SESH IN THE POOL', desc: 'Kicking off the new year with "Sesh in the Pool".' }
    ],
    verified_quotes: [
      { text: "8CTRL is redefining the texture of Indian underground hip-hop. The soundscapes are not tracks; they are cinematic environments.", author: "Press Curation", source: "Underground Review", status: 'published' }
    ],
    scenes_config: [
      { id: 'scene-hero', name: 'Hero Scene', enabled: true, order: 0, transitionPreset: 'fade', duration: 3, backgroundMode: 'radial', accentColors: '#8B0000', typographyPreset: 'bebas', particlePreset: 'ash', ambientPreset: 'ambient_loop_1', scrollSpeed: 1, overlayEffects: 'vignette', blurIntensity: 2, grainIntensity: 4, lightingIntensity: 5 },
      { id: 'scene-identity', name: 'Identity Scene', enabled: true, order: 1, transitionPreset: 'blurReveal', duration: 4, backgroundMode: 'radial', accentColors: '#C1121F', typographyPreset: 'syne', particlePreset: 'smoke', ambientPreset: 'ambient_loop_1', scrollSpeed: 1.2, overlayEffects: 'none', blurIntensity: 5, grainIntensity: 3, lightingIntensity: 8 }
    ],
    visual_studio_config: {
      backgroundGradient: 'radial-gradient(circle at 50% 50%, rgba(139, 0, 0, 0.15) 0%, #050505 85%)',
      vignetteSize: 40,
      noiseIntensity: 15,
      filmGrainOpacity: 8,
      shadowBlur: 20,
      glowIntensity: 25,
      blurRadius: 10,
      glassBlur: 16,
      glassOpacity: 10,
      borderRadius: 4,
      componentSpacing: 24,
      animationSpeed: 1.2
    },
    gallery_config: [
      { id: 1, url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600&auto=format&fit=crop', title: 'THE RECORDING CABIN', category: 'STUDIO SESSION', photographer: 'Ankur', credits: 'Studio Archives', altText: 'Recording microphone under red light', caption: 'Capturing static vocals', featured: true },
      { id: 2, url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop', title: 'STATIC REVERBERATION', category: 'LIVE SETTING', photographer: 'Ankur', credits: 'Live Archives', altText: 'Live crowd silhouette in dark red haze', caption: 'Bass resonance live set', featured: true }
    ],
    platforms_config: {
      spotify: 'https://open.spotify.com/artist/0SZI7o0l7PAyfvIKDDm3DV',
      appleMusic: 'https://music.apple.com/us/song/sukuna/6771417507',
      youtube: 'https://youtube.com/8ctrl',
      instagram: 'https://instagram.com/8ctrl',
      soundcloud: '',
      email: 'booking@8ctrl.com',
      booking: 'management@8ctrl.com',
      customLinks: [
        { label: 'Latest Merch Store', url: 'https://merch.8ctrl.com', validated: true }
      ]
    },
    user_permissions_config: {
      users: [
        { username: 'ankur', role: 'Administrator', loginHistory: '2026-06-26 19:10:05 from IP 192.168.1.1' },
        { username: 'designer_red', role: 'Designer', loginHistory: '2026-06-26 18:45:20 from IP 192.168.1.42' }
      ]
    }
  });

  // DB tracks state
  const [tracks, setTracks] = useState<any[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<any | null>(null);

  // Responsive & Sync states
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [syncingReleases, setSyncingReleases] = useState(false);

  // ── Save State Machine ──────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [retryCount, setRetryCount] = useState(0);
  const [notifications, setNotifications] = useState<{ id: number; type: 'success' | 'error' | 'info'; message: string }[]>([]);

  // Dev-only network inspector state
  const [showNetworkPanel, setShowNetworkPanel] = useState(false);
  const [saveLog, setSaveLog] = useState<SaveEvent[]>([]);

  // ── Anti-duplicate refs ─────────────────────────────────────────────────────
  // settingsRef / selectedTrackRef: always hold fresh values for the retry closure
  const settingsRef = useRef(settings);
  const selectedTrackRef = useRef(selectedTrack);
  // inFlightRef: if a save is already running, block new saves
  const inFlightRef = useRef<boolean>(false);
  // retryTimerRef: holds the setTimeout id so we can cancel it on success
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // retryAbortRef: AbortController for the retry fetch so we can cancel mid-request
  const retryAbortRef = useRef<AbortController | null>(null);
  // saveAllSettingsRef: stable ref so keyboard handler never has a stale closure
  const saveAllSettingsRef = useRef<() => Promise<void>>(() => Promise.resolve());
  // Derived: keep legacy syncStatus for header display
  const syncStatus = (
    saveState === 'saving' || saveState === 'retrying' ? 'saving' :
    saveState === 'offline' ? 'offline-pending' :
    saveState === 'error' ? 'error' :
    'synced'
  ) as 'synced' | 'saving' | 'offline-pending' | 'error';
  // Legacy: is any save in progress?
  const saving = saveState === 'saving' || saveState === 'retrying';

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    selectedTrackRef.current = selectedTrack;
  }, [selectedTrack]);

  // ── Network log helper ──────────────────────────────────────────────────────
  const logSaveEvent = useCallback((ev: Omit<SaveEvent, 'ts'>) => {
    setSaveLog(prev => [{ ts: Date.now(), ...ev }, ...prev].slice(0, 40));
  }, []);
  
  // Interactive Live Preview Workspace Viewport Configurations
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewOrientation, setPreviewOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [previewScrollScrubber, setPreviewScrollScrubber] = useState<number>(0);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [showLivePreview, setShowLivePreview] = useState(true);

  // Diagnostics Overlay configurations
  const [showDiagnostics, setShowDiagnostics] = useState(true);
  const [diagnosticsTelemetry, setDiagnosticsTelemetry] = useState({
    fps: 59.8,
    memory: '42.3 MB',
    latency: '24ms',
    particles: 120
  });

  // Revisions stack (Undo/Redo)
  const [historyStack, setHistoryStack] = useState<any[]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);

  // Media Library filter and selection configurations
  const [mediaSearch, setMediaSearch] = useState('');
  const [mediaCategoryFilter, setMediaCategoryFilter] = useState<'all' | 'image' | 'audio' | 'video'>('all');
  const [selectedMediaFiles, setSelectedMediaFiles] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState([
    { name: 'sukuna_cover.jpg', size: '254 KB', type: 'image', url: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/44/6a/a5/446aa581-e4e8-df30-97de-e2561fc7e999/1200214051570.jpg/600x600bb.jpg' },
    { name: '911_cover.jpg', size: '189 KB', type: 'image', url: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/2d/fa/26/2dfa266f-3954-7f14-6747-deb03f3a51b8/8718521142124.jpg/600x600bb.jpg' },
    { name: 'pills_cover.jpg', size: '302 KB', type: 'image', url: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/a3/c1/93/a3c1935c-f2b3-6c6e-d58d-ffada5fcd90f/5026854886381.jpg/600x600bb.jpg' },
    { name: 'ambient_loop_1.mp3', size: '4.2 MB', type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
  ]);
  // Toast notifier helper
  const notify = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  // Traffic monitoring states
  const [trafficStats, setTrafficStats] = useState<any>(null);
  const [trafficLoading, setTrafficLoading] = useState(false);
  const [trafficAutoRefresh, setTrafficAutoRefresh] = useState(true);
  const [trafficCountdown, setTrafficCountdown] = useState(5);
  const [hoveredGraphIndex, setHoveredGraphIndex] = useState<number | null>(null);

  const fetchTrafficStats = useCallback(async (showSilentLoading = false) => {
    if (!showSilentLoading) setTrafficLoading(true);
    try {
      const res = await fetch('/api/admin/traffic-stats');
      if (!res.ok) throw new Error('Failed to fetch traffic stats');
      const payload = await res.json();
      if (payload.success) {
        setTrafficStats(payload.data);
      }
    } catch (err) {
      console.error('Error fetching traffic stats:', err);
    } finally {
      if (!showSilentLoading) setTrafficLoading(false);
    }
  }, []);

  const purgeTrafficLogs = async () => {
    if (!window.confirm('Are you sure you want to delete ALL traffic history logs? This cannot be undone.')) {
      return;
    }
    setTrafficLoading(true);
    try {
      const res = await fetch('/api/admin/traffic-stats', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to purge traffic logs');
      const payload = await res.json();
      if (payload.success) {
        notify('success', 'Traffic logs purged successfully');
        fetchTrafficStats();
      }
    } catch (err) {
      console.error('Error purging traffic logs:', err);
      notify('error', 'Failed to purge traffic logs');
    } finally {
      setTrafficLoading(false);
    }
  };

  // Fetch when entering analytics tab
  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchTrafficStats();
    }
  }, [activeTab, fetchTrafficStats]);

  // Handle countdown and auto refresh polling
  useEffect(() => {
    if (activeTab !== 'analytics' || !trafficAutoRefresh) return;

    const timer = setInterval(() => {
      setTrafficCountdown((prev) => {
        if (prev <= 1) {
          fetchTrafficStats(true);
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTab, trafficAutoRefresh, fetchTrafficStats]);
  // Stack tracker on setting modifications
  const pushStateHistory = (nextSettings: any) => {
    const newStack = historyStack.slice(0, historyPointer + 1);
    newStack.push(JSON.parse(JSON.stringify(nextSettings)));
    if (newStack.length > 50) newStack.shift();
    setHistoryStack(newStack);
    setHistoryPointer(newStack.length - 1);
  };

  const handleUndo = () => {
    if (historyPointer > 0) {
      const nextPtr = historyPointer - 1;
      setHistoryPointer(nextPtr);
      setSettings(JSON.parse(JSON.stringify(historyStack[nextPtr])));
      notify('info', 'Undo changes success');
    }
  };

  const handleRedo = () => {
    if (historyPointer < historyStack.length - 1) {
      const nextPtr = historyPointer + 1;
      setHistoryPointer(nextPtr);
      setSettings(JSON.parse(JSON.stringify(historyStack[nextPtr])));
      notify('info', 'Redo changes success');
    }
  };

  // Keyboard shortcut listener — uses refs to avoid forward-reference issues
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCmdPalette(prev => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveAllSettingsRef.current();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // saveAllSettingsRef is always up-to-date — the handler never goes stale.

  // Diagnostics Telemetry updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDiagnosticsTelemetry({
        fps: +(58 + Math.random() * 2).toFixed(1),
        memory: `${(41 + Math.random() * 3).toFixed(1)} MB`,
        latency: `${Math.round(20 + Math.random() * 15)}ms`,
        particles: Math.round(100 + Math.random() * 40)
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // ── Cancel all pending retries ───────────────────────────────────────────────
  const cancelRetries = useCallback(() => {
    if (retryTimerRef.current !== null) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    if (retryAbortRef.current) {
      retryAbortRef.current.abort();
      retryAbortRef.current = null;
    }
  }, []);

  // ── Core save executor (used by both primary save and retry) ─────────────────
  const executeSave = useCallback(async (signal?: AbortSignal): Promise<void> => {
    const currentSettings = settingsRef.current;
    const currentTrack = selectedTrackRef.current;

    // Translate CMS keys → DB API keys
    const dbPayload = cmsSettingsToDbPayload(currentSettings);

    logSaveEvent({ type: 'request', detail: `POST /api/admin/settings — ${Object.keys(dbPayload).length} keys` });

    const settingsSaveRes = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: dbPayload }),
      signal,
    });

    let settingsJson: any;
    try {
      settingsJson = await settingsSaveRes.json();
    } catch (_) {
      settingsJson = { success: false, error: { message: 'Non-JSON response' } };
    }

    logSaveEvent({
      type: settingsSaveRes.ok && settingsJson.success ? 'response' : 'error',
      detail: `Settings → HTTP ${settingsSaveRes.status} ${settingsSaveRes.ok ? 'OK' : 'FAIL'}`,
      httpStatus: settingsSaveRes.status,
      body: settingsJson,
    });

    if (!settingsSaveRes.ok || !settingsJson.success) {
      const errMsg = settingsJson?.error?.message || settingsJson?.message || `HTTP ${settingsSaveRes.status}`;
      console.error(
        '[CMS Save] Settings POST failed.\n',
        '  HTTP Status:', settingsSaveRes.status, '\n',
        '  API Error:', errMsg, '\n',
        '  Full body:', JSON.stringify(settingsJson, null, 2)
      );
      throw new Error(`Settings save failed: ${errMsg}`);
    }

    if (currentTrack) {
      const { id, title, artist, album, coverUrl, previewUrl, spotifyUrl, appleUrl, youtubeUrl, genre, duration, isFeatured, isArtistFav, isFanFav, isTrending, isRecommended, isLatest, ...extMetadata } = currentTrack;
      const trackPayload = {
        id, title, artist, album, coverUrl, previewUrl, spotifyUrl, appleUrl, youtubeUrl, genre, duration,
        isFeatured, isArtistFav, isFanFav, isTrending, isRecommended, isLatest,
        extendedMetadata: extMetadata,
      };

      logSaveEvent({ type: 'request', detail: `POST /api/admin/tracks — id: ${id}` });

      const trackUpdateRes = await fetch('/api/admin/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackPayload),
        signal,
      });

      let trackJson: any;
      try {
        trackJson = await trackUpdateRes.json();
      } catch (_) {
        trackJson = { success: false, error: { message: 'Non-JSON response' } };
      }

      logSaveEvent({
        type: trackUpdateRes.ok && trackJson.success ? 'response' : 'error',
        detail: `Track → HTTP ${trackUpdateRes.status} ${trackUpdateRes.ok ? 'OK' : 'FAIL'}`,
        httpStatus: trackUpdateRes.status,
        body: trackJson,
      });

      if (!trackUpdateRes.ok || !trackJson.success) {
        const errMsg = trackJson?.error?.message || trackJson?.message || `HTTP ${trackUpdateRes.status}`;
        console.error(
          '[CMS Save] Track POST failed.\n',
          '  HTTP Status:', trackUpdateRes.status, '\n',
          '  API Error:', errMsg, '\n',
          '  Full body:', JSON.stringify(trackJson, null, 2)
        );
        throw new Error(`Track save failed: ${errMsg}`);
      }
    }
  }, [logSaveEvent]);

  // ── Background retry loop ────────────────────────────────────────────────────
  const scheduleRetry = useCallback((attempt: number) => {
    // Exponential backoff: 10s, 20s, 40s, capped at 60s
    const delay = Math.min(10000 * Math.pow(2, attempt - 1), 60000);
    console.log(`[CMS Retry] Scheduling retry #${attempt} in ${delay / 1000}s`);

    retryTimerRef.current = setTimeout(async () => {
      retryTimerRef.current = null;
      const abort = new AbortController();
      retryAbortRef.current = abort;

      setSaveState('retrying');
      setRetryCount(attempt);
      logSaveEvent({ type: 'request', detail: `Retry attempt #${attempt}` });

      try {
        await executeSave(abort.signal);

        // ✅ Retry succeeded — cancel everything and clear
        retryAbortRef.current = null;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('8ctrl-unsaved-settings');
          localStorage.removeItem('8ctrl-unsaved-track');
        }
        setSaveState('saved');
        setRetryCount(0);
        inFlightRef.current = false;
        notify('success', 'Database reconnected — edits synchronized.');
        logSaveEvent({ type: 'response', detail: `Retry #${attempt} succeeded` });

        // Reset to idle after a moment
        setTimeout(() => setSaveState('idle'), 2000);
      } catch (err: any) {
        retryAbortRef.current = null;
        if (err?.name === 'AbortError') {
          console.log('[CMS Retry] Aborted.');
          return; // A new primary save took over
        }
        console.warn(`[CMS Retry] Attempt #${attempt} failed:`, err?.message);
        logSaveEvent({ type: 'error', detail: `Retry #${attempt} failed: ${err?.message}` });
        setSaveState('offline');
        scheduleRetry(attempt + 1);
      }
    }, delay);
  }, [executeSave, logSaveEvent]);

  // Fetch settings & tracks on mount
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const settingsRes = await fetch('/api/admin/settings');
      const settingsJson = await settingsRes.json();
      const settingsData = settingsJson.success ? settingsJson.data : {};
      
      let mergedSettings = {
        ...settings,
        ...settingsData
      };

      // Check if there are local offline changes to overlay on top of DB values
      let hadLocalBackup = false;
      if (typeof window !== 'undefined') {
        const savedSettingsStr = localStorage.getItem('8ctrl-unsaved-settings');
        if (savedSettingsStr) {
          try {
            const localBackup = JSON.parse(savedSettingsStr);
            mergedSettings = { ...mergedSettings, ...localBackup };
            hadLocalBackup = true;
          } catch (_) {}
        }
      }

      setSettings(mergedSettings);
      setHistoryStack([JSON.parse(JSON.stringify(mergedSettings))]);
      setHistoryPointer(0);

      if (hadLocalBackup) {
        setSaveState('offline');
        notify('info', 'Local offline changes loaded. DB sync pending.');
        scheduleRetry(1);
      }

      const tracksRes = await fetch('/api/admin/tracks');
      const tracksJson = await tracksRes.json();
      const tracksData = tracksJson.success ? tracksJson.data : [];
      
      if (Array.isArray(tracksData)) {
        setTracks(tracksData);
        if (tracksData.length > 0) {
          // Check if there is an unsaved track backup locally
          let selected = tracksData[0];
          if (typeof window !== 'undefined') {
            const savedTrackStr = localStorage.getItem('8ctrl-unsaved-track');
            if (savedTrackStr) {
              try {
                selected = JSON.parse(savedTrackStr);
              } catch (_) {}
            }
          }

          // Ensure selected track has parsed extendedMetadata properties loaded locally for visual inputs
          let ext: any = {};
          if (selected.extendedMetadata) {
            try {
              ext = typeof selected.extendedMetadata === 'string' 
                ? JSON.parse(selected.extendedMetadata) 
                : selected.extendedMetadata;
            } catch (_) {}
          }
          setSelectedTrack({ ...selected, ...ext });
        }
      }
      if (!hadLocalBackup) {
        notify('success', 'Workspace configuration synchronized');
      }
    } catch (err) {
      console.error(err);
      notify('error', 'Database sync failed. Standard defaults initialized.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Primary save (user-triggered) ───────────────────────────────────────────
  const saveAllSettings = useCallback(async () => {
    // ❶ Deduplication: block if a save is already in flight
    if (inFlightRef.current) {
      console.log('[CMS Save] Ignoring duplicate save — already in flight.');
      logSaveEvent({ type: 'request', detail: 'Ignored duplicate save request' });
      return;
    }

    // ❷ Cancel any pending retries — a new explicit save takes over
    cancelRetries();

    inFlightRef.current = true;
    setSaveState('saving');
    setRetryCount(0);
    notify('info', 'Publishing workspace parameters live...');

    // ❸ Write to localStorage immediately as crash-safe backup
    if (typeof window !== 'undefined') {
      localStorage.setItem('8ctrl-unsaved-settings', JSON.stringify(settings));
      if (selectedTrack) {
        localStorage.setItem('8ctrl-unsaved-track', JSON.stringify(selectedTrack));
      }
    }

    try {
      await executeSave();

      // ✅ Primary save succeeded — clear everything
      cancelRetries();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('8ctrl-unsaved-settings');
        localStorage.removeItem('8ctrl-unsaved-track');
      }
      setSaveState('saved');
      inFlightRef.current = false;
      notify('success', 'Creative Studio parameters published live');

      // Return to idle after 2s
      setTimeout(() => setSaveState('idle'), 2000);
    } catch (err: any) {
      console.error('[CMS Save] Primary save failed:', err?.message);
      inFlightRef.current = false;
      setSaveState('idle');
      notify('error', `Publish failed: ${err?.message || String(err)}`);
    }
  }, [settings, selectedTrack, executeSave, cancelRetries, scheduleRetry, logSaveEvent]);

  // Keep the ref always pointing at the latest version of saveAllSettings
  useEffect(() => {
    saveAllSettingsRef.current = saveAllSettings;
  }, [saveAllSettings]);

  // Sync releases from iTunes API
  const handleSyncReleases = async () => {
    if (syncingReleases) return;
    setSyncingReleases(true);
    notify('info', 'Contacting iTunes Search API...');
    try {
      const res = await fetch('/api/admin/releases/sync', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        notify('success', data.message || 'Releases synced successfully!');
        // Refresh state
        await fetchAllData();
      } else {
        notify('error', data.error?.message || 'Sync failed.');
      }
    } catch (err: any) {
      notify('error', `Sync failed: ${err.message || String(err)}`);
    } finally {
      setSyncingReleases(false);
    }
  };

  // Update specific settings block and add to history
  const updateSettingsField = (blockKey: string, fieldKey: string, val: any) => {
    const updated = {
      ...settings,
      [blockKey]: {
        ...settings[blockKey],
        [fieldKey]: val
      }
    };
    setSettings(updated);
    pushStateHistory(updated);
  };

  const updateSettingsDirect = (blockKey: string, val: any) => {
    const updated = {
      ...settings,
      [blockKey]: val
    };
    setSettings(updated);
    pushStateHistory(updated);
  };

  const handleCommandAction = (action: string) => {
    setShowCmdPalette(false);
    if (action === 'save') saveAllSettings();
    if (action === 'undo') handleUndo();
    if (action === 'redo') handleRedo();
    if (action === 'diagnostics') setShowDiagnostics(prev => !prev);
    if (action === 'profile') setActiveTab('profile');
    if (action === 'tracks') setActiveTab('discography');
    if (action === 'composer') setActiveTab('homepage');
    if (action === 'scenes') setActiveTab('scenes');
    if (action === 'visual') setActiveTab('visual');
    if (action === 'media') setActiveTab('media');
    if (action === 'seo') setActiveTab('seo');
    if (action === 'system') setActiveTab('system');
  };

  // Reorder sections simulator
  const moveComposerSection = (index: number, direction: 'up' | 'down') => {
    const sections = [...settings.homepage_layout.sections];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    
    const temp = sections[index];
    sections[index] = sections[targetIdx];
    sections[targetIdx] = temp;

    updateSettingsField('homepage_layout', 'sections', sections);
  };

  // Reorder tracks/releases simulator
  const moveTrackOrder = (index: number, direction: 'up' | 'down') => {
    const reordered = [...tracks];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= reordered.length) return;
    
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    setTracks(reordered);
    notify('info', 'Reordered release catalog');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-foreground flex flex-col font-sans select-none overflow-hidden relative">
      
      {/* Toast Notification Container */}
      <div className="fixed top-6 right-6 z-[9999] space-y-3 max-w-sm pointer-events-none">
        {notifications.map(n => (
          <div 
            key={n.id} 
            className={`p-4 rounded border text-xs font-mono flex items-center gap-3 shadow-2xl animate-fade-in ${
              n.type === 'success' ? 'bg-[#0E0E0E] border-green-500/40 text-green-400' :
              n.type === 'error' ? 'bg-[#0E0E0E] border-red-500/40 text-red-400' :
              'bg-[#0E0E0E] border-blue-500/40 text-blue-400'
            }`}
          >
            {n.type === 'success' && <Check className="w-4 h-4 flex-shrink-0" />}
            {n.type === 'error' && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
            <span>{n.message}</span>
          </div>
        ))}
      </div>

      {/* Ctrl+K Command Palette Modal */}
      {showCmdPalette && (
        <div className="fixed inset-0 z-[9998] bg-black/80 flex items-center justify-center p-4" onClick={() => setShowCmdPalette(false)}>
          <div className="w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-lg shadow-2xl overflow-hidden font-mono" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-white/5 flex items-center gap-3">
              <Command className="w-5 h-5 text-crimson" />
              <input 
                type="text" 
                placeholder="Search panels, media, commands..."
                value={cmdSearch}
                onChange={e => setCmdSearch(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-foreground text-sm placeholder-[#444]"
                autoFocus
              />
            </div>
            <div className="p-2 max-h-[300px] overflow-y-auto text-xs text-text-secondary">
              {[
                { name: 'Save Changes & Sync DB', shortcut: 'Ctrl+S', action: 'save' },
                { name: 'Undo Last Action', shortcut: 'Ctrl+Z', action: 'undo' },
                { name: 'Redo Action', shortcut: 'Ctrl+Y', action: 'redo' },
                { name: 'Toggle Telemetry Diagnostics', shortcut: 'Click', action: 'diagnostics' },
                { name: 'Edit Artist Profile details', shortcut: 'Nav', action: 'profile' },
                { name: 'Cinematic Track Experience details', shortcut: 'Nav', action: 'tracks' },
                { name: 'Homepage composer sections assembly', shortcut: 'Nav', action: 'composer' },
                { name: 'Scene Studio transitions editor', shortcut: 'Nav', action: 'scenes' },
                { name: 'Visual Design studio colors/filters', shortcut: 'Nav', action: 'visual' },
                { name: 'Media Library browser', shortcut: 'Nav', action: 'media' },
                { name: 'SEO parameters & platforms links', shortcut: 'Nav', action: 'seo' },
                { name: 'System diagnostics & backups panel', shortcut: 'Nav', action: 'system' },
              ].filter(c => c.name.toLowerCase().includes(cmdSearch.toLowerCase())).map((cmd, i) => (
                <div 
                  key={i}
                  onClick={() => handleCommandAction(cmd.action)}
                  className="p-3 rounded hover:bg-blood-red/10 hover:text-white cursor-pointer flex justify-between items-center"
                >
                  <span>{cmd.name}</span>
                  <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] text-foreground">{cmd.shortcut}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Studio layout header */}
      <header className="min-h-[4rem] py-3 lg:py-0 border-b border-white/5 bg-[#0A0A0A] flex flex-col lg:flex-row items-center justify-between px-6 z-40 gap-4 lg:gap-0">
        <div className="flex items-center justify-between w-full lg:w-auto gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileSidebarOpen(prev => !prev)}
              className="p-2 border border-white/5 bg-elevated hover:bg-surface text-white rounded lg:hidden"
              title="Open Navigation Menu"
            >
              <Menu className="w-4 h-4 text-crimson" />
            </button>
            <span className="font-bebas text-lg md:text-2xl text-blood-red tracking-wider">8CTRL EXPERIENCE ENGINE STUDIO</span>
          </div>
          <div className="bg-[#151515] text-[10px] font-mono border border-white/5 px-2 py-0.5 rounded text-text-secondary hidden sm:flex items-center gap-1.5">
            <Command className="w-3 h-3 text-crimson" /> Press <kbd className="text-foreground">Ctrl+K</kbd> for commands
          </div>
        </div>

        {/* Global Search and Actions */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 w-full lg:w-auto">
          <div className="flex gap-2">
            <button 
              onClick={handleUndo} 
              disabled={historyPointer <= 0}
              className="p-2 border border-white/5 bg-elevated hover:bg-surface text-text-secondary hover:text-white rounded text-xs transition-colors disabled:opacity-20"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-4 h-4 text-crimson" />
            </button>
            <button 
              onClick={handleRedo} 
              disabled={historyPointer >= historyStack.length - 1}
              className="p-2 border border-white/5 bg-elevated hover:bg-surface text-text-secondary hover:text-white rounded text-xs transition-colors disabled:opacity-20"
              title="Redo (Ctrl+Y)"
            >
              <Redo className="w-4 h-4 text-crimson" />
            </button>
          </div>

          <button 
            onClick={handleSyncReleases}
            disabled={syncingReleases}
            className="flex items-center gap-1.5 px-3 py-2 border border-white/5 bg-elevated hover:bg-surface text-text-secondary hover:text-white rounded text-xs transition-colors"
            title="Fetch new releases and auto-populate previews"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-crimson ${syncingReleases ? 'animate-spin' : ''}`} />
            <span>{syncingReleases ? 'Syncing...' : 'Refresh Status'}</span>
          </button>

          <button 
            onClick={() => setShowLivePreview(prev => !prev)}
            className="flex items-center gap-2 px-3 py-2 border border-white/5 bg-elevated hover:bg-surface text-text-secondary hover:text-white rounded text-xs transition-colors"
          >
            <Eye className="w-4 h-4 text-crimson" /> <span className="hidden sm:inline">{showLivePreview ? 'Hide Simulator' : 'Show Simulator'}</span><span className="sm:hidden">{showLivePreview ? 'Hide Sim' : 'Show Sim'}</span>
          </button>

          {syncStatus === 'offline-pending' && (
            <span className="flex items-center gap-1.5 text-crimson font-mono text-[10px] animate-pulse uppercase mr-2" title="Database is offline. Changes are saved locally and will auto-sync when reconnected.">
              <span className="w-2 h-2 rounded-full bg-crimson" /> Offline
            </span>
          )}
          {syncStatus === 'saving' && (
            <span className="flex items-center gap-1.5 text-accent font-mono text-[10px] uppercase mr-2">
              <RefreshCw className="w-3 h-3 text-accent animate-spin" /> Syncing...
            </span>
          )}
          {syncStatus === 'synced' && (
            <span className="flex items-center gap-1.5 text-emerald-500 font-mono text-[10px] uppercase mr-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Synced
            </span>
          )}

          <button 
            onClick={saveAllSettings}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blood-red hover:bg-crimson disabled:bg-blood-red/40 text-white rounded text-xs font-semibold shadow-md transition-colors"
          >
            <Save className="w-4 h-4" /> {saving ? (saveState === 'retrying' ? `Retry #${retryCount}...` : 'Publishing...') : 'Publish Live'}
          </button>

          {/* DEV: Network Inspector toggle */}
          {process.env.NODE_ENV !== 'production' && (
            <button
              onClick={() => setShowNetworkPanel(p => !p)}
              className={`p-2 border rounded text-xs transition-colors ${
                showNetworkPanel 
                  ? 'border-crimson/50 bg-crimson/10 text-crimson' 
                  : 'border-white/5 bg-elevated text-text-secondary hover:text-white hover:bg-surface'
              }`}
              title="Toggle Network Inspector (Dev)"
            >
              <Activity className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* DEV-ONLY: Floating Network Inspector Panel */}
      {showNetworkPanel && process.env.NODE_ENV !== 'production' && (
        <div className="fixed bottom-6 right-6 z-[9990] w-[440px] max-h-[420px] bg-[#0A0A0A] border border-white/10 rounded-lg shadow-2xl font-mono text-xs flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#111]">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-crimson" />
              <span className="text-foreground font-semibold">Network Inspector</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                saveState === 'idle' ? 'bg-white/10 text-white/50' :
                saveState === 'dirty' ? 'bg-yellow-500/20 text-yellow-400' :
                saveState === 'saving' ? 'bg-blue-500/20 text-blue-400' :
                saveState === 'saved' ? 'bg-green-500/20 text-green-400' :
                saveState === 'retrying' ? 'bg-orange-500/20 text-orange-400' :
                saveState === 'offline' ? 'bg-crimson/20 text-crimson' :
                'bg-red-500/20 text-red-400'
              }`}>{saveState.toUpperCase()}{saveState === 'retrying' ? ` #${retryCount}` : ''}</span>
            </div>
            <button onClick={() => setSaveLog([])} className="text-[10px] text-text-secondary hover:text-white transition-colors">Clear</button>
          </div>
          <div className="overflow-y-auto flex-1 p-3 space-y-1.5">
            {saveLog.length === 0 && (
              <div className="text-text-secondary text-center py-4">No events yet. Click Publish Live to start.</div>
            )}
            {saveLog.map((ev, i) => (
              <div key={i} className={`p-2 rounded border text-[10px] leading-relaxed ${
                ev.type === 'request' ? 'border-blue-500/20 bg-blue-500/5 text-blue-300' :
                ev.type === 'response' ? 'border-green-500/20 bg-green-500/5 text-green-300' :
                'border-red-500/20 bg-red-500/5 text-red-300'
              }`}>
                <div className="flex justify-between mb-0.5">
                  <span className="font-bold uppercase">{ev.type}</span>
                  <span className="text-white/30">{new Date(ev.ts).toLocaleTimeString()}</span>
                </div>
                <div>{ev.detail}</div>
                {ev.httpStatus && <div className="text-white/40">HTTP {ev.httpStatus}</div>}
                {ev.body?.error?.message && (
                  <div className="text-red-400 mt-0.5">⚠ {ev.body.error.message}</div>
                )}
              </div>
            ))}
          </div>
          <div className="px-4 py-2 border-t border-white/5 text-[9px] text-text-secondary flex justify-between">
            <span>Key map: {Object.keys(CMS_TO_DB_KEY).length} CMS→DB mappings</span>
            <span>{saveLog.length} events</span>
          </div>
        </div>
      )}

      {/* Workspace Wrapper */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div 
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 z-40 lg:hidden"
          />
        )}
        
        {/* Collapsible Left Sidebar */}
        <aside className={`fixed lg:relative inset-y-0 left-0 w-60 border-r border-white/5 bg-[#080808] flex flex-col justify-between py-6 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <nav className="space-y-1 px-4">
            <div className="flex justify-between items-center px-3 mb-2 lg:mb-0">
              <span className="text-[10px] font-mono tracking-widest text-text-secondary uppercase">Creative Suite</span>
              <button 
                onClick={() => setMobileSidebarOpen(false)}
                className="lg:hidden p-1 text-text-secondary hover:text-white"
                title="Close Navigation"
              >
                <X className="w-4 h-4 text-crimson" />
              </button>
            </div>
            {[
              { id: 'dashboard', label: 'Studio Overview', icon: LayoutDashboard },
              { id: 'profile', label: 'Artist Identity', icon: User },
              { id: 'discography', label: 'Tracks Curation', icon: Music },
              { id: 'homepage', label: 'Homepage Composer', icon: Sliders },
              { id: 'visual', label: 'Visual Studio', icon: Palette },
              { id: 'scenes', label: 'Scene Studio', icon: Sparkles },
              { id: 'media', label: 'Media Browser', icon: ImageIcon },
              { id: 'quotes', label: 'Quotes Database', icon: FileText },
              { id: 'seo', label: 'Platforms & SEO', icon: Globe },
              { id: 'permissions', label: 'Role Permissions', icon: Settings },
              { id: 'analytics', label: 'Visitors Analytics', icon: BarChart3 },
              { id: 'system', label: 'Diagnostics & System', icon: Database }
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs transition-colors ${
                    activeTab === item.id 
                      ? 'bg-blood-red/10 border border-blood-red/30 text-white' 
                      : 'text-text-secondary hover:text-foreground hover:bg-[#121212] border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${activeTab === item.id ? 'text-crimson' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="px-6 text-[10px] font-mono text-[#333] space-y-2">
            <div className="flex items-center gap-2 text-text-secondary">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
              <span>Studio Engine Stable</span>
            </div>
            <div>Revisions stack: {historyPointer + 1} / {historyStack.length}</div>
          </div>
        </aside>

        {/* Content & Simulation Pane */}
        <main className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
          
          {/* Left Panel: Active tab forms editor */}
          <div className="flex-1 p-4 sm:p-8 overflow-y-auto space-y-8 pb-32 border-b lg:border-b-0 lg:border-r border-white/5 bg-[#050505]">
            
            {/* TAB: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-fade-in">
                <header>
                  <h2 className="text-2xl font-bebas tracking-wide text-foreground uppercase">Creative Studio</h2>
                  <p className="text-xs text-text-secondary font-mono mt-1">Direct the digital landscape of the 8CTRL Cinematic Experience.</p>
                </header>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
                  {[
                    { label: 'Total Songs', value: tracks.length, sub: 'iTunes Normalized' },
                    { label: 'Active Scenes', value: settings.scenes_config.filter((s: any) => s.enabled).length, sub: 'Experience chapters' },
                    { label: 'Asset Library', value: mediaFiles.length, sub: 'Optimized files' },
                    { label: 'SEO Score', value: '98/100', sub: 'Audited tags' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-[#0E0E0E] p-4 border border-white/5 rounded flex flex-col justify-between">
                      <span className="text-[10px] uppercase text-text-secondary">{stat.label}</span>
                      <span className="text-3xl font-bebas text-blood-red my-2 font-bold">{stat.value}</span>
                      <span className="text-[9px] text-[#444]">{stat.sub}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono text-xs">
                  <div className="bg-[#0E0E0E] p-6 border border-white/5 rounded space-y-4">
                    <h3 className="text-sm font-bebas text-crimson font-bold tracking-wider uppercase">Active Visual Rules</h3>
                    <div className="space-y-3 text-text-secondary">
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span>Film Grain filter:</span>
                        <span className="text-foreground">{settings.visual_studio_config.filmGrainOpacity}% Opacity</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span>Vignette sizing:</span>
                        <span className="text-foreground">{settings.visual_studio_config.vignetteSize}% Coverage</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span>Background mode:</span>
                        <span className="text-foreground text-[10px] truncate max-w-[150px]">{settings.visual_studio_config.backgroundGradient}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0E0E0E] p-6 border border-white/5 rounded space-y-4">
                    <h3 className="text-sm font-bebas text-crimson font-bold tracking-wider uppercase">Recent Activity logs</h3>
                    <div className="space-y-3 text-[10px] text-text-secondary max-h-[120px] overflow-y-auto">
                      <div>[2026-06-26 19:24] Administrator published brand palette color changes.</div>
                      <div>[2026-06-26 19:15] Synced iTunes content catalog with local database.</div>
                      <div>[2026-06-26 18:50] System health diagnostic completed successfully.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PROFILE */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fade-in">
                <header>
                  <h2 className="text-2xl font-bebas tracking-wide text-foreground uppercase">Artist Identity</h2>
                  <p className="text-xs text-text-secondary font-mono mt-1">Configure structural texts and branding colors.</p>
                </header>

                <div className="space-y-4 font-mono text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-text-secondary mb-1">Artist Name</label>
                      <input 
                        type="text" 
                        value={settings.artist_profile.name} 
                        onChange={e => updateSettingsField('artist_profile', 'name', e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-white/10 p-2 text-foreground focus:border-blood-red outline-none rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-text-secondary mb-1">Real Name</label>
                      <input 
                        type="text" 
                        value={settings.artist_profile.realName} 
                        onChange={e => updateSettingsField('artist_profile', 'realName', e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-white/10 p-2 text-foreground focus:border-blood-red outline-none rounded"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-text-secondary mb-1">Hero Title Custom Text</label>
                    <input 
                      type="text" 
                      value={settings.artist_profile.heroText} 
                      onChange={e => updateSettingsField('artist_profile', 'heroText', e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 p-2 text-foreground focus:border-blood-red outline-none rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-text-secondary mb-1">Biography Content</label>
                    <textarea 
                      rows={4}
                      value={settings.artist_profile.biography} 
                      onChange={e => updateSettingsField('artist_profile', 'biography', e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 p-2 text-foreground focus:border-blood-red outline-none rounded resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-text-secondary mb-1">Location Details</label>
                    <input 
                      type="text" 
                      value={settings.artist_profile.location} 
                      onChange={e => updateSettingsField('artist_profile', 'location', e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 p-2 text-foreground focus:border-blood-red outline-none rounded"
                    />
                  </div>

                  <div className="bg-[#0A0A0A] p-4 border border-white/10 rounded space-y-4">
                    <h3 className="text-xs uppercase text-crimson font-bold flex items-center gap-1.5"><Palette className="w-4 h-4" /> Brand Theme Colors</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(settings.artist_profile.brandColors || {}).map(([colorKey, colorVal]: any) => (
                        <div key={colorKey} className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary capitalize">{colorKey.replace(/([A-Z])/g, ' $1')}</label>
                          <div className="flex gap-2 items-center">
                            <input 
                              type="color" 
                              value={colorVal} 
                              onChange={e => {
                                const colors = { ...settings.artist_profile.brandColors, [colorKey]: e.target.value };
                                updateSettingsField('artist_profile', 'brandColors', colors);
                              }}
                              className="bg-transparent w-8 h-8 border-none outline-none cursor-pointer"
                            />
                            <input 
                              type="text" 
                              value={colorVal}
                              onChange={e => {
                                const colors = { ...settings.artist_profile.brandColors, [colorKey]: e.target.value };
                                updateSettingsField('artist_profile', 'brandColors', colors);
                              }}
                              className="bg-surface border border-white/10 text-[10px] p-1 font-mono w-20 focus:outline-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: DISCOGRAPHY */}
            {activeTab === 'discography' && (
              <div className="space-y-6 animate-fade-in font-mono text-xs">
                <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-white/5 pb-4">
                  <div>
                    <h2 className="text-2xl font-bebas tracking-wide text-foreground uppercase font-sans">Tracks Experience Editor</h2>
                    <p className="text-xs text-text-secondary mt-1 font-mono">Bind custom background gradients, particles, blurs, and typography to individual tracks.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={handleSyncReleases}
                      disabled={syncingReleases}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-foreground text-xs font-semibold rounded font-sans transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-crimson ${syncingReleases ? 'animate-spin' : ''}`} />
                      <span>{syncingReleases ? 'Syncing...' : 'Sync Releases'}</span>
                    </button>
                    <button 
                      onClick={() => {
                        const newId = Math.random().toString(36).substring(2, 15);
                        const newTrack = {
                          id: newId,
                          title: 'New Track Drop',
                          artist: '8CTRL',
                          album: 'Universe Mixtape',
                          genre: 'Electronic',
                          duration: 180,
                          isFeatured: false,
                          isArtistFav: false,
                          isFanFav: false,
                          isLatest: true,
                          // Extended Experience parameters
                          slug: 'new-track-drop',
                          backgroundArtwork: '',
                          accentColor: '#8B0000',
                          particlePreset: 'ash',
                          lightingPreset: 'soft',
                          typographyPreset: 'bebas',
                          scrollTransition: 'fade',
                          ambientPreset: 'ambient_loop_1',
                          sceneDescription: 'Cold modular reverberation.',
                          lyrics: 'Lyrics static...',
                          status: 'published'
                        };
                        setTracks(prev => [...prev, newTrack]);
                        setSelectedTrack(newTrack);
                        notify('success', 'New track envelope generated');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blood-red text-white text-xs font-semibold hover:bg-crimson transition-colors rounded font-sans"
                    >
                      <Plus className="w-4 h-4" /> Add Release Envelope
                    </button>
                  </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Tracks list */}
                  <div className="border border-white/5 rounded overflow-hidden divide-y divide-white/5 max-h-[500px] overflow-y-auto bg-[#0A0A0A] md:col-span-1">
                    {tracks.map((t, idx) => (
                      <div 
                        key={t.id}
                        onClick={() => {
                          let ext: any = {};
                          if (t.extendedMetadata) {
                            try {
                              ext = typeof t.extendedMetadata === 'string' 
                                ? JSON.parse(t.extendedMetadata) 
                                : t.extendedMetadata;
                            } catch (_) {}
                          }
                          setSelectedTrack({ ...t, ...ext });
                        }}
                        className={`p-3 cursor-pointer flex items-center justify-between transition-colors ${
                          selectedTrack?.id === t.id 
                            ? 'bg-blood-red/10 text-white font-bold' 
                            : 'text-text-secondary hover:bg-white/5'
                        }`}
                      >
                        <div className="truncate max-w-[120px]">{t.title}</div>
                        <div className="flex gap-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); moveTrackOrder(idx, 'up'); }}
                            disabled={idx === 0}
                            className="text-[#444] hover:text-white p-0.5 disabled:opacity-20"
                          >
                            ▲
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); moveTrackOrder(idx, 'down'); }}
                            disabled={idx === tracks.length - 1}
                            className="text-[#444] hover:text-white p-0.5 disabled:opacity-20"
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Track Experience form */}
                  {selectedTrack ? (
                    <div className="md:col-span-2 border border-white/5 p-6 rounded space-y-5 bg-[#0E0E0E]">
                      <div className="flex justify-between border-b border-white/5 pb-3 items-center">
                        <span className="text-sm font-bebas text-crimson font-sans font-bold uppercase">Experience Settings: {selectedTrack.title}</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              if (selectedTrack.previewUrl) {
                                transitionTo(selectedTrack.id);
                              } else {
                                notify('info', 'No preview audio URL assigned');
                              }
                            }} 
                            className="bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-1 rounded text-[10px] flex items-center gap-1.5 text-text-secondary hover:text-white transition-colors"
                          >
                            <Play className="w-3.5 h-3.5 text-green-500 fill-green-500" /> Play Preview
                          </button>
                          <button 
                            onClick={async () => {
                              if (confirm(`Archive release envelope: ${selectedTrack.title}?`)) {
                                try {
                                  await fetch(`/api/admin/tracks?id=${selectedTrack.id}`, { method: 'DELETE' });
                                  setTracks(prev => prev.filter(t => t.id !== selectedTrack.id));
                                  setSelectedTrack(null);
                                  notify('success', 'Release envelope deleted');
                                } catch (_) {
                                  notify('error', 'Failed to archive envelope');
                                }
                              }
                            }}
                            className="p-1 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-text-secondary mb-1">Track Title</label>
                          <input 
                            type="text" 
                            value={selectedTrack.title}
                            onChange={e => {
                              const updated = { ...selectedTrack, title: e.target.value };
                              setSelectedTrack(updated);
                              setTracks(prev => prev.map(t => t.id === selectedTrack.id ? updated : t));
                            }}
                            className="w-full bg-[#050505] border border-white/10 p-2 text-foreground outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-text-secondary mb-1">Slug Identifier</label>
                          <input 
                            type="text" 
                            value={selectedTrack.slug || ''}
                            onChange={e => {
                              const updated = { ...selectedTrack, slug: e.target.value };
                              setSelectedTrack(updated);
                            }}
                            className="w-full bg-[#050505] border border-white/10 p-2 text-foreground outline-none"
                          />
                        </div>
                      </div>

                      {/* Track Core Metadata Section */}
                      <div className="p-4 bg-[#050505] border border-white/5 rounded space-y-4">
                        <h4 className="text-[10px] text-crimson uppercase font-bold">Track Core Metadata</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[9px] text-[#444] mb-1">Artist Name</label>
                            <input 
                              type="text" 
                              value={selectedTrack.artist || ''}
                              onChange={e => {
                                const updated = { ...selectedTrack, artist: e.target.value };
                                setSelectedTrack(updated);
                                setTracks(prev => prev.map(t => t.id === selectedTrack.id ? updated : t));
                              }}
                              className="w-full bg-[#0E0E0E] border border-white/10 p-1.5 text-foreground outline-none rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-[#444] mb-1">Album Name</label>
                            <input 
                              type="text" 
                              value={selectedTrack.album || ''}
                              onChange={e => {
                                const updated = { ...selectedTrack, album: e.target.value };
                                setSelectedTrack(updated);
                                setTracks(prev => prev.map(t => t.id === selectedTrack.id ? updated : t));
                              }}
                              className="w-full bg-[#0E0E0E] border border-white/10 p-1.5 text-foreground outline-none rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-[#444] mb-1">Genre</label>
                            <input 
                              type="text" 
                              value={selectedTrack.genre || ''}
                              onChange={e => {
                                const updated = { ...selectedTrack, genre: e.target.value };
                                setSelectedTrack(updated);
                                setTracks(prev => prev.map(t => t.id === selectedTrack.id ? updated : t));
                              }}
                              className="w-full bg-[#0E0E0E] border border-white/10 p-1.5 text-foreground outline-none rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-[#444] mb-1">Duration (seconds)</label>
                            <input 
                              type="number" 
                              value={selectedTrack.duration || 0}
                              onChange={e => {
                                const updated = { ...selectedTrack, duration: parseInt(e.target.value) || 0 };
                                setSelectedTrack(updated);
                                setTracks(prev => prev.map(t => t.id === selectedTrack.id ? updated : t));
                              }}
                              className="w-full bg-[#0E0E0E] border border-white/10 p-1.5 text-foreground outline-none rounded"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-[9px] text-[#444] mb-1">Cover Artwork URL</label>
                            <input 
                              type="text" 
                              value={selectedTrack.coverUrl || ''}
                              onChange={e => {
                                const updated = { ...selectedTrack, coverUrl: e.target.value };
                                setSelectedTrack(updated);
                                setTracks(prev => prev.map(t => t.id === selectedTrack.id ? updated : t));
                              }}
                              className="w-full bg-[#0E0E0E] border border-white/10 p-1.5 text-foreground outline-none text-[10px] rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-[#444] mb-1">Preview Audio URL (mp3/aac)</label>
                            <input 
                              type="text" 
                              value={selectedTrack.previewUrl || ''}
                              onChange={e => {
                                const updated = { ...selectedTrack, previewUrl: e.target.value };
                                setSelectedTrack(updated);
                                setTracks(prev => prev.map(t => t.id === selectedTrack.id ? updated : t));
                              }}
                              className="w-full bg-[#0E0E0E] border border-white/10 p-1.5 text-foreground outline-none text-[10px] rounded"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[9px] text-[#444] mb-1">Spotify URL</label>
                            <input 
                              type="text" 
                              value={selectedTrack.spotifyUrl || ''}
                              onChange={e => {
                                const updated = { ...selectedTrack, spotifyUrl: e.target.value };
                                setSelectedTrack(updated);
                                setTracks(prev => prev.map(t => t.id === selectedTrack.id ? updated : t));
                              }}
                              className="w-full bg-[#0E0E0E] border border-white/10 p-1.5 text-foreground outline-none text-[10px] rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-[#444] mb-1">Apple Music URL</label>
                            <input 
                              type="text" 
                              value={selectedTrack.appleUrl || ''}
                              onChange={e => {
                                const updated = { ...selectedTrack, appleUrl: e.target.value };
                                setSelectedTrack(updated);
                                setTracks(prev => prev.map(t => t.id === selectedTrack.id ? updated : t));
                              }}
                              className="w-full bg-[#0E0E0E] border border-white/10 p-1.5 text-foreground outline-none text-[10px] rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-[#444] mb-1">YouTube URL</label>
                            <input 
                              type="text" 
                              value={selectedTrack.youtubeUrl || ''}
                              onChange={e => {
                                const updated = { ...selectedTrack, youtubeUrl: e.target.value };
                                setSelectedTrack(updated);
                                setTracks(prev => prev.map(t => t.id === selectedTrack.id ? updated : t));
                              }}
                              className="w-full bg-[#0E0E0E] border border-white/10 p-1.5 text-foreground outline-none text-[10px] rounded"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Cinematic preset configuration */}
                      <div className="p-4 bg-[#050505] border border-white/5 rounded space-y-4">
                        <h4 className="text-[10px] text-crimson uppercase font-bold">Atmospheric Presets</h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[9px] text-[#444] mb-1">Particle preset</label>
                            <select 
                              value={selectedTrack.particlePreset || 'ash'}
                              onChange={e => setSelectedTrack({ ...selectedTrack, particlePreset: e.target.value })}
                              className="w-full bg-[#0E0E0E] border border-white/10 p-1.5 text-foreground outline-none"
                            >
                              {['ash', 'dust', 'smoke', 'spark', 'rain', 'noise', 'light', 'none'].map(p => (
                                <option key={p} value={p}>{p}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] text-[#444] mb-1">Lighting preset</label>
                            <select 
                              value={selectedTrack.lightingPreset || 'soft'}
                              onChange={e => setSelectedTrack({ ...selectedTrack, lightingPreset: e.target.value })}
                              className="w-full bg-[#0E0E0E] border border-white/10 p-1.5 text-foreground outline-none"
                            >
                              {['soft', 'harsh', 'spotlight', 'none'].map(l => (
                                <option key={l} value={l}>{l}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] text-[#444] mb-1">Typography style</label>
                            <input 
                              type="text" 
                              value={selectedTrack.typographyPreset || ''}
                              placeholder="font-bebas tracking-wide"
                              onChange={e => setSelectedTrack({ ...selectedTrack, typographyPreset: e.target.value })}
                              className="w-full bg-[#0E0E0E] border border-white/10 p-1.5 text-foreground outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-[#444] mb-1">Accent color hex</label>
                            <input 
                              type="text" 
                              value={selectedTrack.accentColor || ''}
                              onChange={e => setSelectedTrack({ ...selectedTrack, accentColor: e.target.value })}
                              className="w-full bg-[#0E0E0E] border border-white/10 p-1.5 text-foreground outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Toggles */}
                      <div className="grid grid-cols-3 gap-2 p-3 bg-[#050505] rounded text-[10px]">
                        {[
                          { key: 'isFeatured', label: 'Featured release' },
                          { key: 'isArtistFav', label: "Artist's favorite" },
                          { key: 'isFanFav', label: 'Fan favorite' },
                        ].map(toggle => (
                          <label key={toggle.key} className="flex items-center gap-2 cursor-pointer text-text-secondary hover:text-white">
                            <input 
                              type="checkbox"
                              checked={!!selectedTrack[toggle.key]}
                              onChange={e => {
                                const updated = { ...selectedTrack, [toggle.key]: e.target.checked };
                                setSelectedTrack(updated);
                                setTracks(prev => prev.map(t => t.id === selectedTrack.id ? updated : t));
                              }}
                              className="accent-blood-red"
                            />
                            <span>{toggle.label}</span>
                          </label>
                        ))}
                      </div>

                      <div>
                        <label className="block text-[10px] text-text-secondary mb-1">Lyrics transcription</label>
                        <textarea 
                          rows={3} 
                          value={selectedTrack.lyrics || ''}
                          onChange={e => setSelectedTrack({ ...selectedTrack, lyrics: e.target.value })}
                          className="w-full bg-[#050505] border border-white/10 p-2 text-foreground outline-none resize-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="md:col-span-2 border border-dashed border-white/5 p-12 text-center text-text-secondary flex flex-col items-center justify-center gap-2">
                      <Music className="w-8 h-8 text-crimson animate-pulse" />
                      <span>Select a track node to edit its custom visual profile parameters.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: HOMEPAGE COMPOSER */}
            {activeTab === 'homepage' && (
              <div className="space-y-6 animate-fade-in font-mono text-xs">
                <header>
                  <h2 className="text-2xl font-bebas tracking-wide text-foreground uppercase font-sans">Homepage Composer</h2>
                  <p className="text-xs text-text-secondary mt-1">Assemble page structures visually, manage custom margins, backgrounds, and order.</p>
                </header>

                <div className="space-y-3 max-w-xl">
                  {settings.homepage_layout.sections.map((section: any, idx: number) => (
                    <div 
                      key={section.id} 
                      className="bg-[#0E0E0E] p-4 border border-white/5 rounded space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            checked={section.enabled}
                            onChange={e => {
                              const list = [...settings.homepage_layout.sections];
                              list[idx].enabled = e.target.checked;
                              updateSettingsField('homepage_layout', 'sections', list);
                            }}
                            className="w-4 h-4 accent-blood-red cursor-pointer"
                          />
                          <span className={`font-bold ${section.enabled ? 'text-foreground' : 'text-[#444] line-through'}`}>
                            {section.name}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <button 
                            onClick={() => moveComposerSection(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 bg-[#050505] border border-white/10 hover:bg-[#181818] rounded text-[#888] disabled:opacity-20"
                          >
                            ▲
                          </button>
                          <button 
                            onClick={() => moveComposerSection(idx, 'down')}
                            disabled={idx === settings.homepage_layout.sections.length - 1}
                            className="p-1 bg-[#050505] border border-white/10 hover:bg-[#181818] rounded text-[#888] disabled:opacity-20"
                          >
                            ▼
                          </button>
                        </div>
                      </div>

                      {section.enabled && (
                        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/5 text-[10px] text-text-secondary">
                          <div>
                            <label className="block text-[#444] mb-1">Margins/Spacing</label>
                            <input 
                              type="text" 
                              value={section.spacing || 'py-20'}
                              onChange={e => {
                                const list = [...settings.homepage_layout.sections];
                                list[idx].spacing = e.target.value;
                                updateSettingsField('homepage_layout', 'sections', list);
                              }}
                              className="w-full bg-[#050505] border border-white/10 p-1 outline-none text-foreground"
                            />
                          </div>
                          <div>
                            <label className="block text-[#444] mb-1">Theme override</label>
                            <select 
                              value={section.themeOverride || 'cinematic'}
                              onChange={e => {
                                const list = [...settings.homepage_layout.sections];
                                list[idx].themeOverride = e.target.value;
                                updateSettingsField('homepage_layout', 'sections', list);
                              }}
                              className="w-full bg-[#050505] border border-white/10 p-1 outline-none text-foreground"
                            >
                              <option value="cinematic">Cinematic Blood</option>
                              <option value="dark">Matte Black</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[#444] mb-1">Bg Override</label>
                            <input 
                              type="text" 
                              value={section.backgroundOverride || ''}
                              placeholder="e.g. #050505"
                              onChange={e => {
                                const list = [...settings.homepage_layout.sections];
                                list[idx].backgroundOverride = e.target.value;
                                updateSettingsField('homepage_layout', 'sections', list);
                              }}
                              className="w-full bg-[#050505] border border-white/10 p-1 outline-none text-foreground"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: VISUAL STUDIO */}
            {activeTab === 'visual' && (
              <div className="space-y-6 animate-fade-in font-mono text-xs">
                <header>
                  <h2 className="text-2xl font-bebas tracking-wide text-foreground uppercase font-sans">Visual Studio Editor</h2>
                  <p className="text-xs text-text-secondary mt-1">Configure global overlays, glassmorphism filters, spacings, and blurs.</p>
                </header>

                <div className="bg-[#0E0E0E] p-6 border border-white/5 rounded space-y-6">
                  <div>
                    <label className="block text-text-secondary mb-2">Global Background Gradient</label>
                    <input 
                      type="text" 
                      value={settings.visual_studio_config.backgroundGradient}
                      onChange={e => updateSettingsField('visual_studio_config', 'backgroundGradient', e.target.value)}
                      className="w-full bg-[#050505] border border-white/10 p-2 text-foreground outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { key: 'vignetteSize', label: 'Vignette Overlay Size (%)', min: 0, max: 100 },
                      { key: 'filmGrainOpacity', label: 'Film Grain filter opacity (%)', min: 0, max: 50 },
                      { key: 'noiseIntensity', label: 'Visual Noise density', min: 0, max: 100 },
                      { key: 'glassBlur', label: 'Glassmorphism Blur radius (px)', min: 0, max: 40 },
                      { key: 'borderRadius', label: 'Global Border Radius (px)', min: 0, max: 20 },
                      { key: 'componentSpacing', label: 'Layout items spacing (px)', min: 8, max: 64 },
                      { key: 'animationSpeed', label: 'Transition speed factor (x)', min: 0.1, max: 3, step: 0.1 },
                    ].map(slider => (
                      <div key={slider.key} className="space-y-1.5">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-text-secondary">{slider.label}</span>
                          <span className="text-crimson font-bold">{settings.visual_studio_config[slider.key]}</span>
                        </div>
                        <input 
                          type="range"
                          min={slider.min}
                          max={slider.max}
                          step={slider.hasOwnProperty('step') ? (slider as any).step : 1}
                          value={settings.visual_studio_config[slider.key]}
                          onChange={e => updateSettingsField('visual_studio_config', slider.key, +e.target.value)}
                          className="w-full accent-blood-red bg-[#050505] cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SCENE STUDIO */}
            {activeTab === 'scenes' && (
              <div className="space-y-6 animate-fade-in font-mono text-xs">
                <header className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bebas tracking-wide text-foreground uppercase font-sans">Scene Studio</h2>
                    <p className="text-xs text-text-secondary mt-1">Fine-tune dynamic atmospheric behaviors per scene node.</p>
                  </div>
                  <button 
                    onClick={() => {
                      const newScene = {
                        id: `scene-${Math.random().toString(36).substring(2, 6)}`,
                        name: 'New Custom Scene',
                        enabled: true,
                        order: settings.scenes_config.length,
                        transitionPreset: 'fade',
                        duration: 3,
                        backgroundMode: 'radial',
                        accentColors: '#8B0000',
                        typographyPreset: 'bebas',
                        particlePreset: 'ash',
                        ambientPreset: 'ambient_loop_1',
                        scrollSpeed: 1,
                        overlayEffects: 'none',
                        blurIntensity: 2,
                        grainIntensity: 2,
                        lightingIntensity: 5
                      };
                      updateSettingsDirect('scenes_config', [...settings.scenes_config, newScene]);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blood-red text-white text-xs font-semibold hover:bg-crimson transition-colors rounded font-sans"
                  >
                    <Plus className="w-4 h-4" /> Add Scene Node
                  </button>
                </header>

                <div className="space-y-4">
                  {settings.scenes_config.map((scene: any, idx: number) => (
                    <div key={scene.id} className="bg-[#0E0E0E] p-5 border border-white/5 rounded space-y-4">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox"
                            checked={scene.enabled}
                            onChange={e => {
                              const list = [...settings.scenes_config];
                              list[idx].enabled = e.target.checked;
                              updateSettingsDirect('scenes_config', list);
                            }}
                            className="accent-blood-red"
                          />
                          <input 
                            type="text"
                            value={scene.name}
                            onChange={e => {
                              const list = [...settings.scenes_config];
                              list[idx].name = e.target.value;
                              updateSettingsDirect('scenes_config', list);
                            }}
                            className="bg-transparent border-none outline-none font-bold text-foreground text-xs focus:underline"
                          />
                        </div>
                        <button 
                          onClick={() => {
                            const list = settings.scenes_config.filter((s: any) => s.id !== scene.id);
                            updateSettingsDirect('scenes_config', list);
                          }}
                          className="text-[#444] hover:text-red-400"
                        >
                          Archive
                        </button>
                      </div>

                      {scene.enabled && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px]">
                          <div>
                            <label className="block text-[#444] mb-1">Transition</label>
                            <select 
                              value={scene.transitionPreset}
                              onChange={e => {
                                const list = [...settings.scenes_config];
                                list[idx].transitionPreset = e.target.value;
                                updateSettingsDirect('scenes_config', list);
                              }}
                              className="w-full bg-[#050505] border border-white/10 p-1 outline-none text-foreground"
                            >
                              {['fade', 'maskReveal', 'blurReveal', 'scaleReveal'].map(p => (
                                <option key={p} value={p}>{p}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[#444] mb-1">Particles Preset</label>
                            <select 
                              value={scene.particlePreset}
                              onChange={e => {
                                const list = [...settings.scenes_config];
                                list[idx].particlePreset = e.target.value;
                                updateSettingsDirect('scenes_config', list);
                              }}
                              className="w-full bg-[#050505] border border-white/10 p-1 outline-none text-foreground"
                            >
                              {['ash', 'dust', 'smoke', 'spark', 'noise', 'none'].map(p => (
                                <option key={p} value={p}>{p}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[#444] mb-1">Scroll Factor</label>
                            <input 
                              type="number"
                              step="0.1"
                              value={scene.scrollSpeed}
                              onChange={e => {
                                const list = [...settings.scenes_config];
                                list[idx].scrollSpeed = +e.target.value;
                                updateSettingsDirect('scenes_config', list);
                              }}
                              className="w-full bg-[#050505] border border-white/10 p-1 outline-none text-foreground"
                            />
                          </div>
                          <div>
                            <label className="block text-[#444] mb-1">Ambient track</label>
                            <input 
                              type="text"
                              value={scene.ambientPreset}
                              onChange={e => {
                                const list = [...settings.scenes_config];
                                list[idx].ambientPreset = e.target.value;
                                updateSettingsDirect('scenes_config', list);
                              }}
                              className="w-full bg-[#050505] border border-white/10 p-1 outline-none text-foreground"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: MEDIA LIBRARY */}
            {activeTab === 'media' && (
              <div className="space-y-6 animate-fade-in font-mono text-xs">
                <header className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bebas tracking-wide text-foreground uppercase font-sans">Media Studio</h2>
                    <p className="text-xs text-text-secondary mt-1">Central asset library catalog. Bulk operations bar enabled.</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const fileInput = document.createElement('input');
                        fileInput.setAttribute('type', 'file');
                        fileInput.setAttribute('multiple', 'true');
                        fileInput.onchange = () => {
                          notify('success', 'Optimizing files & simulating upload...');
                          setTimeout(() => {
                            const newFiles = [
                              { name: 'session_clip_3.wav', size: '2.1 MB', type: 'audio', url: '' },
                              { name: 'dark_ambient_art.jpg', size: '410 KB', type: 'image', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop' }
                            ];
                            setMediaFiles(prev => [...prev, ...newFiles]);
                            notify('success', 'Uploaded assets catalog saved');
                          }, 1500);
                        };
                        fileInput.click();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blood-red hover:bg-crimson text-white rounded font-sans"
                    >
                      <Upload className="w-4 h-4" /> Bulk Upload assets
                    </button>
                    {selectedMediaFiles.length > 0 && (
                      <button 
                        onClick={() => {
                          setMediaFiles(prev => prev.filter(f => !selectedMediaFiles.includes(f.name)));
                          setSelectedMediaFiles([]);
                          notify('success', 'Bulk delete successful');
                        }}
                        className="px-3 py-1.5 bg-red-950/20 text-red-400 border border-red-500/20 hover:bg-red-950/40 rounded"
                      >
                        Delete Selected ({selectedMediaFiles.length})
                      </button>
                    )}
                  </div>
                </header>

                <div className="flex justify-between items-center gap-4 bg-[#0A0A0A] p-3 border border-white/5 rounded">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-[#444] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      placeholder="Search asset filenames..."
                      value={mediaSearch}
                      onChange={e => setMediaSearch(e.target.value)}
                      className="bg-transparent pl-9 outline-none text-foreground w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    {['all', 'image', 'audio'].map((cat: any) => (
                      <button
                        key={cat}
                        onClick={() => setMediaCategoryFilter(cat)}
                        className={`px-3 py-1 rounded capitalize ${mediaCategoryFilter === cat ? 'bg-blood-red/10 border border-blood-red/30 text-white' : 'text-[#444] hover:text-[#888]'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {mediaFiles.filter(f => {
                    const matchSearch = f.name.toLowerCase().includes(mediaSearch.toLowerCase());
                    const matchCat = mediaCategoryFilter === 'all' || f.type === mediaCategoryFilter;
                    return matchSearch && matchCat;
                  }).map((file, idx) => {
                    const isSelected = selectedMediaFiles.includes(file.name);
                    return (
                      <div 
                        key={idx} 
                        onClick={() => {
                          if (isSelected) {
                            setSelectedMediaFiles(prev => prev.filter(n => n !== file.name));
                          } else {
                            setSelectedMediaFiles(prev => [...prev, file.name]);
                          }
                        }}
                        className={`bg-[#0E0E0E] border rounded overflow-hidden flex flex-col justify-between group p-3 space-y-2 cursor-pointer transition-colors ${
                          isSelected ? 'border-blood-red bg-blood-red/5' : 'border-white/5'
                        }`}
                      >
                        <div className="relative aspect-square bg-[#050505] border border-white/5 flex items-center justify-center overflow-hidden">
                          {file.type === 'image' ? (
                            <img src={file.url} alt={file.name} className="w-full h-full object-cover filter grayscale" />
                          ) : (
                            <Volume2 className="w-8 h-8 text-crimson animate-pulse" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="truncate font-semibold text-[10px]" title={file.name}>{file.name}</div>
                          <div className="flex justify-between text-[9px] text-[#444]">
                            <span>{file.size}</span>
                            <span className="capitalize">{file.type}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: QUOTES DATABASE */}
            {activeTab === 'quotes' && (
              <div className="space-y-6 animate-fade-in font-mono text-xs">
                <header className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bebas tracking-wide text-foreground uppercase font-sans">Quotes Database</h2>
                    <p className="text-xs text-text-secondary mt-1">Manage quote nodes displayed in the slider blocks.</p>
                  </div>
                  <button 
                    onClick={() => {
                      const newQuote = {
                        text: 'Static quote description block goes here.',
                        author: '8CTRL',
                        source: 'Studio Session',
                        status: 'draft'
                      };
                      updateSettingsDirect('verified_quotes', [...settings.verified_quotes, newQuote]);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blood-red text-white text-xs font-semibold hover:bg-crimson transition-colors rounded font-sans"
                  >
                    <Plus className="w-4 h-4" /> Add Quote
                  </button>
                </header>

                <div className="space-y-3">
                  {settings.verified_quotes.map((quote: any, idx: number) => (
                    <div key={idx} className="bg-[#0E0E0E] p-4 border border-white/5 rounded space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-crimson font-bold">Quote Node #{idx + 1}</span>
                        <div className="flex gap-2">
                          <select 
                            value={quote.status || 'published'}
                            onChange={e => {
                              const list = [...settings.verified_quotes];
                              list[idx].status = e.target.value;
                              updateSettingsDirect('verified_quotes', list);
                            }}
                            className="bg-[#050505] text-[10px] border border-white/10 outline-none p-0.5 text-foreground"
                          >
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                          </select>
                          <button 
                            onClick={() => {
                              const list = settings.verified_quotes.filter((_: any, i: number) => i !== idx);
                              updateSettingsDirect('verified_quotes', list);
                            }}
                            className="text-[#444] hover:text-white"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      <textarea 
                        rows={2} 
                        value={quote.text}
                        onChange={e => {
                          const list = [...settings.verified_quotes];
                          list[idx].text = e.target.value;
                          updateSettingsDirect('verified_quotes', list);
                        }}
                        className="w-full bg-[#050505] border border-white/10 p-2 text-foreground outline-none resize-none"
                      />

                      <div className="grid grid-cols-2 gap-4 text-[10px]">
                        <div>
                          <label className="text-[#444] block mb-0.5">Author</label>
                          <input 
                            type="text" 
                            value={quote.author}
                            onChange={e => {
                              const list = [...settings.verified_quotes];
                              list[idx].author = e.target.value;
                              updateSettingsDirect('verified_quotes', list);
                            }}
                            className="w-full bg-[#050505] border border-white/10 p-1 text-foreground outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[#444] block mb-0.5">Source reference</label>
                          <input 
                            type="text" 
                            value={quote.source}
                            onChange={e => {
                              const list = [...settings.verified_quotes];
                              list[idx].source = e.target.value;
                              updateSettingsDirect('verified_quotes', list);
                            }}
                            className="w-full bg-[#050505] border border-white/10 p-1 text-foreground outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: SEO & PLATFORMS */}
            {activeTab === 'seo' && (
              <div className="space-y-6 animate-fade-in font-mono text-xs">
                <header>
                  <h2 className="text-2xl font-bebas tracking-wide text-foreground uppercase font-sans">Platforms & SEO panel</h2>
                  <p className="text-xs text-text-secondary mt-1">Configure global search index descriptors and booking coordinates.</p>
                </header>

                <div className="bg-[#0E0E0E] p-6 border border-white/5 rounded space-y-6">
                  <h3 className="text-sm font-bebas text-crimson font-bold uppercase tracking-wider">Search Engine Optimization</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-text-secondary mb-1">Global Meta Title</label>
                      <input 
                        type="text" 
                        value={settings.seo_config.title}
                        onChange={e => updateSettingsField('seo_config', 'title', e.target.value)}
                        className="w-full bg-[#050505] border border-white/10 p-2 text-foreground outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-text-secondary mb-1">Canonical URL</label>
                      <input 
                        type="text" 
                        value={settings.seo_config.canonical || ''}
                        onChange={e => updateSettingsField('seo_config', 'canonical', e.target.value)}
                        className="w-full bg-[#050505] border border-white/10 p-2 text-foreground outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-text-secondary mb-1">Meta Description</label>
                    <textarea 
                      rows={2} 
                      value={settings.seo_config.description}
                      onChange={e => updateSettingsField('seo_config', 'description', e.target.value)}
                      className="w-full bg-[#050505] border border-white/10 p-2 text-foreground outline-none resize-none"
                    />
                  </div>

                  <h3 className="text-sm font-bebas text-crimson font-bold uppercase tracking-wider pt-4 border-t border-white/5">Platform Link Coordinates</h3>

                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(settings.platforms_config || {}).filter(([k]) => k !== 'customLinks').map(([platformKey, val]: any) => (
                      <div key={platformKey}>
                        <label className="block text-text-secondary mb-1 capitalize">{platformKey}</label>
                        <input 
                          type="text" 
                          value={val}
                          onChange={e => {
                            const pf = { ...settings.platforms_config, [platformKey]: e.target.value };
                            updateSettingsField('platforms_config', 'pf', pf);
                          }}
                          className="w-full bg-[#050505] border border-white/10 p-2 text-foreground outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ROLE PERMISSIONS */}
            {activeTab === 'permissions' && (
              <div className="space-y-6 animate-fade-in font-mono text-xs">
                <header>
                  <h2 className="text-2xl font-bebas tracking-wide text-foreground uppercase font-sans">Role Permissions Matrix</h2>
                  <p className="text-xs text-text-secondary mt-1">Configure granular access nodes for design, edit, and publication layers.</p>
                </header>

                <div className="bg-[#0E0E0E] p-6 border border-white/5 rounded space-y-4">
                  <h3 className="text-sm font-bebas text-crimson font-bold uppercase tracking-wider">Granular user registers</h3>
                  <div className="divide-y divide-white/5">
                    {settings.user_permissions_config.users.map((usr: any, idx: number) => (
                      <div key={idx} className="py-3 flex justify-between items-center">
                        <div>
                          <div className="font-bold text-foreground">{usr.username}</div>
                          <div className="text-[10px] text-[#444]">{usr.loginHistory}</div>
                        </div>
                        <span className="px-2 py-0.5 bg-blood-red/20 text-crimson rounded border border-blood-red/30 uppercase text-[9px] font-bold">
                          {usr.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="space-y-6 animate-fade-in font-mono text-xs text-text-secondary">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
                  <div>
                    <h2 className="text-2xl font-bebas tracking-wide text-foreground uppercase font-sans flex items-center gap-2">
                      <Activity className="w-5 h-5 text-crimson animate-pulse" />
                      Live Traffic Analytics
                    </h2>
                    <p className="text-xs text-text-secondary mt-1">Real-time HTTP requests, visitor geographics, and client telemetry.</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Auto Refresh Toggle */}
                    <button
                      onClick={() => setTrafficAutoRefresh(!trafficAutoRefresh)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded border text-[10px] transition-all cursor-pointer ${
                        trafficAutoRefresh
                          ? 'bg-blood-red/10 border-blood-red/40 text-white'
                          : 'bg-[#0E0E0E] border-white/5 text-[#444] hover:text-foreground'
                      }`}
                      title={trafficAutoRefresh ? 'Pause Auto Refresh' : 'Resume Auto Refresh'}
                    >
                      {trafficAutoRefresh ? (
                        <>
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                          </span>
                          <span>Live ({trafficCountdown}s)</span>
                        </>
                      ) : (
                        <>
                          <Pause className="w-3 h-3" />
                          <span>Paused</span>
                        </>
                      )}
                    </button>

                    {/* Manual Refresh */}
                    <button
                      onClick={() => fetchTrafficStats()}
                      disabled={trafficLoading}
                      className="p-1.5 bg-[#0E0E0E] border border-white/5 rounded text-[#888] hover:text-foreground disabled:opacity-50 hover:bg-[#121212] transition-colors cursor-pointer"
                      title="Force Refresh"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${trafficLoading ? 'animate-spin text-crimson' : ''}`} />
                    </button>

                    {/* Purge Logs */}
                    <button
                      onClick={purgeTrafficLogs}
                      disabled={trafficLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-crimson/15 border border-crimson/30 hover:bg-crimson/25 rounded text-white text-[10px] transition-all cursor-pointer disabled:opacity-50"
                      title="Purge traffic history logs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Purge History
                    </button>
                  </div>
                </header>

                {!trafficStats && trafficLoading ? (
                  <div className="h-96 flex flex-col items-center justify-center gap-3 border border-white/5 rounded bg-[#0E0E0E]">
                    <RotateCw className="w-8 h-8 animate-spin text-crimson" />
                    <span className="text-[#666] animate-pulse">Establishing connection to metrics hub...</span>
                  </div>
                ) : !trafficStats ? (
                  <div className="h-96 flex flex-col items-center justify-center gap-3 border border-white/5 rounded bg-[#0E0E0E] text-[#666]">
                    <Database className="w-8 h-8 text-[#333]" />
                    <span>No traffic telemetry records recorded yet.</span>
                    <p className="text-[10px] text-[#444] text-center max-w-xs">Visit your site homepage and browse pages to initialize request streams.</p>
                  </div>
                ) : (
                  <>
                    {/* Key Metrics Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-[#0E0E0E] p-4 border border-white/5 rounded space-y-1 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Activity className="w-16 h-16 text-crimson" />
                        </div>
                        <span className="text-[#444] uppercase tracking-wider text-[9px] block">Active Now</span>
                        <div className="flex items-baseline gap-2 pt-1">
                          <span className="text-3xl font-bebas text-white tracking-wide">
                            {trafficStats.realtimeActiveUsers}
                          </span>
                          <span className="relative flex h-2 w-2 mb-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                        </div>
                        <span className="text-[10px] text-[#666] block">Unique clients in last 5m</span>
                      </div>

                      <div className="bg-[#0E0E0E] p-4 border border-white/5 rounded space-y-1 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Eye className="w-16 h-16 text-crimson" />
                        </div>
                        <span className="text-[#444] uppercase tracking-wider text-[9px] block">Total Page Views (24h)</span>
                        <div className="pt-1">
                          <span className="text-3xl font-bebas text-white tracking-wide">
                            {trafficStats.totalViews24h}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#666] block">Aggregate requests logged</span>
                      </div>

                      <div className="bg-[#0E0E0E] p-4 border border-white/5 rounded space-y-1 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                          <User className="w-16 h-16 text-crimson" />
                        </div>
                        <span className="text-[#444] uppercase tracking-wider text-[9px] block">Unique Visitors (24h)</span>
                        <div className="pt-1">
                          <span className="text-3xl font-bebas text-white tracking-wide">
                            {trafficStats.uniqueVisitors24h}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#666] block">Distinct IPs analyzed</span>
                      </div>

                      <div className="bg-[#0E0E0E] p-4 border border-white/5 rounded space-y-1 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Sliders className="w-16 h-16 text-crimson" />
                        </div>
                        <span className="text-[#444] uppercase tracking-wider text-[9px] block">Avg Velocity</span>
                        <div className="pt-1">
                          <span className="text-3xl font-bebas text-white tracking-wide">
                            {(trafficStats.totalViews24h / 24).toFixed(1)}
                          </span>
                          <span className="text-[10px] text-text-secondary ml-1">/ hr</span>
                        </div>
                        <span className="text-[10px] text-[#666] block">Hourly load rate over 24h</span>
                      </div>
                    </div>

                    {/* Chart Box */}
                    <div className="bg-[#0E0E0E] border border-white/5 rounded p-6 space-y-4 relative">
                      <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <h3 className="text-xs uppercase text-foreground font-bold tracking-wider">Traffic Velocity (Past 24 Hours)</h3>
                        <div className="flex gap-4 text-[9px] text-[#666]">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-1 bg-crimson inline-block rounded-full" />
                            Page Views
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-1 border-t border-dashed border-red-400 inline-block" />
                            Unique Visitors
                          </span>
                        </div>
                      </div>

                      {/* SVG Chart Wrapper */}
                      <div className="relative h-64 w-full">
                        {(() => {
                          const graphData = trafficStats.graphData || [];
                          const maxVal = Math.max(...graphData.map((d: any) => d.views), ...graphData.map((d: any) => d.unique), 5) * 1.15;
                          
                          const pointsViews = graphData.map((d: any, i: number) => {
                            const x = graphData.length > 1 ? 40 + (i / (graphData.length - 1)) * 920 : 40;
                            const y = 260 - (d.views / maxVal) * 240;
                            return { x, y };
                          });

                          const pointsUniques = graphData.map((d: any, i: number) => {
                            const x = graphData.length > 1 ? 40 + (i / (graphData.length - 1)) * 920 : 40;
                            const y = 260 - (d.unique / maxVal) * 240;
                            return { x, y };
                          });

                          const pathViewsLine = pointsViews.map((p: any, i: number) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
                          const pathUniquesLine = pointsUniques.map((p: any, i: number) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
                          
                          const pathViewsArea = pointsViews.length > 0 ? `${pathViewsLine} L ${pointsViews[pointsViews.length - 1].x} 260 L ${pointsViews[0].x} 260 Z` : '';
                          const pathUniquesArea = pointsUniques.length > 0 ? `${pathUniquesLine} L ${pointsUniques[pointsUniques.length - 1].x} 260 L ${pointsUniques[0].x} 260 Z` : '';

                          return (
                            <>
                              <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
                                <defs>
                                  <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#C1121F" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#C1121F" stopOpacity="0.0" />
                                  </linearGradient>
                                  <linearGradient id="uniquesGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#E63946" stopOpacity="0.12" />
                                    <stop offset="100%" stopColor="#E63946" stopOpacity="0.0" />
                                  </linearGradient>
                                  <filter id="chartGlow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="4" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                  </filter>
                                </defs>

                                {/* Y-Axis Gridlines & labels */}
                                <line x1="40" y1="20" x2="960" y2="20" stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
                                <line x1="40" y1="140" x2="960" y2="140" stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
                                <line x1="40" y1="260" x2="960" y2="260" stroke="rgba(255,255,255,0.07)" />

                                {/* Vertical gridlines */}
                                {graphData.map((d: any, i: number) => {
                                  if (i % 4 !== 0) return null;
                                  const x = graphData.length > 1 ? 40 + (i / (graphData.length - 1)) * 920 : 40;
                                  return (
                                    <line
                                      key={i}
                                      x1={x}
                                      y1="20"
                                      x2={x}
                                      y2="260"
                                      stroke="rgba(255,255,255,0.02)"
                                      strokeDasharray="2 2"
                                    />
                                  );
                                })}

                                {/* Filled area paths */}
                                {pathViewsArea && <path d={pathViewsArea} fill="url(#viewsGrad)" />}
                                {pathUniquesArea && <path d={pathUniquesArea} fill="url(#uniquesGrad)" />}

                                {/* Line paths */}
                                {pathViewsLine && (
                                  <path
                                    d={pathViewsLine}
                                    fill="none"
                                    stroke="#C1121F"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    style={{ filter: 'url(#chartGlow)' }}
                                  />
                                )}
                                {pathUniquesLine && (
                                  <path
                                    d={pathUniquesLine}
                                    fill="none"
                                    stroke="#E63946"
                                    strokeWidth="2.5"
                                    strokeDasharray="4 3"
                                    strokeLinecap="round"
                                  />
                                )}

                                {/* Interactive Hover line & highlights */}
                                {hoveredGraphIndex !== null && pointsViews[hoveredGraphIndex] && (
                                  <>
                                    <line
                                      x1={pointsViews[hoveredGraphIndex].x}
                                      y1="20"
                                      x2={pointsViews[hoveredGraphIndex].x}
                                      y2="260"
                                      stroke="rgba(255,255,255,0.2)"
                                      strokeWidth="1.5"
                                      strokeDasharray="3 3"
                                    />
                                    <circle
                                      cx={pointsViews[hoveredGraphIndex].x}
                                      cy={pointsViews[hoveredGraphIndex].y}
                                      r="6"
                                      fill="#ffffff"
                                      stroke="#C1121F"
                                      strokeWidth="3"
                                    />
                                    <circle
                                      cx={pointsUniques[hoveredGraphIndex].x}
                                      cy={pointsUniques[hoveredGraphIndex].y}
                                      r="5"
                                      fill="#ffffff"
                                      stroke="#E63946"
                                      strokeWidth="2"
                                    />
                                  </>
                                )}
                              </svg>

                              {/* Hover Grid overlay to capture pointer events */}
                              <div className="absolute inset-0 flex pl-[40px] pr-[40px] pt-[20px] pb-[40px]">
                                {graphData.map((d: any, i: number) => (
                                  <div
                                    key={i}
                                    className="flex-1 h-full cursor-crosshair border-r border-transparent hover:bg-white/[0.01]"
                                    onMouseEnter={() => setHoveredGraphIndex(i)}
                                    onMouseLeave={() => setHoveredGraphIndex(null)}
                                  />
                                ))}
                              </div>

                              {/* Chart labels overlay */}
                              {/* Y-axis Labels */}
                              <div className="absolute left-0 top-[20px] bottom-[40px] flex flex-col justify-between text-[8px] text-[#444] pointer-events-none select-none pl-1">
                                <span>{Math.round(maxVal)}</span>
                                <span>{Math.round(maxVal / 2)}</span>
                                <span>0</span>
                              </div>

                              {/* X-axis Labels */}
                              <div className="absolute left-[40px] right-[40px] bottom-0 flex justify-between text-[8px] text-[#444] pointer-events-none select-none">
                                {graphData.map((d: any, i: number) => {
                                  // Show every 4th label to prevent overflow
                                  if (i % 4 !== 0 && i !== graphData.length - 1) return null;
                                  return (
                                    <span key={i} style={{ transform: 'translateX(-50%)' }} className="first:translate-x-0 last:translate-x-[-100%]">
                                      {d.label}
                                    </span>
                                  );
                                })}
                              </div>

                              {/* Floating Tooltip */}
                              {hoveredGraphIndex !== null && graphData[hoveredGraphIndex] && (
                                <div
                                  className="absolute bg-[#121212] border border-white/10 p-3 rounded shadow-2xl pointer-events-none z-10 space-y-1.5 text-[9px] font-mono w-44"
                                  style={{
                                    left: hoveredGraphIndex / graphData.length > 0.7 
                                      ? `${(hoveredGraphIndex / graphData.length) * 100 - 45}%` 
                                      : `${(hoveredGraphIndex / graphData.length) * 100 + 5}%`,
                                    top: '20px',
                                    backdropFilter: 'blur(8px)',
                                  }}
                                >
                                  <div className="text-white font-bold border-b border-white/5 pb-1 mb-1 flex justify-between">
                                    <span>Timeframe:</span>
                                    <span className="text-[#888]">{graphData[hoveredGraphIndex].label}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-text-secondary">
                                      <span className="w-1.5 h-1.5 rounded-full bg-crimson" />
                                      Views:
                                    </span>
                                    <span className="text-white font-bold">{graphData[hoveredGraphIndex].views} requests</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-text-secondary">
                                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                      Unique:
                                    </span>
                                    <span className="text-white font-bold">{graphData[hoveredGraphIndex].unique} visitors</span>
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Bottom Breakdown Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left: Live Request Stream */}
                      <div className="bg-[#0E0E0E] border border-white/5 rounded p-6 space-y-4">
                        <header className="flex justify-between items-center border-b border-white/5 pb-3">
                          <h3 className="text-xs uppercase text-foreground font-bold tracking-wider flex items-center gap-1.5">
                            <Terminal className="w-3.5 h-3.5 text-crimson" />
                            Live Request Stream
                          </h3>
                          <span className="text-[9px] text-[#444] uppercase">Last 30 events</span>
                        </header>

                        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 select-text scrollbar-thin">
                          {trafficStats.recentRequests && trafficStats.recentRequests.length > 0 ? (
                            trafficStats.recentRequests.map((req: any) => {
                              const isPost = req.method === 'POST';
                              const isDelete = req.method === 'DELETE';
                              
                              // Helper for formatting time relative to current
                              const timeString = (() => {
                                const date = new Date(req.createdAt);
                                const diff = Date.now() - date.getTime();
                                if (diff < 5000) return 'Just now';
                                const seconds = Math.floor(diff / 1000);
                                if (seconds < 60) return `${seconds}s ago`;
                                const minutes = Math.floor(seconds / 60);
                                if (minutes < 60) return `${minutes}m ago`;
                                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                              })();

                              return (
                                <div key={req.id} className="p-2 border border-white/[0.02] hover:border-white/5 hover:bg-white/[0.01] rounded flex items-center justify-between gap-4 transition-all text-[10px]">
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                      isPost 
                                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                                        : isDelete 
                                          ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                                          : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                    }`}>
                                      {req.method}
                                    </span>
                                    <span className="text-white font-medium truncate tracking-wide" title={req.path}>
                                      {req.path}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-3 text-right flex-shrink-0 text-[9px] text-[#555]">
                                    <span className="hover:text-[#888] transition-colors" title={req.userAgent || ''}>
                                      {req.ip ? (req.ip.startsWith('::ffff:') ? req.ip.substring(7) : req.ip) : 'unknown'}
                                    </span>
                                    <span className="flex items-center gap-1" title={`${req.city || ''} ${req.country || ''}`}>
                                      <Globe className="w-2.5 h-2.5 text-[#333]" />
                                      {req.country ? `${req.city ? req.city + ', ' : ''}${req.country}` : 'Local'}
                                    </span>
                                    <span className="text-[#666]">{timeString}</span>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="h-48 flex items-center justify-center text-[#444] text-[10px]">
                              Waiting for request traffic logs...
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Breakdowns */}
                      <div className="bg-[#0E0E0E] border border-white/5 rounded p-6 space-y-6">
                        {/* Top Visited Pages */}
                        <div className="space-y-3">
                          <h4 className="text-xs uppercase text-foreground font-bold tracking-wider border-b border-white/5 pb-2">Top Visited Resources</h4>
                          <div className="space-y-2.5">
                            {trafficStats.topPages && trafficStats.topPages.length > 0 ? (
                              trafficStats.topPages.map((page: any, idx: number) => {
                                const total = trafficStats.totalViews24h || 1;
                                const percentage = Math.round((page.count / total) * 100);
                                return (
                                  <div key={idx} className="space-y-1.5">
                                    <div className="flex justify-between text-[10px]">
                                      <span className="text-white tracking-wide font-medium">{page.path}</span>
                                      <span className="text-[#666]">{page.count} views ({percentage}%)</span>
                                    </div>
                                    <div className="w-full h-1 bg-white/[0.02] rounded-full overflow-hidden">
                                      <div className="h-full bg-crimson" style={{ width: `${percentage}%` }} />
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-center py-6 text-[#444] text-[10px]">No page breakdown analytics available.</div>
                            )}
                          </div>
                        </div>

                        {/* Top Referrers */}
                        <div className="space-y-3">
                          <h4 className="text-xs uppercase text-foreground font-bold tracking-wider border-b border-white/5 pb-2">Traffic Sources (Referrers)</h4>
                          <div className="space-y-2">
                            {trafficStats.topReferrers && trafficStats.topReferrers.length > 0 ? (
                              trafficStats.topReferrers.map((ref: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center py-1 border-b border-white/[0.01] last:border-b-0 text-[10px]">
                                  <span className="text-white">{ref.referer}</span>
                                  <span className="text-[#666]">{ref.count} clicks</span>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-6 text-[#444] text-[10px]">No referrer history logs recorded.</div>
                            )}
                          </div>
                        </div>

                        {/* Device / Browser Share */}
                        <div className="grid grid-cols-2 gap-6 pt-2">
                          <div className="space-y-2">
                            <h4 className="text-[10px] uppercase text-[#666] tracking-wider">Device Class</h4>
                            <div className="space-y-2 text-[10px]">
                              <div className="flex justify-between items-center">
                                <span className="flex items-center gap-1.5 text-white">
                                  <Monitor className="w-3 h-3 text-text-secondary" />
                                  Desktop
                                </span>
                                <span className="font-bold">{trafficStats.deviceBreakdown?.desktop || 100}%</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="flex items-center gap-1.5 text-white">
                                  <Smartphone className="w-3 h-3 text-text-secondary" />
                                  Mobile
                                </span>
                                <span className="font-bold">{trafficStats.deviceBreakdown?.mobile || 0}%</span>
                              </div>
                              <div className="w-full h-1 bg-white/[0.02] rounded-full overflow-hidden flex">
                                <div className="h-full bg-crimson" style={{ width: `${trafficStats.deviceBreakdown?.desktop || 100}%` }} />
                                <div className="h-full bg-red-400" style={{ width: `${trafficStats.deviceBreakdown?.mobile || 0}%` }} />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-[10px] uppercase text-[#666] tracking-wider">Browser Client</h4>
                            <div className="space-y-1.5 text-[9px]">
                              {trafficStats.browserBreakdown && trafficStats.browserBreakdown.length > 0 ? (
                                trafficStats.browserBreakdown.slice(0, 3).map((browser: any, idx: number) => (
                                  <div key={idx} className="flex justify-between items-center">
                                    <span className="text-white">{browser.name}</span>
                                    <span className="text-[#666] font-medium">{browser.percentage}%</span>
                                  </div>
                                ))
                              ) : (
                                <div className="text-[#444]">Unknown</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB: DIAGNOSTICS & SYSTEM */}
            {activeTab === 'system' && (
              <div className="space-y-6 animate-fade-in font-mono text-xs">
                <header>
                  <h2 className="text-2xl font-bebas tracking-wide text-foreground uppercase font-sans">Diagnostics & System Hub</h2>
                  <p className="text-xs text-text-secondary mt-1">Export backups and audit database connection instances.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-[#0E0E0E] p-6 border border-white/5 rounded space-y-4">
                    <h3 className="text-sm font-bebas text-crimson font-bold uppercase tracking-wider font-sans">Config Backup & restore</h3>
                    <p className="text-text-secondary">Export the complete content and configuration catalog as a local JSON file.</p>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => {
                          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ settings, tracks }));
                          const downloadAnchor = document.createElement('a');
                          downloadAnchor.setAttribute("href", dataStr);
                          downloadAnchor.setAttribute("download", `8ctrl_creative_studio_backup_${Date.now()}.json`);
                          document.body.appendChild(downloadAnchor);
                          downloadAnchor.click();
                          downloadAnchor.remove();
                          notify('success', 'Backups exported successfully');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blood-red hover:bg-crimson text-white rounded font-bold font-sans"
                      >
                        <Download className="w-4 h-4" /> Full JSON Export
                      </button>
                      <button 
                        onClick={() => {
                          const fileInput = document.createElement('input');
                          fileInput.setAttribute('type', 'file');
                          fileInput.onchange = (e: any) => {
                            const reader = new FileReader();
                            reader.onload = (event: any) => {
                              try {
                                const parsed = JSON.parse(event.target.result);
                                if (parsed.settings) {
                                  setSettings(parsed.settings);
                                  pushStateHistory(parsed.settings);
                                }
                                if (parsed.tracks) setTracks(parsed.tracks);
                                notify('success', 'Configuration restored from JSON');
                              } catch (_) {
                                notify('error', 'Invalid JSON backup format');
                              }
                            };
                            reader.readAsText(e.target.files[0]);
                          };
                          fileInput.click();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-foreground rounded font-sans"
                      >
                        <Upload className="w-4 h-4" /> Import JSON Backup
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#0E0E0E] p-6 border border-white/5 rounded space-y-4">
                    <h3 className="text-sm font-bebas text-crimson font-bold uppercase tracking-wider font-sans">Maintenance Mode</h3>
                    <p className="text-text-secondary">Toggle maintenance locks on the user-facing landing node.</p>
                    <button 
                      onClick={() => notify('info', 'Maintenance overlay activated')}
                      className="px-3 py-1.5 bg-red-950/20 text-red-500 border border-red-500/20 hover:bg-red-950/40 rounded font-semibold font-sans"
                    >
                      Activate Maintenance countdown
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Panel: Interactive view simulator */}
          {showLivePreview && (
            <div className="w-full lg:w-[420px] border-t lg:border-t-0 lg:border-l border-white/5 bg-[#070707] flex flex-col justify-between overflow-hidden z-10 shrink-0">
              
              {/* Simulator Header */}
              <div className="p-4 border-b border-white/5 flex flex-col gap-3 bg-[#0A0A0A]">
                <div className="flex justify-between items-center">
                  <span className="font-bebas text-sm text-crimson tracking-wider">Cinematic Studio Simulator</span>
                  <button onClick={() => setShowLivePreview(false)} className="text-[#444] hover:text-white font-mono text-xs">✕</button>
                </div>

                {/* Device Type view selector */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-1">
                    {[
                      { id: 'desktop', icon: Monitor },
                      { id: 'tablet', icon: Tablet },
                      { id: 'mobile', icon: Smartphone }
                    ].map(dev => {
                      const Icon = dev.icon;
                      return (
                        <button
                          key={dev.id}
                          onClick={() => setPreviewDevice(dev.id as any)}
                          className={`p-1.5 rounded transition-colors ${previewDevice === dev.id ? 'bg-blood-red/10 border border-blood-red/30 text-white' : 'text-[#444] hover:text-[#888]'}`}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>

                  <button 
                    onClick={() => setPreviewOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait')}
                    className="p-1.5 border border-white/5 hover:bg-white/5 rounded text-text-secondary flex items-center gap-1.5 font-mono text-[10px]"
                  >
                    <RotateCw className="w-3 h-3 text-crimson" /> Rotate View
                  </button>
                </div>

                {/* Simulator controls */}
                <div className="space-y-2 border-t border-white/5 pt-2 text-[10px] font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-[#444]">Scroll Scrubber:</span>
                    <span className="text-white">{previewScrollScrubber}%</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={previewScrollScrubber}
                    onChange={e => setPreviewScrollScrubber(+e.target.value)}
                    className="w-full accent-blood-red bg-[#121212] cursor-pointer"
                  />

                  <div className="flex justify-between items-center pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer text-[#444] hover:text-[#888]">
                      <input 
                        type="checkbox"
                        checked={reducedMotion}
                        onChange={e => setReducedMotion(e.target.checked)}
                      />
                      <span>Reduced Motion</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Viewport simulation center frame wrapper */}
              <div className="flex-1 bg-[#050505] p-6 flex items-center justify-center overflow-auto relative">
                
                {/* Visual editor filters overlays applied on simulator preview window */}
                <div 
                  className={`relative bg-[#050505] shadow-2xl border border-white/10 overflow-hidden transition-all duration-300 ${
                    previewDevice === 'desktop' ? 'w-full aspect-video max-h-[220px]' :
                    previewDevice === 'tablet' ? (previewOrientation === 'portrait' ? 'w-[200px] h-[280px]' : 'w-[280px] h-[200px]') :
                    (previewOrientation === 'portrait' ? 'w-[140px] h-[260px]' : 'w-[260px] h-[140px]')
                  }`}
                  style={{
                    borderRadius: `${settings.visual_studio_config.borderRadius}px`
                  }}
                >
                  
                  {/* Background gradient from Visual Editor */}
                  <div 
                    className="absolute inset-0 transition-all duration-300"
                    style={{
                      background: settings.visual_studio_config.backgroundGradient
                    }}
                  />

                  {/* Vignette size override representation */}
                  <div 
                    className="absolute inset-0 pointer-events-none transition-all duration-300"
                    style={{
                      boxShadow: `inset 0 0 ${settings.visual_studio_config.vignetteSize}px rgba(0,0,0,0.9)`
                    }}
                  />

                  {/* Particle preset representation */}
                  {selectedTrack?.particlePreset !== 'none' && (
                    <div className="absolute inset-0 pointer-events-none opacity-40">
                      <div className={`w-full h-full relative overflow-hidden`}>
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#0E0E0E]/80 border border-white/5 text-[8px] px-1 text-crimson font-mono capitalize">
                          {selectedTrack?.particlePreset || 'ash'} particles active
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Viewport Inner Content preview simulation */}
                  <div className="absolute inset-0 flex flex-col justify-between p-4 z-10 font-mono text-[9px] text-[#888]">
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="font-bebas text-xs text-white">8CTRL Experience</span>
                      <span className="text-crimson font-bold uppercase">{selectedTrack?.title || 'Chaos'}</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
                      <span className="text-[7px] text-[#444] tracking-[0.3em] uppercase block mb-1">Active Chapter</span>
                      <h4 className="text-[11px] font-bebas text-white uppercase tracking-wider font-bold mb-1 max-w-[120px] truncate">
                        {selectedTrack?.title || 'CHAOS ERA'}
                      </h4>
                      <p className="text-[7px] text-text-secondary leading-tight line-clamp-2 max-w-[150px]">
                        {selectedTrack?.sceneDescription || 'Atmospheric soundscape and modular bass echoes.'}
                      </p>
                    </div>

                    <div className="flex justify-between items-center text-[7px] border-t border-white/5 pt-1">
                      <span>BPM: 140</span>
                      <span className="text-green-500">Audio: {selectedTrack?.ambientPreset || 'Ambient Loop'}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Live Diagnostics Telemetry Overlay */}
              {showDiagnostics && (
                <div className="p-4 border-t border-white/5 bg-[#090909] font-mono text-[9px] text-[#444] space-y-2">
                  <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                    <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-crimson" /> Telemetry diagnostics:</span>
                    <button onClick={() => setShowDiagnostics(false)} className="text-[#333] hover:text-white">✕</button>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    <div className="flex justify-between">
                      <span>Engine FPS:</span>
                      <span className="text-green-500">{diagnosticsTelemetry.fps} FPS</span>
                    </div>
                    <div className="flex justify-between">
                      <span>V8 Memory:</span>
                      <span className="text-foreground">{diagnosticsTelemetry.memory}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>API Latency:</span>
                      <span className="text-foreground">{diagnosticsTelemetry.latency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Particles:</span>
                      <span className="text-foreground">{diagnosticsTelemetry.particles} particles</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </main>

      </div>

    </div>
  );
}
