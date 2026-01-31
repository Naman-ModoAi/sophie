import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { createServiceClient } from '@/lib/supabase/server';
import { syncCalendar } from './actions';
import { DashboardClient } from '@/components/dashboard/DashboardClient';

async function getSession() {
  const cookieStore = await cookies();
  const response = new Response();
  const session = await getIronSession<SessionData>(
    { headers: { cookie: cookieStore.toString() } } as any,
    response,
    sessionOptions
  );

  return session;
}

async function getMeetings(userId: string) {
  try {
    const supabase = await createServiceClient();

    console.log('Fetching meetings for user:', userId);

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
      .limit(50);

    if (error) {
      console.error('Meetings query error:', error);
      return [];
    }

    console.log('Found meetings:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return [];
  }
}

export default async function Dashboard() {
  const session = await getSession();

  console.log('[Dashboard] Session data:', {
    isLoggedIn: session.isLoggedIn,
    userId: session.userId,
    email: session.email
  });

  // Auto-sync calendar on page load
  try {
    await syncCalendar(session.userId, 7);
  } catch (error: any) {
    console.error('Auto-sync failed:', error.message);
  }

  const meetings = await getMeetings(session.userId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text">
          Upcoming Meetings
        </h2>
        <p className="text-sm text-text/60 mt-1">
          Next 7 days • Auto-synced with Google Calendar
        </p>
      </div>

      <DashboardClient meetings={meetings} userId={session.userId} />
    </div>
  );
}
