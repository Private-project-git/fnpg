import { apiSuccess, apiError } from '@/lib/apiResponse';
import prisma from '@/lib/prisma';

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || 'NOT_SET';
  let maskedUrl = dbUrl;
  try {
    const urlObj = new URL(dbUrl);
    if (urlObj.password) {
      urlObj.password = '******';
    }
    maskedUrl = urlObj.toString();
  } catch (_) {}

  let dbStatus = 'UNKNOWN';
  let dbError = null;

  try {
    // Query test database connection
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'CONNECTED';
  } catch (err: any) {
    dbStatus = 'DISCONNECTED';
    dbError = err.message || String(err);
  }

  const data = {
    database: {
      status: dbStatus,
      error: dbError,
      url: maskedUrl,
      nodeEnv: process.env.NODE_ENV,
    },
    apis: {
      config: '/api/admin/config',
      tracks: '/api/admin/tracks',
      releases: '/api/admin/releases',
      settings: '/api/admin/settings',
    }
  };

  return apiSuccess(data, 'Diagnostics retrieved successfully');
}

