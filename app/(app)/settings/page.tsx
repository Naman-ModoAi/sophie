import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SettingsClient from '@/components/settings/SettingsClient';

export default async function SettingsPage() {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    redirect('/');
  }

  const supabase = await createClient();

  // Fetch user data
  const { data: user, error } = await supabase
    .from('users')
    .select('email, plan_type, email_timing, meetings_used')
    .eq('id', session.userId)
    .single();

  if (error || !user) {
    console.error('Failed to fetch user:', error);
    redirect('/dashboard');
  }

  // Fetch OAuth token status
  const { data: token } = await supabase
    .from('oauth_tokens')
    .select('expires_at')
    .eq('user_id', session.userId)
    .single();

  const calendarConnected = !!token;
  const tokenExpired = token ? new Date(token.expires_at) < new Date() : false;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-text mb-2">Settings</h1>
      <p className="text-text/70 mb-8">Manage your account preferences and subscription</p>

      <SettingsClient
        user={user}
        calendarConnected={calendarConnected}
        tokenExpired={tokenExpired}
      />
    </div>
  );
}
