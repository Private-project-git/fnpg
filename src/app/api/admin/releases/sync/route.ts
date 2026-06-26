// src/app/api/admin/releases/sync/route.ts
import { apiSuccess, apiError } from '@/lib/apiResponse';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    console.log('[Sync Releases] Starting sync from iTunes API (Artist Lookup)...');
    const res = await fetch('https://itunes.apple.com/lookup?id=1868401922&entity=song&limit=200', {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!res.ok) {
      throw new Error(`iTunes API returned status ${res.status}`);
    }

    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) {
      return apiSuccess({ added: 0, updated: 0 }, 'No releases found on iTunes API.');
    }

    const tracks = data.results.filter((t: any) => t.wrapperType === 'track');

    console.log(`[Sync Releases] Found ${tracks.length} matching 8CTRL tracks on iTunes.`);

    let addedCount = 0;
    let updatedCount = 0;

    for (const t of tracks) {
      let title = t.trackName;
      if (title === 'F**k You Bro') {
        title = 'Fuck You Bro';
      }
      const album = t.collectionName || '';
      const releaseYear = t.releaseDate ? new Date(t.releaseDate).getFullYear() : new Date().getFullYear();
      const coverUrl = t.artworkUrl100 ? t.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg') : null;
      const appleUrl = t.trackViewUrl;
      const previewUrl = t.previewUrl;
      const genre = t.primaryGenreName || 'Electronic';
      const duration = t.trackTimeMillis ? Math.round(t.trackTimeMillis / 1000) : 30;

      // 1. Sync Track model
      const existingTrack = await prisma.track.findFirst({
        where: {
          OR: [
            { title: title },
            { appleUrl: appleUrl }
          ]
        }
      });

      if (existingTrack) {
        // Update to official cover artwork, previews and links
        await prisma.track.update({
          where: { id: existingTrack.id },
          data: {
            coverUrl: coverUrl, // Sync official cover artwork!
            previewUrl: previewUrl || existingTrack.previewUrl,
            appleUrl: appleUrl || existingTrack.appleUrl,
            duration: duration || existingTrack.duration,
          }
        });
        updatedCount++;
      } else {
        // Create new track with default cinematic parameters
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `track-${Math.random().toString(36).substring(2, 6)}`;
        await prisma.track.create({
          data: {
            title,
            artist: t.artistName || '8CTRL',
            album,
            coverUrl,
            previewUrl,
            appleUrl,
            genre,
            duration,
            isFeatured: false,
            isArtistFav: false,
            isFanFav: false,
            isTrending: false,
            isRecommended: false,
            isLatest: true,
            accentColor: '#8B0000',
            backgroundGradient: 'radial-gradient(circle at 50% 50%, rgba(139, 0, 0, 0.15) 0%, #050505 85%)',
            particlePreset: 'ash',
            lightingPreset: 'soft',
            transitionStyle: 'fade',
            slug,
            status: 'published'
          }
        });
        addedCount++;
      }

      // 2. Sync Release model
      const releaseTitle = album || `${title} - Single`;
      const existingRelease = await prisma.release.findFirst({
        where: { title: releaseTitle }
      });

      if (!existingRelease) {
        const type = releaseTitle.toLowerCase().includes('single') || releaseTitle.toLowerCase().includes('ep') ? 'single' : 'album';
        await prisma.release.create({
          data: {
            title: releaseTitle,
            description: `Evolving atmospheric cinematic beats.`,
            releaseYear,
            coverUrl,
            appleUrl: t.collectionViewUrl || appleUrl,
            type,
            isFeatured: false,
          }
        });
      }
    }

    return apiSuccess(
      { added: addedCount, updated: updatedCount },
      `Release sync completed: Added ${addedCount} new releases, updated ${updatedCount} existing preview/artwork details.`
    );
  } catch (error: any) {
    console.error('[Sync Releases] Error during synchronization:', error);
    return apiError('Releases synchronization failed', error?.message || String(error), 500);
  }
}
