import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const origin = process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin

  if (error) {
    return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(error)}`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=missing_code`)
  }

  // Create response object to set cookies on
  const response = NextResponse.redirect(`${origin}/dashboard`)

  try {
    const supabase = await createClient()

    // Exchange code for session
    const { data: { session, user }, error: authError } = await supabase.auth.exchangeCodeForSession(code)

    if (authError || !user) {
      console.error('Auth exchange error:', authError)
      return NextResponse.redirect(`${origin}/?error=auth_failed`)
    }

    if (!session) {
      console.error('No session returned from exchangeCodeForSession')
      return NextResponse.redirect(`${origin}/?error=no_session`)
    }

    console.log('✅ User authenticated via Supabase:', user.id)

    // Check for referral cookie
    const referralCode = request.cookies.get('referral_code')?.value

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

    // Handle referral tracking if referral code exists
    if (referralCode) {
      console.log('📎 Processing referral code:', referralCode)

      // Find referrer by code
      const { data: referrerData } = await serviceSupabase
        .from('users')
        .select('id')
        .eq('referral_code', referralCode)
        .single()

      if (referrerData) {
        // Create referral record with status='signed_up'
        const { error: referralError } = await serviceSupabase
          .from('referrals')
          .insert({
            referrer_user_id: referrerData.id,
            referred_user_id: user.id,
            referral_code: referralCode,
            status: 'signed_up',
            signed_up_at: new Date().toISOString(),
          })

        if (referralError) {
          console.error('Referral creation error:', referralError)
        } else {
          console.log('✅ Referral tracked successfully')
        }
      } else {
        console.warn('⚠️ Referral code not found:', referralCode)
      }
    }

    // Get provider token (for calendar access)
    const providerToken = session.provider_token
    const providerRefreshToken = session.provider_refresh_token

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

    // Return response with cookies set
    return response
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(`${origin}/?error=authentication_failed`)
  }
}
