// src/types/domain.ts

export interface TrackArtwork {
  url: string;
  blurDataURL?: string;
  fallbackUrl?: string;
}

export interface TrackPreview {
  url: string;
  duration?: number;
}

export interface TrackPlatforms {
  spotifyUrl?: string;
  appleMusicUrl?: string;
  youtubeUrl?: string;
}

export interface TrackTheme {
  featured: boolean;
  artistFavorite: boolean;
  fanFavorite: boolean;
  trending: boolean;
  recommended: boolean;
  latest: boolean;
}

export interface TrackStats {
  plays?: number;
  popularity?: number;
}

export interface TrackVisualIdentity {
  accentColor: string;
  backgroundGradient: string;
  particlePreset: 'dust' | 'ash' | 'smoke' | 'light' | 'rain' | 'noise' | 'spark' | 'none';
  lightingPreset: 'soft' | 'harsh' | 'spotlight' | 'none';
  transitionStyle: string;
  typographyStyle: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  artwork: TrackArtwork;
  preview: TrackPreview;
  releaseDate: string;
  genre: string;
  duration: number; // in seconds
  platforms: TrackPlatforms;
  theme: TrackTheme;
  stats: TrackStats;
  visualIdentity: TrackVisualIdentity;
  slug?: string;
  backgroundArtwork?: string;
  credits?: { producers?: string[]; writers?: string[] };
  lyrics?: string;
  status?: 'published' | 'draft' | 'hidden';
  order?: number;
}

export interface Release {
  id: string;
  title: string;
  description?: string;
  releaseYear: number;
  coverUrl?: string;
  spotifyUrl?: string;
  appleUrl?: string;
  youtubeUrl?: string;
  type: string; // album, single, ep
  isFeatured: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Artist {
  name: string;
  realName: string;
  heroText: string;
  biography: string;
  location: string;
  genres: string[];
  homepageIntro: string;
}

export interface ThemeConfig {
  primaryBackground: string;
  surface: string;
  elevatedSurface: string;
  bloodRed: string;
  crimsonAccent: string;
  highlightRed: string;
  borderRadius: number;
  glassBlur: number;
  componentSpacing: number;
  animationSpeed: number;
  filmGrainOpacity: number;
  vignetteSize: number;
}

export interface Scene {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
  transitionPreset: 'fade' | 'slide' | 'blurReveal' | 'scaleReveal' | 'maskReveal';
  duration: number;
  backgroundMode: 'solid' | 'gradient' | 'particles' | 'video' | 'radial';
  accentColor: string;
  particlePreset: 'ash' | 'smoke' | 'spark' | 'dust' | 'noise' | 'none';
  lightingPreset: 'soft' | 'harsh' | 'spotlight' | 'none';
  // Extra fields that were in the CMS scenes_config (e.g. scene-hero)
  typographyPreset?: string;
  ambientPreset?: string;
  scrollSpeed?: number;
  overlayEffects?: string;
  blurIntensity?: number;
  grainIntensity?: number;
  lightingIntensity?: number;
  accentColors?: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  caption: string;
  category: string;
  tags: string[];
  displayOrder: number;
  
  // Extra fields that were in the CMS gallery_config (e.g. title, photographer, credits, altText, featured)
  title?: string;
  photographer?: string;
  credits?: string;
  altText?: string;
  featured?: boolean;
}

export interface PlatformsConfig {
  instagram?: string;
  youtube?: string;
  twitter?: string;
  spotify?: string;
  appleMusic?: string;
  soundcloud?: string;
  email?: string;
  booking?: string;
  customLinks?: Array<{ label: string; url: string; validated: boolean }>;
}

export interface AudioConfig {
  defaultVolume: number;
  fadeDurationSec: number;
  glitchSfxEnabled: boolean;
  glitchOscType: 'sine' | 'square' | 'sawtooth' | 'triangle';
  glitchStartFreq: number;
  glitchEndFreq: number;
}

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  twitterCard: 'summary' | 'summary_large_image';
  canonical?: string;
  robots?: string;
}

export interface AnalyticsConfig {
  googleAnalyticsId?: string;
  customMetricsEnabled: boolean;
  trackFps: boolean;
  trackApiLatency: boolean;
}

export interface UserRoleItem {
  username: string;
  role: string;
  permissions?: string[];
  loginHistory?: string;
}

export interface UsersConfig {
  users: UserRoleItem[];
}

export interface HomepageSection {
  id: string;
  enabled: boolean;
  name: string;
  spacing?: string;
  backgroundOverride?: string;
  themeOverride?: string;
}

export interface HomepageConfig {
  sections: HomepageSection[];
}

export interface TimelineEvent {
  id?: string;
  year: string;
  title: string;
  description: string;
  desc?: string;
  displayOrder?: number;
}

export interface Quote {
  id?: string;
  text: string;
  author: string;
  source: string;
  status: 'published' | 'draft' | 'hidden';
  displayOrder?: number;
}

/**
 * Consolidated settings interface used by the CMS frontend.
 */
export interface AppSettings {
  artist_profile: Artist & {
    socialLinks: {
      instagram?: string;
      youtube?: string;
      twitter?: string;
    };
    streamingLinks: {
      spotify?: string;
      appleMusic?: string;
    };
    brandColors: {
      primaryBackground: string;
      surface: string;
      elevatedSurface: string;
      bloodRed: string;
      crimsonAccent: string;
      highlightRed: string;
    };
  };
  seo_config: SEOConfig;
  homepage_layout: HomepageConfig;
  visual_studio_config: ThemeConfig & {
    backgroundGradient?: string;
    noiseIntensity?: number;
    shadowBlur?: number;
    glowIntensity?: number;
    blurRadius?: number;
    glassOpacity?: number;
  };
  scenes_config: Scene[];
  gallery_config: GalleryItem[];
  platforms_config: PlatformsConfig;
  user_permissions_config: UsersConfig;
  timeline_events: TimelineEvent[];
  verified_quotes: Quote[];
}
