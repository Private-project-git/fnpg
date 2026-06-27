// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';
import { verifySession } from './lib/auth';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
const JWT_SECRET = process.env.JWT_SECRET || ADMIN_PASSWORD;

function logRequest(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  // Exclude static assets, internal Next.js pages, and our traffic analytics API endpoints
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/placeholders') ||
    pathname.startsWith('/api/log-request') ||
    pathname.startsWith('/api/admin/traffic-stats') ||
    pathname.includes('.')
  ) {
    return;
  }

  const reqAny = request as any;
  const country = request.headers.get('x-vercel-ip-country') || reqAny.geo?.country || '';
  const city = request.headers.get('x-vercel-ip-city') || reqAny.geo?.city || '';
  const ip = reqAny.ip || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';

  const origin = request.nextUrl.origin;
  const logPromise = fetch(`${origin}/api/log-request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-key': JWT_SECRET,
    },
    body: JSON.stringify({
      path: pathname,
      method: request.method,
      ip,
      userAgent: request.headers.get('user-agent') || '',
      referer: request.headers.get('referer') || '',
      country,
      city,
    }),
  })
    .then(async (res) => {
      if (!res.ok) {
        console.error('Logging endpoint returned status:', res.status, await res.text());
      }
    })
    .catch((err) => {
      console.error('Error sending request log:', err);
    });

  event.waitUntil(logPromise);
}

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  // Log request in a non-blocking way
  logRequest(request, event);

  const { pathname } = request.nextUrl;

  // 1. Host Header Validation (Security Hardening against Host Header Injection)
  const host = request.headers.get('host') || '';
  const allowedHosts = process.env.ALLOWED_HOSTS
    ? process.env.ALLOWED_HOSTS.split(',')
    : ['8ctrl.wesqre.in', 'localhost:2020', '127.0.0.1:2020', 'localhost:3000'];

  const isAllowedHost = allowedHosts.some(allowed => {
    const cleanAllowed = allowed.trim();
    if (cleanAllowed.includes(':')) {
      return host === cleanAllowed;
    }
    return host === cleanAllowed || host.startsWith(cleanAllowed + ':');
  });

  if (!isAllowedHost) {
    return new NextResponse('Bad Request: Invalid Host Header', { status: 400 });
  }

  // 2. Admin Route Protection
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    // Exclude login credentials validation and page routes
    if (
      pathname === '/admin/login' ||
      pathname === '/api/admin/login'
    ) {
      return NextResponse.next();
    }

    const sessionCookie = request.cookies.get('admin_session');

    if (!sessionCookie) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized: Session missing' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Verify JWT
    const session = await verifySession(sessionCookie.value, JWT_SECRET);

    if (!session) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized: Invalid or expired session' },
          { status: 401 }
        );
      }
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('admin_session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  // Capture all routes except core framework assets to apply global Host header validation
  matcher: ['/((?!_next/static|_next/image|favicon.ico|placeholders).*)'],
};
