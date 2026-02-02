import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const origin = requestUrl.origin

  if (error) {
    return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(error)}`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=missing_code`)
  }

  try {
    const supabase = await createClient()

    // Exchange code for session
    const { data: { user }, error: authError } = await supabase.auth.exchangeCodeForSession(code)

    if (authError || !user) {
      console.error('Auth exchange error:', authError)
      return NextResponse.redirect(`${origin}/?error=auth_failed`)
    }

    console.log('✅ User authenticated via Supabase:', user.id)

    // Sync user with custom users table
    const serviceSupabase = await createServiceClient()

    const { error: userError } = await serviceSupabase
      .from('users')
      .upsert(
        {
          id: user.id, // Use Supabase Auth UUID
          google_user_id: user.user_metadata.sub,
          email: user.email,
          name: user.user_metadata.full_name || user.user_metadata.name,
          profile_photo_url: user.user_metadata.avatar_url || user.user_metadata.picture,
          last_login_at: new Date().toISOString(),
        },
        {
          onConflict: 'id', // Use id as primary key
        }
      )

    if (userError) {
      console.error('User sync error:', userError)
      // Continue anyway - user exists in auth.users
    } else {
      console.log('✅ User synced to custom users table')
    }

    // Get provider token (for calendar access)
    const { data: { session } } = await supabase.auth.getSession()
    const providerToken = session?.provider_token
    const providerRefreshToken = session?.provider_refresh_token

    if (providerToken) {
      // Store Google OAuth tokens in our oauth_tokens table for calendar access
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 1) // Google tokens typically expire in 1 hour

      const { error: tokenError } = await serviceSupabase
        .from('oauth_tokens')
        .upsert(
          {
            user_id: user.id,
            provider: 'google',
            access_token: providerToken,
            refresh_token: providerRefreshToken || null,
            expires_at: expiresAt.toISOString(),
          },
          { onConflict: 'user_id,provider' }
        )

      if (tokenError) {
        console.error('Token storage error:', tokenError)
      } else {
        console.log('✅ Provider tokens stored successfully')
      }
    }

    // Redirect to dashboard
    return NextResponse.redirect(`${origin}/dashboard`)
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(`${origin}/?error=authentication_failed`)
  }
}
