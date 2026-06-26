// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from './lib/auth';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
const JWT_SECRET = process.env.JWT_SECRET || ADMIN_PASSWORD;

export async function middleware(request: NextRequest) {
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
