import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  // Logging for debugging (remove in production)
  console.log(`Middleware triggered for: ${pathname}`);
  console.log(`Token present: ${!!token}`);

  const isPublicPath =
    pathname.startsWith('/signin') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/api');

  // Validate token if present
  let isAuthenticated = false;
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret'); // Match backend secret
      isAuthenticated = true;
      console.log('Token validated successfully');
    } catch (err) {
      if (err instanceof Error) {
        console.log('Invalid/expired token:', err.message);
      } else {
        console.log('Invalid/expired token:', err);
      }
      // Clear invalid cookie
      const response = NextResponse.redirect(new URL('/signin', req.url));
      response.cookies.delete('token');
      return response;
    }
  }

  // No valid token and not public path → redirect to signin
  if (!isAuthenticated && !isPublicPath) {
    console.log('Redirecting to /signin: Not authenticated');
    return NextResponse.redirect(new URL('/signin', req.url));
  }

  // Valid token on public auth paths → redirect to dashboard
  if (isAuthenticated && (pathname.startsWith('/signin') || pathname.startsWith('/signup'))) {
    console.log('Redirecting to /dashboard: Already authenticated');
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // More specific: Cover dashboard and admin explicitly
    '/dashboard/:path*',
    '/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico|api|signin|signup|reset-password).*)',
  ],
};