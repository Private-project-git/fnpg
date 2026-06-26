// src/app/api/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { signSession } from '@/lib/auth';
import { isRateLimited } from '@/lib/rateLimit';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
const JWT_SECRET = process.env.JWT_SECRET || ADMIN_PASSWORD;

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || (request as any).ip || 'unknown';
    
    // Hardened rate limiting layer to prevent brute forcing
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, message: 'Too many login attempts. Please try again in a minute.' },
        { status: 429 }
      );
    }

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Verify credentials
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate session token (valid for 24 hours)
    const token = await signSession({ username }, JWT_SECRET);

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: { username }
    });

    // Set hardened cookie
    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // Hardened CSRF protection
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours in seconds
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'An error occurred during login' },
      { status: 500 }
    );
  }
}
