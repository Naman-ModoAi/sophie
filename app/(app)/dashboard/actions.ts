'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import { fetchCalendarEvents, refreshGoogleToken } from '@/lib/google/calendar'

export async function syncCalendar(userId: string, daysAhead: number = 7) {
  try {
    console.log('[syncCalendar] Starting sync for userId:', userId);
    const supabase = await createServiceClient()

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      console.error('[syncCalendar] User not found for userId:', userId, userError);
      throw new Error('User not found')
    }

    console.log('[syncCalendar] Found user:', user.email);

    // Get tokens
    const { data: tokenData, error: tokenError } = await supabase
      .from('oauth_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .single()

    if (tokenError || !tokenData) {
      console.error('Token query error:', tokenError)
      console.error('Looking for user_id:', userId)

      // Debug: Check what tokens exist
      const { data: allTokens } = await supabase
        .from('oauth_tokens')
        .select('user_id, provider')

      console.log('All tokens in DB:', allTokens)
      throw new Error('No tokens found')
    }

    // Refresh if expired
    let accessToken = tokenData.access_token
    const expiresAt = new Date(tokenData.expires_at)

    if (expiresAt <= new Date() && tokenData.refresh_token) {
      const refreshed = await refreshGoogleToken(
        tokenData.refresh_token,
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        process.env.GOOGLE_CLIENT_SECRET!
      )

      accessToken = refreshed.access_token

      const newExpiresAt = new Date()
      newExpiresAt.setSeconds(newExpiresAt.getSeconds() + refreshed.expires_in)

      await supabase
        .from('oauth_tokens')
        .update({
          access_token: accessToken,
          expires_at: newExpiresAt.toISOString(),
        })
        .eq('user_id', userId)
    }

    // Fetch events
    const events = await fetchCalendarEvents(accessToken, daysAhead)

    let meetingsSynced = 0
    let attendeesSynced = 0
    const userDomain = user.email.split('@')[1]

    // Process events
    for (const event of events) {
      if (!event.id || !event.summary || event.status === 'cancelled') continue
      if (!event.start || !event.end) continue

      const start = event.start.dateTime || event.start.date
      const end = event.end.dateTime || event.end.date
      if (!start || !end) continue

      const attendees = event.attendees || []
      const isExternal = attendees.some(
        (a) => a.email && a.email.split('@')[1] !== userDomain
      )

      // Upsert meeting
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .upsert(
          {
            user_id: userId,
            calendar_event_id: event.id,
            title: event.summary,
            start_time: new Date(start).toISOString(),
            end_time: new Date(end).toISOString(),
            description: event.description || null,
            location: event.location || null,
            is_external: isExternal,
            is_all_day: !event.start.dateTime,
            is_cancelled: false,
          },
          { onConflict: 'user_id,calendar_event_id' }
        )
        .select()
        .single()

      if (meeting && !meetingError) {
        meetingsSynced++

        // Store attendees with company linkage
        if (attendees.length > 0) {
          // Filter out attendees without email addresses
          const validAttendees = attendees.filter(a => a.email)

          if (validAttendees.length > 0) {
            // Extract unique domains from attendees
            const domains = [...new Set(validAttendees.map(a => a.email!.split('@')[1]))]

            // Upsert companies for each unique domain
            const companyMap = new Map<string, string>() // domain -> company_id
            for (const domain of domains) {
              const domainParts = domain.split('.')
              const companyNameFromDomain = domainParts[0]
                .split(/[-_]/)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')

              const { data: company } = await supabase
                .from('companies')
                .upsert(
                  {
                    domain,
                    name: companyNameFromDomain
                  },
                  { onConflict: 'domain' }
                )
                .select('id, domain')
                .single()

              if (company) {
                companyMap.set(company.domain, company.id)
              }
            }

            // Helper function to extract name from email
            const extractNameFromEmail = (email: string): string => {
              const localPart = email.split('@')[0]
              const nameParts = localPart
                .replace(/[0-9]/g, '')
                .split(/[._-]/)
                .filter(part => part.length > 1)

              return nameParts
                .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
                .join(' ')
            }

            // Build attendee records with company_id
            const attendeeRecords = validAttendees.map((a) => {
              const domain = a.email!.split('@')[1]
              const extractedName = extractNameFromEmail(a.email!)

              return {
                meeting_id: meeting.id,
                email: a.email!.toLowerCase(),
                name: a.displayName || extractedName || null,
                domain,
                is_internal: domain === userDomain,
                company_id: companyMap.get(domain) || null,
              }
            })

            await supabase
              .from('attendees')
              .upsert(attendeeRecords, { onConflict: 'meeting_id,email' })

            attendeesSynced += attendeeRecords.length
          }
        }
      }
    }

    // Revalidate the dashboard page to show new data
    revalidatePath('/dashboard')

    return {
      success: true,
      meetings_synced: meetingsSynced,
      attendees_synced: attendeesSynced,
    }
  } catch (error: any) {
    console.error('Sync error:', error)
    throw new Error(error.message || 'Sync failed')
  }
}
