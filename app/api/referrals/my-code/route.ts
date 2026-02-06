import { NextResponse } from 'next/server';
import { getAuthUser, createClient, createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Fetch user's referral data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('referral_code, total_referrals_completed, referral_credits_current_month')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Failed to fetch user referral data:', userError);
      return NextResponse.json({ error: 'Failed to fetch referral data' }, { status: 500 });
    }

    // Generate referral code if missing (handles users created before trigger was added)
    let referralCode = userData.referral_code;
    if (!referralCode) {
      const serviceSupabase = await createServiceClient();
      const { data: codeData, error: codeError } = await serviceSupabase
        .rpc('generate_referral_code');

      if (codeError || !codeData) {
        console.error('Failed to generate referral code:', codeError);
        return NextResponse.json({ error: 'Failed to generate referral code' }, { status: 500 });
      }

      referralCode = codeData as string;

      const { error: updateError } = await serviceSupabase
        .from('users')
        .update({ referral_code: referralCode })
        .eq('id', user.id);

      if (updateError) {
        console.error('Failed to save referral code:', updateError);
        return NextResponse.json({ error: 'Failed to save referral code' }, { status: 500 });
      }
    }

    // Count pending referrals (signed_up but not completed)
    const { count: pendingCount, error: countError } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_user_id', user.id)
      .in('status', ['pending', 'signed_up']);

    if (countError) {
      console.error('Failed to count pending referrals:', countError);
      return NextResponse.json({ error: 'Failed to fetch referral stats' }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const referralLink = `${appUrl}/ref/${referralCode}`;

    return NextResponse.json({
      code: referralCode,
      referral_link: referralLink,
      total_completed: userData.total_referrals_completed,
      pending_count: pendingCount || 0,
      credits_earned: userData.referral_credits_current_month,
    });
  } catch (error) {
    console.error('Referral my-code error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
