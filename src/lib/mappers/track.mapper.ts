// src/lib/mappers/track.mapper.ts
import { Track as DbTrack } from '@prisma/client';
import { Track as DomainTrack, TrackArtwork, TrackPreview, TrackPlatforms, TrackTheme, TrackVisualIdentity } from '@/types/domain';

export class TrackMapper {
  static toDomain(dbTrack: DbTrack): DomainTrack {
    const artwork: TrackArtwork = {
      url: dbTrack.coverUrl || '',
      fallbackUrl: '/placeholders/artwork.jpg',
    };

    const preview: TrackPreview = {
      url: dbTrack.previewUrl || '',
      duration: dbTrack.duration || 30,
    };

    const platforms: TrackPlatforms = {
      spotifyUrl: dbTrack.spotifyUrl || undefined,
      appleMusicUrl: dbTrack.appleUrl || undefined,
      youtubeUrl: dbTrack.youtubeUrl || undefined,
    };

    const theme: TrackTheme = {
      featured: !!dbTrack.isFeatured,
      artistFavorite: !!dbTrack.isArtistFav,
      fanFavorite: !!dbTrack.isFanFav,
      trending: !!dbTrack.isTrending,
      recommended: !!dbTrack.isRecommended,
      latest: !!dbTrack.isLatest,
    };

    const visualIdentity: TrackVisualIdentity = {
      accentColor: dbTrack.accentColor || '#8B0000',
      backgroundGradient: dbTrack.backgroundGradient || 'radial-gradient(circle at 50% 50%, rgba(139, 0, 0, 0.15) 0%, #050505 85%)',
      particlePreset: (dbTrack.particlePreset as any) || 'none',
      lightingPreset: (dbTrack.lightingPreset as any) || 'none',
      transitionStyle: dbTrack.transitionStyle || 'fade',
      typographyStyle: dbTrack.typographyStyle || '',
    };

    let producers: string[] = [];
    let writers: string[] = [];
    if (dbTrack.producerCredits) {
      try { producers = JSON.parse(dbTrack.producerCredits); } catch (_) {}
    }
    if (dbTrack.writerCredits) {
      try { writers = JSON.parse(dbTrack.writerCredits); } catch (_) {}
    }

    return {
      id: dbTrack.id,
      title: dbTrack.title,
      artist: dbTrack.artist,
      album: dbTrack.album,
      artwork,
      preview,
      releaseDate: dbTrack.releaseDate || '',
      genre: dbTrack.genre,
      duration: dbTrack.duration,
      platforms,
      theme,
      stats: {},
      visualIdentity,
      slug: dbTrack.slug || '',
      backgroundArtwork: dbTrack.backgroundArtwork || '',
      credits: { producers, writers },
      lyrics: dbTrack.lyrics || '',
      status: (dbTrack.status as any) || 'published',
      order: dbTrack.displayOrder,
    };
  }

  static toDb(domainTrack: any): Partial<DbTrack> {
    const dbData: Partial<DbTrack> = {
      title: domainTrack.title,
      artist: domainTrack.artist || '8CTRL',
      album: domainTrack.album || '',
      coverUrl: domainTrack.artwork?.url || domainTrack.coverUrl || null,
      previewUrl: domainTrack.preview?.url || domainTrack.previewUrl || null,
      spotifyUrl: domainTrack.platforms?.spotifyUrl || domainTrack.spotifyUrl || null,
      appleUrl: domainTrack.platforms?.appleMusicUrl || domainTrack.appleUrl || null,
      youtubeUrl: domainTrack.platforms?.youtubeUrl || domainTrack.youtubeUrl || null,
      genre: domainTrack.genre || 'Electronic',
      duration: domainTrack.duration || 30,
      isFeatured: !!domainTrack.theme?.featured || !!domainTrack.isFeatured,
      isArtistFav: !!domainTrack.theme?.artistFavorite || !!domainTrack.isArtistFav,
      isFanFav: !!domainTrack.theme?.fanFavorite || !!domainTrack.isFanFav,
      isTrending: !!domainTrack.theme?.trending || !!domainTrack.isTrending,
      isRecommended: !!domainTrack.theme?.recommended || !!domainTrack.isRecommended,
      isLatest: !!domainTrack.theme?.latest || !!domainTrack.isLatest,

      // Visual Identity
      accentColor: domainTrack.visualIdentity?.accentColor || domainTrack.accentColor || null,
      backgroundGradient: domainTrack.visualIdentity?.backgroundGradient || domainTrack.backgroundGradient || null,
      particlePreset: domainTrack.visualIdentity?.particlePreset || domainTrack.particlePreset || 'none',
      lightingPreset: domainTrack.visualIdentity?.lightingPreset || domainTrack.lightingPreset || 'none',
      transitionStyle: domainTrack.visualIdentity?.transitionStyle || domainTrack.transitionStyle || 'fade',
      typographyStyle: domainTrack.visualIdentity?.typographyStyle || domainTrack.typographyStyle || null,

      // Metadata
      slug: domainTrack.slug || null,
      backgroundArtwork: domainTrack.backgroundArtwork || null,
      lyrics: domainTrack.lyrics || null,
      status: domainTrack.status || 'published',
      displayOrder: typeof domainTrack.order === 'number' ? domainTrack.order : (domainTrack.displayOrder || 0),
      releaseDate: domainTrack.releaseDate || null,
      producerCredits: domainTrack.credits?.producers ? JSON.stringify(domainTrack.credits.producers) : null,
      writerCredits: domainTrack.credits?.writers ? JSON.stringify(domainTrack.credits.writers) : null,
    };

    if (domainTrack.id) {
      dbData.id = domainTrack.id;
    }

    return dbData;
  }
}
