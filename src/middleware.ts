// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from './lib/auth';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
const JWT_SECRET = process.env.JWT_SECRET || ADMIN_PASSWORD;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Exclude login page, login API, static/public files, next/react assets, and files with extensions
  if (
    pathname === '/admin/login' ||
    pathname === '/api/admin/login' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/public') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Retrieve admin session cookie
  const sessionCookie = request.cookies.get('admin_session');

  if (!sessionCookie) {
    // API request: return 401 Unauthorized
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Session missing' },
        { status: 401 }
      );
    }
    // Page request: redirect to login
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Verify the JWT token
  const session = await verifySession(sessionCookie.value, JWT_SECRET);

  if (!session) {
    // API request: return 401 Unauthorized
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Invalid or expired session' },
        { status: 401 }
      );
    }
    // Page request: delete invalid cookie and redirect to login
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    response.cookies.delete('admin_session');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  // Capture all administration panel UI routes and API routes
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
