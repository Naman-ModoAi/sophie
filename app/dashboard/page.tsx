import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { createServiceClient } from '@/lib/supabase/server'
import { syncCalendar } from './actions'

async function getSession() {
  const cookieStore = await cookies();
  const response = new Response();
  const session = await getIronSession<SessionData>(
    { headers: { cookie: cookieStore.toString() } } as any,
    response,
    sessionOptions
  );

  if (!session.isLoggedIn) {
    redirect('/');
  }

  return session;
}

async function getMeetings(userId: string) {
  try {
    const supabase = await createServiceClient()

    console.log('Fetching meetings for user:', userId)

    const { data, error } = await supabase
      .from('meetings')
      .select(`
        *,
        attendees (*)
      `)
      .eq('user_id', userId)
      .eq('is_cancelled', false)
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(50)

    if (error) {
      console.error('Meetings query error:', error)
      return []
    }

    console.log('Found meetings:', data?.length || 0)
    return data || []
  } catch (error) {
    console.error('Error fetching meetings:', error)
    return []
  }
}

export default async function Dashboard() {
  const session = await getSession();

  // Auto-sync calendar on page load
  try {
    await syncCalendar(session.userId, 7);
  } catch (error: any) {
    console.error('Auto-sync failed:', error.message);
  }

  const meetings = await getMeetings(session.userId);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900">PrepFor.app</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{session.email}</span>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Upcoming Meetings (Next 7 Days)
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Calendar syncs automatically when you visit this page
          </p>
        </div>

        {meetings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No upcoming meetings found. Make sure your Google Calendar is synced.
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting: any) => (
              <div
                key={meeting.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {meeting.title || 'Untitled Meeting'}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      meeting.is_internal
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {meeting.is_internal ? 'Internal' : 'External'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  {new Date(meeting.start_time).toLocaleString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>

                {meeting.attendees && meeting.attendees.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Attendees:
                    </h4>
                    <ul className="space-y-1">
                      {meeting.attendees.map((attendee: any, idx: number) => (
                        <li
                          key={idx}
                          className="text-sm text-gray-600 flex items-center gap-2"
                        >
                          <span>{attendee.name || attendee.email}</span>
                          {!attendee.is_internal && (
                            <span className="text-xs text-blue-600">(External)</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
