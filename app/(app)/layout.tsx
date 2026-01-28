import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { AppShell } from '@/components/layout/AppShell';
import { ToastProvider } from '@/contexts/ToastContext';

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

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <ToastProvider>
      <AppShell userEmail={session.email}>{children}</AppShell>
    </ToastProvider>
  );
}
