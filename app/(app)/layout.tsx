import { redirect } from 'next/navigation';
import { getAuthUser, createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/layout/AppShell';
import { ToastProvider } from '@/contexts/ToastContext';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  if (!user) {
    redirect('/');
  }

  // Get user email from our users table (or use auth email as fallback)
  const supabase = await createClient();
  const { data: userData } = await supabase
    .from('users')
    .select('email')
    .eq('id', user.id)
    .single();

  const userEmail = userData?.email || user.email || '';

  return (
    <ToastProvider>
      <AppShell userEmail={userEmail}>{children}</AppShell>
    </ToastProvider>
  );
}
