import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/', request.url));
  const session = await getIronSession<SessionData>(request, response, sessionOptions);

  session.destroy();

  return response;
}
