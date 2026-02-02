import { getAuthUser, createClient } from '@/lib/supabase/server';
import { syncCalendar } from './actions';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { redirect } from 'next/navigation';

async function getMeetings(userId: string) {
  try {
    const supabase = await createClient();

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
  const user = await getAuthUser();

  if (!user) {
    redirect('/');
  }

  console.log('[Dashboard] User authenticated:', user.id);

  // Auto-sync calendar on page load
  try {
    await syncCalendar(user.id, 7);
  } catch (error: any) {
    console.error('Auto-sync failed:', error.message);
  }

  const meetings = await getMeetings(user.id);

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

      <DashboardClient meetings={meetings} userId={user.id} />
    </div>
  );
}
