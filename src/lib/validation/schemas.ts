// src/lib/validation/schemas.ts
import { z } from 'zod';

export const ArtistSchema = z.object({
  name: z.string().default('8CTRL'),
  realName: z.string().default('Ankur'),
  heroText: z.string().default('BLOOD RED CINEMATIC'),
  biography: z.string().default(''),
  location: z.string().default(''),
  genres: z.array(z.string()).default([]),
  homepageIntro: z.string().default(''),
});

export const ThemeConfigSchema = z.object({
  primaryBackground: z.string().default('#050505'),
  surface: z.string().default('#0E0E0E'),
  elevatedSurface: z.string().default('#181818'),
  bloodRed: z.string().default('#8B0000'),
  crimsonAccent: z.string().default('#C1121F'),
  highlightRed: z.string().default('#E63946'),
  borderRadius: z.number().default(4),
  glassBlur: z.number().default(12),
  componentSpacing: z.number().default(32),
  animationSpeed: z.number().default(1.0),
  filmGrainOpacity: z.number().default(6),
  vignetteSize: z.number().default(150),
  backgroundGradient: z.string().optional(),
  noiseIntensity: z.number().optional(),
  shadowBlur: z.number().optional(),
  glowIntensity: z.number().optional(),
  blurRadius: z.number().optional(),
  glassOpacity: z.number().optional(),
});

export const SceneSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(val => String(val)),
  name: z.string().default('Unnamed Scene'),
  enabled: z.boolean().default(true),
  order: z.number().default(0),
  transitionPreset: z.enum(['fade', 'slide', 'blurReveal', 'scaleReveal', 'maskReveal']).default('fade'),
  duration: z.number().default(1.5),
  backgroundMode: z.enum(['solid', 'gradient', 'particles', 'video', 'radial']).default('solid'),
  accentColor: z.string().default('#C1121F'),
  particlePreset: z.enum(['ash', 'smoke', 'spark', 'dust', 'noise', 'none']).default('none'),
  lightingPreset: z.enum(['soft', 'harsh', 'spotlight', 'none']).default('none'),
  typographyPreset: z.string().optional().nullable(),
  ambientPreset: z.string().optional().nullable(),
  scrollSpeed: z.number().optional().nullable(),
  overlayEffects: z.string().optional().nullable(),
  blurIntensity: z.number().optional().nullable(),
  grainIntensity: z.number().optional().nullable(),
  lightingIntensity: z.number().optional().nullable(),
  accentColors: z.string().optional().nullable(),
});

export const GalleryItemSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(val => String(val)),
  url: z.string(),
  caption: z.string().default(''),
  category: z.string().default('live'),
  tags: z.array(z.string()).default([]),
  displayOrder: z.number().default(0),
  title: z.string().optional().nullable(),
  photographer: z.string().optional().nullable(),
  credits: z.string().optional().nullable(),
  altText: z.string().optional().nullable(),
  featured: z.boolean().default(false),
});

export const PlatformsConfigSchema = z.object({
  instagram: z.string().optional().nullable(),
  youtube: z.string().optional().nullable(),
  twitter: z.string().optional().nullable(),
  spotify: z.string().optional().nullable(),
  appleMusic: z.string().optional().nullable(),
  soundcloud: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  booking: z.string().optional().nullable(),
  customLinks: z.array(z.object({
    label: z.string(),
    url: z.string(),
    validated: z.boolean().default(true),
  })).optional().default([]),
});

export const AudioConfigSchema = z.object({
  defaultVolume: z.number().default(0.8),
  fadeDurationSec: z.number().default(1.5),
  glitchSfxEnabled: z.boolean().default(true),
  glitchOscType: z.enum(['sine', 'square', 'sawtooth', 'triangle']).default('sawtooth'),
  glitchStartFreq: z.number().default(900),
  glitchEndFreq: z.number().default(80),
});

export const SEOConfigSchema = z.object({
  title: z.string().default('8CTRL // Cinematic Fan Experience'),
  description: z.string().default(''),
  keywords: z.array(z.string()).default([]),
  ogImage: z.string().default(''),
  twitterCard: z.enum(['summary', 'summary_large_image']).default('summary_large_image'),
  canonical: z.string().optional().nullable(),
  robots: z.string().optional().nullable(),
});

export const AnalyticsConfigSchema = z.object({
  googleAnalyticsId: z.string().optional().nullable(),
  customMetricsEnabled: z.boolean().default(true),
  trackFps: z.boolean().default(true),
  trackApiLatency: z.boolean().default(true),
});

export const UserRoleItemSchema = z.object({
  username: z.string(),
  role: z.string(),
  permissions: z.array(z.string()).optional().default([]),
  loginHistory: z.string().optional().nullable(),
});

export const UsersConfigSchema = z.object({
  users: z.array(UserRoleItemSchema).default([]),
});

export const HomepageSectionSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(val => String(val)),
  enabled: z.boolean(),
  name: z.string(),
  spacing: z.string().optional().nullable(),
  backgroundOverride: z.string().optional().nullable(),
  themeOverride: z.string().optional().nullable(),
});

export const HomepageConfigSchema = z.object({
  sections: z.array(HomepageSectionSchema),
});

export const TimelineEventSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  year: z.union([z.string(), z.number()]).transform(val => String(val)),
  title: z.string(),
  description: z.string().optional(),
  desc: z.string().optional(), // Support backward compatibility in CMS inputs
  displayOrder: z.number().optional().default(0),
});

export const QuoteSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  text: z.string(),
  author: z.string(),
  source: z.string().default(''),
  status: z.enum(['published', 'draft', 'hidden']).default('published'),
  displayOrder: z.number().optional().default(0),
});

export const TrackSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  title: z.string(),
  artist: z.string().default('8CTRL'),
  album: z.string().default(''),
  coverUrl: z.string().optional().nullable(),
  previewUrl: z.string().optional().nullable(),
  spotifyUrl: z.string().optional().nullable(),
  appleUrl: z.string().optional().nullable(),
  youtubeUrl: z.string().optional().nullable(),
  genre: z.string().default('Electronic'),
  duration: z.number().default(30),
  isFeatured: z.boolean().default(false),
  isArtistFav: z.boolean().default(false),
  isFanFav: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  isRecommended: z.boolean().default(false),
  isLatest: z.boolean().default(false),
  accentColor: z.string().optional().nullable(),
  backgroundGradient: z.string().optional().nullable(),
  particlePreset: z.enum(['dust', 'ash', 'smoke', 'light', 'rain', 'noise', 'spark', 'none']).default('none'),
  lightingPreset: z.enum(['soft', 'harsh', 'spotlight', 'none']).default('none'),
  transitionStyle: z.string().default('fade'),
  typographyStyle: z.string().optional().nullable(),
  slug: z.string().optional().nullable(),
  backgroundArtwork: z.string().optional().nullable(),
  lyrics: z.string().optional().nullable(),
  status: z.enum(['published', 'draft', 'hidden']).default('published'),
  displayOrder: z.number().default(0),
  releaseDate: z.string().optional().nullable(),
  producerCredits: z.array(z.string()).optional().default([]),
  writerCredits: z.array(z.string()).optional().default([]),
});

export const ReleaseSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  title: z.string(),
  description: z.string().optional().nullable(),
  releaseYear: z.number(),
  coverUrl: z.string().optional().nullable(),
  spotifyUrl: z.string().optional().nullable(),
  appleUrl: z.string().optional().nullable(),
  youtubeUrl: z.string().optional().nullable(),
  type: z.string().default('album'),
  isFeatured: z.boolean().default(false),
});

/**
 * Validates the full AppSettings payload from the CMS frontend
 */
export const AppSettingsSchema = z.object({
  artist_profile: z.object({
    name: z.string().default('8CTRL'),
    realName: z.string().default('Ankur'),
    heroText: z.string().default('BLOOD RED CINEMATIC'),
    biography: z.string().default(''),
    location: z.string().default(''),
    genres: z.array(z.string()).default([]),
    homepageIntro: z.string().default(''),
    socialLinks: z.object({
      instagram: z.string().optional().nullable(),
      youtube: z.string().optional().nullable(),
      twitter: z.string().optional().nullable(),
    }).default({}),
    streamingLinks: z.object({
      spotify: z.string().optional().nullable(),
      appleMusic: z.string().optional().nullable(),
    }).default({}),
    brandColors: z.object({
      primaryBackground: z.string().default('#050505'),
      surface: z.string().default('#0E0E0E'),
      elevatedSurface: z.string().default('#181818'),
      bloodRed: z.string().default('#8B0000'),
      crimsonAccent: z.string().default('#C1121F'),
      highlightRed: z.string().default('#E63946'),
    }).default({
      primaryBackground: '#050505',
      surface: '#0E0E0E',
      elevatedSurface: '#181818',
      bloodRed: '#8B0000',
      crimsonAccent: '#C1121F',
      highlightRed: '#E63946',
    }),
  }),
  seo_config: SEOConfigSchema,
  homepage_layout: HomepageConfigSchema,
  visual_studio_config: z.object({
    primaryBackground: z.string().default('#050505'),
    surface: z.string().default('#0E0E0E'),
    elevatedSurface: z.string().default('#181818'),
    bloodRed: z.string().default('#8B0000'),
    crimsonAccent: z.string().default('#C1121F'),
    highlightRed: z.string().default('#E63946'),
    borderRadius: z.number().default(4),
    glassBlur: z.number().default(12),
    componentSpacing: z.number().default(32),
    animationSpeed: z.number().default(1.0),
    filmGrainOpacity: z.number().default(6),
    vignetteSize: z.number().default(150),
    backgroundGradient: z.string().optional(),
    noiseIntensity: z.number().optional(),
    shadowBlur: z.number().optional(),
    glowIntensity: z.number().optional(),
    blurRadius: z.number().optional(),
    glassOpacity: z.number().optional(),
  }),
  scenes_config: z.array(SceneSchema).default([]),
  gallery_config: z.array(GalleryItemSchema).default([]),
  platforms_config: PlatformsConfigSchema.optional().default({ customLinks: [] }),
  user_permissions_config: UsersConfigSchema.optional().default({ users: [] }),
  timeline_events: z.array(TimelineEventSchema).default([]),
  verified_quotes: z.array(QuoteSchema).default([]),
});
