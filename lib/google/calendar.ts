import { google } from 'googleapis'
import type { calendar_v3 } from 'googleapis'

export type CalendarEvent = calendar_v3.Schema$Event

export async function fetchCalendarEvents(
  accessToken: string,
  daysAhead: number = 7
): Promise<CalendarEvent[]> {
  // Create OAuth2 client and set credentials
  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({ access_token: accessToken })

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  const now = new Date()
  const future = new Date()
  future.setDate(now.getDate() + daysAhead)

  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: future.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    })

    return (response.data.items || []) as CalendarEvent[]
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error) {
      const errorCode = (error as { code?: number }).code;
      if (errorCode === 401 || errorCode === 403) {
        throw new Error('CALENDAR_PERMISSION_ERROR')
      }
    }
    throw error
  }
}

export async function refreshGoogleToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<{ access_token: string; expires_in: number }> {
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret)
  oauth2Client.setCredentials({ refresh_token: refreshToken })

  const { credentials } = await oauth2Client.refreshAccessToken()

  return {
    access_token: credentials.access_token!,
    expires_in: 3600,
  }
}
