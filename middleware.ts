import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, sessionOptions);

  // Protect authenticated routes
  if (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/settings')) {
    if (!session.isLoggedIn) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Redirect logged-in users away from landing page
  if (request.nextUrl.pathname === '/' && session.isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/settings/:path*'],
};
