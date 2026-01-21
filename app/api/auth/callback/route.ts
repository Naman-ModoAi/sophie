import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/?error=missing_parameters', request.url)
    );
  }

  // Verify state (CSRF protection)
  const cookieStore = await cookies();
  const storedState = cookieStore.get('oauth_state')?.value;

  if (!storedState || state !== storedState) {
    return NextResponse.redirect(
      new URL('/?error=invalid_state', request.url)
    );
  }

  try {
    // Exchange code for tokens via backend service
    // Backend handles: token exchange, user creation, token storage
    const backendUrl = process.env.BACKEND_SERVICE_URL!;
    const tokenResponse = await fetch(`${backendUrl}/api/auth/exchange-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authorization_code: code,
        redirect_uri: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI!,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      console.error('Backend error:', errorData);
      throw new Error('Token exchange failed');
    }

    const userData = await tokenResponse.json();
    const { user_id, email } = userData;

    // Create session
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    const session = await getIronSession<SessionData>(request, response, sessionOptions);

    session.userId = user_id;
    session.email = email;
    session.isLoggedIn = true;

    await session.save();

    // Clear OAuth state cookie
    cookieStore.delete('oauth_state');

    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/?error=authentication_failed', request.url)
    );
  }
}
