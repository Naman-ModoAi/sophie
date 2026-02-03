import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import ReferralLanding from '@/components/referrals/ReferralLanding';

export const dynamic = 'force-dynamic';

export default async function ReferralPage({ params }: { params: { code: string } }) {
  try {
    const { code } = params;

    if (!code) {
      redirect('/');
    }

    // Set cookie first (before any database queries)
    const cookieStore = await cookies();
    cookieStore.set('referral_code', code, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    // Show generic landing page without referrer name
    // (Avoids needing anonymous database access)
    return <ReferralLanding referrerName="a colleague" />;
  } catch (error) {
    console.error('[Referral Page Error]:', error);
    redirect('/');
  }
}
