// src/lib/contentProvider.ts
import { TrackRepository } from '@/lib/repositories/track.repository';
import { ConfigRepository } from '@/lib/repositories/config.repository';
import { SceneRepository } from '@/lib/repositories/scene.repository';
import { GalleryRepository } from '@/lib/repositories/gallery.repository';
import { TimelineRepository } from '@/lib/repositories/timeline.repository';
import { QuoteRepository } from '@/lib/repositories/quote.repository';
import { TrackMapper } from '@/lib/mappers/track.mapper';
import { ConfigMapper } from '@/lib/mappers/config.mapper';
import { FALLBACK_SONGS } from '@/data/tracks';
import { Track, AppSettings } from '@/types/domain';
import prisma from '@/lib/prisma';

export class ContentProvider {
  /**
   * Fetch all tracks. Falls back to static curated tracks.
   */
  static async getTracks(): Promise<Track[]> {
    try {
      const dbTracks = await TrackRepository.findAll();
      if (dbTracks && dbTracks.length > 0) {
        return dbTracks.map(t => TrackMapper.toDomain(t));
      }
    } catch (err) {
      console.warn('ContentProvider: Failed to load tracks from database. Falling back to static JSON.', err);
    }
    return FALLBACK_SONGS;
  }

  /**
   * Fetch all settings. Returns parsed and typed AppSettings structure.
   */
  static async getSettings(): Promise<AppSettings> {
    try {
      const [config, scenes, gallery, events, quotes] = await Promise.all([
        ConfigRepository.find(),
        SceneRepository.findAll(),
        GalleryRepository.findAll(),
        TimelineRepository.findAll(),
        QuoteRepository.findAll(),
      ]);

      return ConfigMapper.toDomain(config, scenes, gallery, events, quotes);
    } catch (err) {
      console.warn('ContentProvider: Failed to load settings from database. Returning default domain config.', err);
      // Fallback to empty/default domain structure
      return ConfigMapper.toDomain(null, [], [], [], []);
    }
  }

  /**
   * Fetch all settings in a raw record format for API backward compatibility.
   * Converts the parsed domain model back to key-value string representation.
   */
  static async getLegacySettings(): Promise<Record<string, string>> {
    const domain = await this.getSettings();
    
    // Construct the legacy keys mapping expected by old components
    const result: Record<string, string> = {
      config_site: JSON.stringify({
        name: domain.artist_profile.name,
        realName: domain.artist_profile.realName,
        heroText: domain.artist_profile.heroText,
        biography: domain.artist_profile.biography,
        location: domain.artist_profile.location,
        genres: domain.artist_profile.genres,
        homepageIntro: domain.artist_profile.homepageIntro,
      }),
      config_homepage: JSON.stringify(domain.homepage_layout),
      config_theme: JSON.stringify({
        primaryBackground: domain.visual_studio_config.primaryBackground,
        surface: domain.visual_studio_config.surface,
        elevatedSurface: domain.visual_studio_config.elevatedSurface,
        bloodRed: domain.visual_studio_config.bloodRed,
        crimsonAccent: domain.visual_studio_config.crimsonAccent,
        highlightRed: domain.visual_studio_config.highlightRed,
        borderRadius: domain.visual_studio_config.borderRadius,
        glassBlur: domain.visual_studio_config.glassBlur,
        componentSpacing: domain.visual_studio_config.componentSpacing,
        animationSpeed: domain.visual_studio_config.animationSpeed,
        filmGrainOpacity: domain.visual_studio_config.filmGrainOpacity,
        vignetteSize: domain.visual_studio_config.vignetteSize,
      }),
      config_scenes: JSON.stringify({ scenes: domain.scenes_config }),
      config_gallery: JSON.stringify({ items: domain.gallery_config }),
      config_platforms: JSON.stringify({
        instagram: domain.artist_profile.socialLinks.instagram,
        youtube: domain.artist_profile.socialLinks.youtube,
        twitter: domain.artist_profile.socialLinks.twitter,
        spotify: domain.artist_profile.streamingLinks.spotify,
        appleMusic: domain.artist_profile.streamingLinks.appleMusic,
      }),
      config_seo: JSON.stringify(domain.seo_config),
      config_analytics: JSON.stringify({
        customMetricsEnabled: true,
        trackFps: true,
        trackApiLatency: true,
      }),
      config_users: JSON.stringify(domain.user_permissions_config),
      timeline_events: JSON.stringify(domain.timeline_events.map(ev => ({
        year: ev.year,
        title: ev.title,
        desc: ev.description,
      }))),
      verified_quotes: JSON.stringify(domain.verified_quotes),
      
      // Backward compatibility mappings
      artist_profile: JSON.stringify(domain.artist_profile),
      seo_config: JSON.stringify(domain.seo_config),
      homepage_layout: JSON.stringify(domain.homepage_layout),
      visual_studio_config: JSON.stringify(domain.visual_studio_config),
    };

    return result;
  }

  /**
   * Fetch all releases. Falls back to static release objects.
   */
  static async getReleases() {
    try {
      const dbReleases = await prisma.release.findMany({
        orderBy: { releaseYear: 'desc' }
      });
      if (dbReleases && dbReleases.length > 0) {
        return dbReleases;
      }
    } catch (err) {
      console.warn('ContentProvider: Failed to load releases from database. Falling back to static releases.', err);
    }
    
    return [
      {
        id: 'rel-sukuna',
        title: 'SUKUNA - Single',
        description: 'Hard-hitting cinematic drill tracks blending atmospheric pads with aggressive 808 glides.',
        releaseYear: 2026,
        coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/44/6a/a5/446aa581-e4e8-df30-97de-e2561fc7e999/1200214051570.jpg/600x600bb.jpg',
        spotifyUrl: null,
        appleUrl: 'https://music.apple.com/us/song/sukuna/6771417507',
        youtubeUrl: null,
        type: 'single',
        isFeatured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'rel-911',
        title: '911 - Single',
        description: 'Atmospheric and heavy synth production featuring late-night driving vibes.',
        releaseYear: 2026,
        coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/2d/fa/26/2dfa266f-3954-7f14-6747-deb03f3a51b8/8718521142124.jpg/600x600bb.jpg',
        spotifyUrl: null,
        appleUrl: 'https://music.apple.com/us/song/911/1893854660',
        youtubeUrl: null,
        type: 'single',
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }
}
