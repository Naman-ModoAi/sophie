import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from '@/lib/session'
import { createServiceClient } from '@/lib/supabase/server'
import { google } from 'googleapis'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error)}`, request.url)
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/?error=missing_parameters', request.url)
    )
  }

  const cookieStore = await cookies()
  const storedState = cookieStore.get('oauth_state')?.value

  if (!storedState || state !== storedState) {
    return NextResponse.redirect(
      new URL('/?error=invalid_state', request.url)
    )
  }

  try {
    // Exchange code for tokens
    const oauth2Client = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!,
      process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI!
    )

    const { tokens } = await oauth2Client.getToken(code)

    if (!tokens.access_token || !tokens.id_token) {
      throw new Error('Missing tokens')
    }

    // Verify ID token
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    })

    const payload = ticket.getPayload()
    if (!payload) throw new Error('Invalid token')

    const { sub: googleUserId, email, name, picture } = payload

    const supabase = await createServiceClient()

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('google_user_id', googleUserId)
      .single()

    let userData
    let userError

    if (existingUser) {
      // Update existing user
      const { data, error } = await supabase
        .from('users')
        .update({
          email,
          name,
          profile_photo_url: picture,
          last_login_at: new Date().toISOString(),
        })
        .eq('id', existingUser.id)
        .select()
        .single()
      userData = data
      userError = error
    } else {
      // Create new user
      const { data, error } = await supabase
        .from('users')
        .insert({
          google_user_id: googleUserId,
          email,
          name,
          profile_photo_url: picture,
          last_login_at: new Date().toISOString(),
        })
        .select()
        .single()
      userData = data
      userError = error
    }

    if (userError || !userData) {
      console.error('User creation error:', userError)
      throw userError || new Error('Failed to create user')
    }

    // Store tokens
    const expiresAt = tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : new Date(Date.now() + 3600 * 1000)

    // Check for existing token
    const { data: existingToken } = await supabase
      .from('oauth_tokens')
      .select('id')
      .eq('user_id', userData.id)
      .eq('provider', 'google')
      .single()

    let tokenError
    if (existingToken) {
      const { error } = await supabase
        .from('oauth_tokens')
        .update({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || null,
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingToken.id)
      tokenError = error
    } else {
      const { error } = await supabase
        .from('oauth_tokens')
        .insert({
          user_id: userData.id,
          provider: 'google',
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || null,
          expires_at: expiresAt.toISOString(),
        })
      tokenError = error
    }

    if (tokenError) {
      console.error('Token storage error:', tokenError)
      throw tokenError
    }

    console.log('✅ User created:', userData.id)
    console.log('✅ Tokens stored successfully')

    // Create session
    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    const session = await getIronSession<SessionData>(request, response, sessionOptions)

    session.userId = userData.id
    session.email = userData.email
    session.isLoggedIn = true

    await session.save()

    cookieStore.delete('oauth_state')

    return response
  } catch (error) {
    console.error('OAuth error:', error)
    return NextResponse.redirect(
      new URL('/?error=authentication_failed', request.url)
    )
  }
}
