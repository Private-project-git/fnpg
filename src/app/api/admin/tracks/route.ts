// src/app/api/admin/tracks/route.ts
import { apiSuccess, apiError } from '@/lib/apiResponse';
import { TrackRepository } from '@/lib/repositories/track.repository';
import { TrackMapper } from '@/lib/mappers/track.mapper';
import { TrackSchema } from '@/lib/validation';
import { Track as DbTrack } from '@prisma/client';

export async function GET() {
  try {
    const dbTracks = await TrackRepository.findAll();
    const tracks = dbTracks.map((t: DbTrack) => TrackMapper.toDomain(t));
    return apiSuccess(tracks, 'Tracks retrieved successfully');
  } catch (error: any) {
    console.warn('Database error while fetching tracks:', error);
    return apiSuccess([], 'Failed to query database, returning empty list');
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { id, ...trackData } = data;

    // Validate using Zod
    const validation = TrackSchema.safeParse(trackData);
    if (!validation.success) {
      return apiError('Validation failed for track data', validation.error.message, 400);
    }

    const payload = TrackMapper.toDb(validation.data);

    if (id) {
      // Update existing
      const dbTrack = await TrackRepository.update(id, payload);
      const track = TrackMapper.toDomain(dbTrack);
      return apiSuccess(track, 'Track updated successfully');
    } else {
      // Create new
      const dbTrack = await TrackRepository.create(payload);
      const track = TrackMapper.toDomain(dbTrack);
      return apiSuccess(track, 'Track created successfully');
    }
  } catch (error: any) {
    console.error('Error saving track in API:', error);
    return apiError('Failed to save track', error?.message || String(error), 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return apiError('Missing id parameter', null, 400);
    }

    await TrackRepository.delete(id);
    return apiSuccess({ id }, 'Track deleted successfully');
  } catch (error: any) {
    console.error('Error deleting track in API:', error);
    return apiError('Failed to delete track', error?.message || String(error), 500);
  }
}
