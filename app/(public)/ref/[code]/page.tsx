import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import ReferralLanding from '@/components/referrals/ReferralLanding';

export const dynamic = 'force-dynamic';

export default async function ReferralPage({ params }: { params: { code: string } }) {
  const { code } = params;

  // Validate referral code
  const supabase = await createClient();
  const { data: referrer } = await supabase
    .from('users')
    .select('name, email, referral_code')
    .eq('referral_code', code)
    .single();

  if (!referrer) {
    // Invalid code, redirect to home
    redirect('/');
  }

  // Set cookie for 30 days
  const cookieStore = await cookies();
  cookieStore.set('referral_code', code, {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  return <ReferralLanding referrerName={referrer.name || referrer.email} />;
}
