import { getAuthUser, createClient, createServiceClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ReferralDashboard from '@/components/referrals/ReferralDashboard';

export const dynamic = 'force-dynamic';

export default async function ReferralsPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/');
  }

  const supabase = await createClient();

  // Run all queries in parallel
  const [userResult, pendingCountResult, pendingResult, completedResult, creditsResult] = await Promise.all([
    supabase
      .from('users')
      .select('referral_code, total_referrals_completed, referral_credits_current_month, plan_type')
      .eq('id', user.id)
      .single(),
    supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_user_id', user.id)
      .in('status', ['pending', 'signed_up']),
    supabase
      .from('referrals')
      .select('id, referred_email, status, signed_up_at, created_at')
      .eq('referrer_user_id', user.id)
      .in('status', ['pending', 'signed_up'])
      .order('created_at', { ascending: false }),
    supabase
      .from('referrals')
      .select(`
        id,
        referred_user_id,
        completed_at,
        users!referrals_referred_user_id_fkey (
          email,
          name
        )
      `)
      .eq('referrer_user_id', user.id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false }),
    supabase
      .from('referral_credits')
      .select('credit_type, amount, earned_at')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false }),
  ]);

  const userData = userResult.data;

  // Generate referral code if missing
  let referralCode = userData?.referral_code;
  if (!referralCode) {
    const serviceSupabase = await createServiceClient();
    const { data: codeData } = await serviceSupabase.rpc('generate_referral_code');
    if (codeData) {
      referralCode = codeData as string;
      await serviceSupabase
        .from('users')
        .update({ referral_code: referralCode })
        .eq('id', user.id);
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const isPro = userData?.plan_type === 'pro';
  const totalCompleted = userData?.total_referrals_completed ?? 0;

  const referralData = {
    code: referralCode || '',
    referral_link: `${appUrl}/ref/${referralCode}`,
    total_completed: totalCompleted,
    pending_count: pendingCountResult.count || 0,
    credits_earned: userData?.referral_credits_current_month ?? 0,
  };

  const stats = {
    pending_referrals: pendingResult.data || [],
    completed_referrals: completedResult.data || [],
    credits_breakdown: creditsResult.data || [],
    next_milestone: isPro
      ? { target: 5, current: totalCompleted % 5, reward: '1 free month' }
      : null,
  };

  return <ReferralDashboard referralData={referralData} stats={stats} />;
}
