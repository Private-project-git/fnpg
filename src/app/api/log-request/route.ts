import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/apiResponse';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const internalKey = request.headers.get('x-internal-key');
    const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD || 'secretjwtkey';
    
    if (internalKey !== JWT_SECRET) {
      return apiError('Unauthorized', 'Invalid or missing internal key', 401);
    }

    const body = await request.json();
    const { path, method, ip, userAgent, referer, country, city } = body;

    if (!path || !method) {
      return apiError('Bad Request', 'Path and method are required', 400);
    }

    const log = await prisma.trafficLog.create({
      data: {
        path,
        method,
        ip: ip || null,
        userAgent: userAgent || null,
        referer: referer || null,
        country: country || null,
        city: city || null,
      },
    });

    return apiSuccess(log, 'Request logged successfully', 201);
  } catch (error: any) {
    console.error('Error logging request in API:', error);
    return apiError('Failed to log request', error?.message || String(error), 500);
  }
}
