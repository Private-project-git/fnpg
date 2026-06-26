// src/lib/mappers/config.mapper.ts
import { 
  AppConfig as DbAppConfig, 
  Scene as DbScene, 
  GalleryItem as DbGalleryItem, 
  TimelineEvent as DbTimelineEvent, 
  Quote as DbQuote 
} from '@prisma/client';
import { 
  AppSettings, 
  Scene as DomainScene, 
  GalleryItem as DomainGalleryItem, 
  TimelineEvent as DomainTimelineEvent, 
  Quote as DomainQuote 
} from '@/types/domain';

export class ConfigMapper {
  static toDomain(
    dbConfig: DbAppConfig | null,
    dbScenes: DbScene[],
    dbGallery: DbGalleryItem[],
    dbEvents: DbTimelineEvent[],
    dbQuotes: DbQuote[]
  ): AppSettings {
    const cfg = dbConfig || {
      id: 'default',
      artistName: '8CTRL',
      artistRealName: 'Ankur',
      heroText: 'BLOOD RED CINEMATIC',
      biography: '',
      location: '',
      genres: '[]',
      homepageIntro: '',
      primaryBackground: '#050505',
      surface: '#0E0E0E',
      elevatedSurface: '#181818',
      bloodRed: '#8B0000',
      crimsonAccent: '#C1121F',
      highlightRed: '#E63946',
      borderRadius: 4,
      glassBlur: 12,
      componentSpacing: 32,
      animationSpeed: 1.0,
      filmGrainOpacity: 6,
      vignetteSize: 150,
      defaultVolume: 0.8,
      fadeDurationSec: 1.5,
      glitchSfxEnabled: true,
      glitchOscType: 'sawtooth',
      glitchStartFreq: 900,
      glitchEndFreq: 80,
      seoTitle: '8CTRL // Cinematic Fan Experience',
      seoDescription: '',
      seoKeywords: '[]',
      ogImage: '',
      twitterCard: 'summary_large_image',
      instagramUrl: '',
      youtubeUrl: '',
      twitterUrl: '',
      spotifyUrl: '',
      appleMusicUrl: '',
      homepageSections: '[]',
    };

    let genres: string[] = [];
    try { genres = JSON.parse(cfg.genres); } catch (_) {}

    let keywords: string[] = [];
    try { keywords = JSON.parse(cfg.seoKeywords); } catch (_) {}

    let sections: any[] = [];
    try { sections = JSON.parse(cfg.homepageSections); } catch (_) {}

    const artist_profile = {
      name: cfg.artistName,
      realName: cfg.artistRealName,
      heroText: cfg.heroText,
      biography: cfg.biography,
      location: cfg.location,
      genres,
      homepageIntro: cfg.homepageIntro,
      socialLinks: {
        instagram: cfg.instagramUrl || '',
        youtube: cfg.youtubeUrl || '',
        twitter: cfg.twitterUrl || '',
      },
      streamingLinks: {
        spotify: cfg.spotifyUrl || '',
        appleMusic: cfg.appleMusicUrl || '',
      },
      brandColors: {
        primaryBackground: cfg.primaryBackground,
        surface: cfg.surface,
        elevatedSurface: cfg.elevatedSurface,
        bloodRed: cfg.bloodRed,
        crimsonAccent: cfg.crimsonAccent,
        highlightRed: cfg.highlightRed,
      }
    };

    const seo_config = {
      title: cfg.seoTitle,
      description: cfg.seoDescription,
      keywords,
      ogImage: cfg.ogImage,
      twitterCard: cfg.twitterCard as any,
    };

    const homepage_layout = {
      sections,
    };

    const visual_studio_config = {
      primaryBackground: cfg.primaryBackground,
      surface: cfg.surface,
      elevatedSurface: cfg.elevatedSurface,
      bloodRed: cfg.bloodRed,
      crimsonAccent: cfg.crimsonAccent,
      highlightRed: cfg.highlightRed,
      borderRadius: cfg.borderRadius,
      glassBlur: cfg.glassBlur,
      componentSpacing: cfg.componentSpacing,
      animationSpeed: cfg.animationSpeed,
      filmGrainOpacity: cfg.filmGrainOpacity,
      vignetteSize: cfg.vignetteSize,
      backgroundGradient: `radial-gradient(circle at 50% 50%, ${cfg.bloodRed}26 0%, ${cfg.primaryBackground} 85%)`,
      noiseIntensity: 15,
      shadowBlur: 20,
      glowIntensity: 25,
      blurRadius: 10,
      glassOpacity: 10,
    };

    const scenes_config: DomainScene[] = dbScenes.map(s => ({
      id: s.id,
      name: s.name,
      enabled: s.enabled,
      order: s.displayOrder,
      transitionPreset: s.transitionPreset as any,
      duration: s.duration,
      backgroundMode: s.backgroundMode as any,
      accentColor: s.accentColor,
      particlePreset: s.particlePreset as any,
      lightingPreset: s.lightingPreset as any,
      typographyPreset: s.typographyPreset || undefined,
      ambientPreset: s.ambientPreset || undefined,
      scrollSpeed: s.scrollSpeed || undefined,
      overlayEffects: s.overlayEffects || undefined,
      blurIntensity: s.blurIntensity || undefined,
      grainIntensity: s.grainIntensity || undefined,
      lightingIntensity: s.lightingIntensity || undefined,
      accentColors: s.accentColors || undefined,
    }));

    const gallery_config: DomainGalleryItem[] = dbGallery.map(item => {
      let tags: string[] = [];
      try { tags = JSON.parse(item.tags); } catch (_) {}
      return {
        id: item.id,
        url: item.url,
        caption: item.caption,
        category: item.category,
        tags,
        displayOrder: item.displayOrder,
        title: item.title || undefined,
        photographer: item.photographer || undefined,
        credits: item.credits || undefined,
        altText: item.altText || undefined,
        featured: item.featured,
      };
    });

    const platforms_config = {
      spotify: cfg.spotifyUrl || '',
      appleMusic: cfg.appleMusicUrl || '',
      youtube: cfg.youtubeUrl || '',
      instagram: cfg.instagramUrl || '',
      soundcloud: '',
      email: 'booking@8ctrl.com',
      booking: 'management@8ctrl.com',
      customLinks: [],
    };

    const user_permissions_config = {
      users: [
        { username: 'ankur', role: 'Administrator' },
      ]
    };

    const timeline_events: DomainTimelineEvent[] = dbEvents.map(ev => ({
      id: ev.id,
      year: ev.year,
      title: ev.title,
      description: ev.description,
      desc: ev.description,
    }));

    const verified_quotes: DomainQuote[] = dbQuotes.map(q => ({
      id: q.id,
      text: q.text,
      author: q.author,
      source: q.source,
      status: q.status as any,
    }));

    return {
      artist_profile,
      seo_config,
      homepage_layout,
      visual_studio_config,
      scenes_config,
      gallery_config,
      platforms_config,
      user_permissions_config,
      timeline_events,
      verified_quotes,
    };
  }

  static toDbAppConfig(domainSettings: any, existingId?: string): Partial<DbAppConfig> {
    const profile = domainSettings.artist_profile || {};
    const seo = domainSettings.seo_config || {};
    const layout = domainSettings.homepage_layout || {};
    const visual = domainSettings.visual_studio_config || {};
    const platforms = domainSettings.platforms_config || {};

    const dbData: any = {
      artistName: profile.name || '8CTRL',
      artistRealName: profile.realName || 'Ankur',
      heroText: profile.heroText || 'BLOOD RED CINEMATIC',
      biography: profile.biography || '',
      location: profile.location || '',
      genres: JSON.stringify(profile.genres || []),
      homepageIntro: profile.homepageIntro || '',

      // Theme
      primaryBackground: profile.brandColors?.primaryBackground || visual.primaryBackground || '#050505',
      surface: profile.brandColors?.surface || visual.surface || '#0E0E0E',
      elevatedSurface: profile.brandColors?.elevatedSurface || visual.elevatedSurface || '#181818',
      bloodRed: profile.brandColors?.bloodRed || visual.bloodRed || '#8B0000',
      crimsonAccent: profile.brandColors?.crimsonAccent || visual.crimsonAccent || '#C1121F',
      highlightRed: profile.brandColors?.highlightRed || visual.highlightRed || '#E63946',
      borderRadius: typeof visual.borderRadius === 'number' ? visual.borderRadius : 4,
      glassBlur: typeof visual.glassBlur === 'number' ? visual.glassBlur : 12,
      componentSpacing: typeof visual.componentSpacing === 'number' ? visual.componentSpacing : 32,
      animationSpeed: typeof visual.animationSpeed === 'number' ? visual.animationSpeed : 1.0,
      filmGrainOpacity: typeof visual.filmGrainOpacity === 'number' ? visual.filmGrainOpacity : 6,
      vignetteSize: typeof visual.vignetteSize === 'number' ? visual.vignetteSize : 150,

      // SEO
      seoTitle: seo.title || '8CTRL // Cinematic Fan Experience',
      seoDescription: seo.description || '',
      seoKeywords: JSON.stringify(seo.keywords || []),
      ogImage: seo.ogImage || '',
      twitterCard: seo.twitterCard || 'summary_large_image',

      // Platforms
      instagramUrl: profile.socialLinks?.instagram || platforms.instagram || '',
      youtubeUrl: profile.socialLinks?.youtube || platforms.youtube || '',
      twitterUrl: profile.socialLinks?.twitter || platforms.twitter || '',
      spotifyUrl: profile.streamingLinks?.spotify || platforms.spotify || '',
      appleMusicUrl: profile.streamingLinks?.appleMusic || platforms.appleMusic || '',

      // Homepage sections
      homepageSections: JSON.stringify(layout.sections || []),
    };

    if (existingId) {
      dbData.id = existingId;
    }

    return dbData;
  }

  static toDbScene(domainScene: any, idx: number): DbScene {
    return {
      id: domainScene.id || `scene-${idx}`,
      name: domainScene.name || 'Unnamed Scene',
      enabled: domainScene.enabled !== false,
      displayOrder: typeof domainScene.order === 'number' ? domainScene.order : (domainScene.displayOrder || idx + 1),
      transitionPreset: domainScene.transitionPreset || 'fade',
      duration: typeof domainScene.duration === 'number' ? domainScene.duration : 1.5,
      backgroundMode: domainScene.backgroundMode || 'solid',
      accentColor: domainScene.accentColor || domainScene.accentColors || '#C1121F',
      particlePreset: domainScene.particlePreset || 'none',
      lightingPreset: domainScene.lightingPreset || 'none',
      typographyPreset: domainScene.typographyPreset || null,
      ambientPreset: domainScene.ambientPreset || null,
      scrollSpeed: typeof domainScene.scrollSpeed === 'number' ? domainScene.scrollSpeed : null,
      overlayEffects: domainScene.overlayEffects || null,
      blurIntensity: typeof domainScene.blurIntensity === 'number' ? domainScene.blurIntensity : null,
      grainIntensity: typeof domainScene.grainIntensity === 'number' ? domainScene.grainIntensity : null,
      lightingIntensity: typeof domainScene.lightingIntensity === 'number' ? domainScene.lightingIntensity : null,
      accentColors: domainScene.accentColors || null,
      updatedAt: new Date(),
    };
  }

  static toDbGalleryItem(domainItem: any, idx: number): DbGalleryItem {
    return {
      id: String(domainItem.id || `img-${idx}`),
      url: domainItem.url || '',
      caption: domainItem.caption || '',
      category: domainItem.category || 'live',
      tags: JSON.stringify(domainItem.tags || []),
      displayOrder: typeof domainItem.displayOrder === 'number' ? domainItem.displayOrder : idx + 1,
      title: domainItem.title || null,
      photographer: domainItem.photographer || null,
      credits: domainItem.credits || null,
      altText: domainItem.altText || null,
      featured: domainItem.featured === true,
      updatedAt: new Date(),
    };
  }

  static toDbTimelineEvent(domainEv: any, idx: number): DbTimelineEvent {
    return {
      id: String(domainEv.id || `ev-${idx}`),
      year: domainEv.year || '',
      title: domainEv.title || '',
      description: domainEv.description || domainEv.desc || '',
      displayOrder: typeof domainEv.displayOrder === 'number' ? domainEv.displayOrder : idx + 1,
      updatedAt: new Date(),
    };
  }

  static toDbQuote(domainQ: any, idx: number): DbQuote {
    return {
      id: String(domainQ.id || `q-${idx}`),
      text: domainQ.text || '',
      author: domainQ.author || 'Unknown',
      source: domainQ.source || '',
      status: domainQ.status || 'published',
      displayOrder: typeof domainQ.displayOrder === 'number' ? domainQ.displayOrder : idx + 1,
      updatedAt: new Date(),
    };
  }
}
