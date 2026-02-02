import { getAuthUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ReferralDashboard from '@/components/referrals/ReferralDashboard';

export const dynamic = 'force-dynamic';

export default async function ReferralsPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/');
  }

  return <ReferralDashboard userId={user.id} />;
}
