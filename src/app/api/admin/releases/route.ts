import { apiSuccess, apiError } from '@/lib/apiResponse';
import { ContentProvider } from '@/lib/contentProvider';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const releases = await ContentProvider.getReleases();
    return apiSuccess(releases, 'Releases retrieved successfully');
  } catch (error: any) {
    console.warn('Database error while fetching releases. Returning fallback empty array.', error);
    return apiSuccess([], 'Failed to query database, returning empty fallback list');
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const release = await prisma.release.create({
      data: {
        title: data.title,
        description: data.description,
        releaseYear: Number(data.releaseYear) || new Date().getFullYear(),
        coverUrl: data.coverUrl,
        spotifyUrl: data.spotifyUrl,
        appleUrl: data.appleUrl,
        youtubeUrl: data.youtubeUrl,
        type: data.type || 'album',
        isFeatured: Boolean(data.isFeatured),
      }
    });
    return apiSuccess(release, 'Release created successfully');
  } catch (error: any) {
    console.error('Error creating release in API:', error);
    return apiError('Failed to create release', error?.message || String(error), 503);
  }
}

