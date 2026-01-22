import { google } from 'googleapis'

interface CalendarEvent {
  id: string
  summary: string
  start: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  end: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  attendees?: Array<{
    email: string
    displayName?: string
    responseStatus?: string
  }>
  status?: string
  description?: string
  location?: string
}

export async function fetchCalendarEvents(
  accessToken: string,
  daysAhead: number = 7
): Promise<CalendarEvent[]> {
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
  } catch (error: any) {
    if (error.code === 401 || error.code === 403) {
      throw new Error('CALENDAR_PERMISSION_ERROR')
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
