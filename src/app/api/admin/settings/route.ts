// src/app/api/admin/settings/route.ts
import { apiSuccess, apiError } from '@/lib/apiResponse';
import { 
  ArtistSchema, 
  ThemeConfigSchema, 
  SEOConfigSchema, 
  PlatformsConfigSchema, 
  HomepageConfigSchema,
  SceneSchema,
  GalleryItemSchema,
  TimelineEventSchema,
  QuoteSchema
} from '@/lib/validation';
import { ConfigRepository } from '@/lib/repositories/config.repository';
import { SceneRepository } from '@/lib/repositories/scene.repository';
import { GalleryRepository } from '@/lib/repositories/gallery.repository';
import { TimelineRepository } from '@/lib/repositories/timeline.repository';
import { QuoteRepository } from '@/lib/repositories/quote.repository';
import { ConfigMapper } from '@/lib/mappers/config.mapper';
import { ContentProvider } from '@/lib/contentProvider';

export async function GET() {
  try {
    const settings = await ContentProvider.getSettings();
    return apiSuccess(settings, 'Settings retrieved successfully');
  } catch (error: any) {
    console.error('Database error while fetching settings:', error);
    return apiError('Failed to query settings', error?.message || String(error), 500);
  }
}

// Handler helper to save a single key-value setting to the new schema
async function saveSetting(key: string, value: any): Promise<{ success: boolean; error?: string }> {
  let parsed = value;
  if (typeof value === 'string') {
    try { parsed = JSON.parse(value); } catch (_) {}
  }

  // Get or create AppConfig row
  let appConfig = await ConfigRepository.find();
  const configId = appConfig?.id;

  switch (key) {
    case 'config_site':
    case 'artist_profile': {
      const val = ArtistSchema.safeParse(parsed);
      if (!val.success) return { success: false, error: val.error.message };
      const data = {
        artistName: val.data.name,
        artistRealName: val.data.realName,
        heroText: val.data.heroText,
        biography: val.data.biography,
        location: val.data.location,
        genres: JSON.stringify(val.data.genres),
        homepageIntro: val.data.homepageIntro,
        instagramUrl: parsed.socialLinks?.instagram || undefined,
        youtubeUrl: parsed.socialLinks?.youtube || undefined,
        twitterUrl: parsed.socialLinks?.twitter || undefined,
        spotifyUrl: parsed.streamingLinks?.spotify || undefined,
        appleMusicUrl: parsed.streamingLinks?.appleMusic || undefined,
      };
      if (configId) {
        await ConfigRepository.update(configId, data);
      } else {
        await ConfigRepository.create(data);
      }
      return { success: true };
    }

    case 'config_theme':
    case 'visual_studio_config': {
      const val = ThemeConfigSchema.safeParse(parsed);
      if (!val.success) return { success: false, error: val.error.message };
      const data = {
        primaryBackground: val.data.primaryBackground,
        surface: val.data.surface,
        elevatedSurface: val.data.elevatedSurface,
        bloodRed: val.data.bloodRed,
        crimsonAccent: val.data.crimsonAccent,
        highlightRed: val.data.highlightRed,
        borderRadius: val.data.borderRadius,
        glassBlur: val.data.glassBlur,
        componentSpacing: val.data.componentSpacing,
        animationSpeed: val.data.animationSpeed,
        filmGrainOpacity: val.data.filmGrainOpacity,
        vignetteSize: val.data.vignetteSize,
      };
      if (configId) {
        await ConfigRepository.update(configId, data);
      } else {
        await ConfigRepository.create(data);
      }
      return { success: true };
    }

    case 'config_seo':
    case 'seo_config': {
      const val = SEOConfigSchema.safeParse(parsed);
      if (!val.success) return { success: false, error: val.error.message };
      const data = {
        seoTitle: val.data.title,
        seoDescription: val.data.description,
        seoKeywords: JSON.stringify(val.data.keywords),
        ogImage: val.data.ogImage,
        twitterCard: val.data.twitterCard,
      };
      if (configId) {
        await ConfigRepository.update(configId, data);
      } else {
        await ConfigRepository.create(data);
      }
      return { success: true };
    }

    case 'config_platforms':
    case 'platforms_config': {
      const val = PlatformsConfigSchema.safeParse(parsed);
      if (!val.success) return { success: false, error: val.error.message };
      const data = {
        instagramUrl: val.data.instagram || '',
        youtubeUrl: val.data.youtube || '',
        twitterUrl: val.data.twitter || '',
        spotifyUrl: val.data.spotify || '',
        appleMusicUrl: val.data.appleMusic || '',
      };
      if (configId) {
        await ConfigRepository.update(configId, data);
      } else {
        await ConfigRepository.create(data);
      }
      return { success: true };
    }

    case 'config_homepage':
    case 'homepage_layout': {
      const val = HomepageConfigSchema.safeParse(parsed);
      if (!val.success) return { success: false, error: val.error.message };
      const data = {
        homepageSections: JSON.stringify(val.data.sections),
      };
      if (configId) {
        await ConfigRepository.update(configId, data);
      } else {
        await ConfigRepository.create(data);
      }
      return { success: true };
    }

    case 'config_scenes':
    case 'scenes_config': {
      const scenesList = parsed.scenes || parsed;
      if (!Array.isArray(scenesList)) {
        return { success: false, error: 'Scenes value must be an array or contain a scenes array' };
      }
      const dbScenes = [];
      for (const [idx, s] of scenesList.entries()) {
        const val = SceneSchema.safeParse(s);
        if (!val.success) return { success: false, error: `Scene index ${idx} error: ${val.error.message}` };
        dbScenes.push(ConfigMapper.toDbScene(val.data, idx));
      }
      await SceneRepository.saveAll(dbScenes);
      return { success: true };
    }

    case 'config_gallery':
    case 'gallery_config': {
      const itemsList = parsed.items || parsed;
      if (!Array.isArray(itemsList)) {
        return { success: false, error: 'Gallery items must be an array or contain an items array' };
      }
      const dbItems = [];
      for (const [idx, item] of itemsList.entries()) {
        const val = GalleryItemSchema.safeParse(item);
        if (!val.success) return { success: false, error: `Gallery item index ${idx} error: ${val.error.message}` };
        dbItems.push(ConfigMapper.toDbGalleryItem(val.data, idx));
      }
      await GalleryRepository.saveAll(dbItems);
      return { success: true };
    }

    case 'timeline_events': {
      if (!Array.isArray(parsed)) {
        return { success: false, error: 'timeline_events must be an array' };
      }
      const dbEvents = [];
      for (const [idx, ev] of parsed.entries()) {
        const val = TimelineEventSchema.safeParse(ev);
        if (!val.success) return { success: false, error: `Timeline event index ${idx} error: ${val.error.message}` };
        dbEvents.push(ConfigMapper.toDbTimelineEvent(val.data, idx));
      }
      await TimelineRepository.saveAll(dbEvents);
      return { success: true };
    }

    case 'verified_quotes': {
      if (!Array.isArray(parsed)) {
        return { success: false, error: 'verified_quotes must be an array' };
      }
      const dbQuotes = [];
      for (const [idx, q] of parsed.entries()) {
        const val = QuoteSchema.safeParse(q);
        if (!val.success) return { success: false, error: `Quote index ${idx} error: ${val.error.message}` };
        dbQuotes.push(ConfigMapper.toDbQuote(val.data, idx));
      }
      await QuoteRepository.saveAll(dbQuotes);
      return { success: true };
    }

    default:
      console.warn(`Unsupported settings key: ${key}`);
      return { success: true };
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Support bulk update of multiple key-value pairs
    if (data.settings && typeof data.settings === 'object') {
      const entries = Object.entries(data.settings);
      
      // Perform validation pass
      for (const [key, value] of entries) {
        const res = await saveSetting(key, value);
        if (!res.success) {
          return apiError(`Validation failed for key "${key}"`, res.error, 400);
        }
      }
      return apiSuccess({ count: entries.length }, 'Bulk settings updated successfully');
    }
    
    // Support single key-value update
    const { key, value } = data;
    if (!key) {
      return apiError('Missing key parameter', null, 400);
    }
    
    const res = await saveSetting(key, value);
    if (!res.success) {
      return apiError(`Validation failed for key "${key}"`, res.error, 400);
    }
    
    return apiSuccess({ key }, 'Setting updated successfully');
  } catch (error: any) {
    console.error('Error saving settings in API:', error);
    return apiError('Failed to save settings', error?.message || String(error), 500);
  }
}
