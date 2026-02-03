import { NextResponse } from 'next/server';
import { getAuthUser, createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Fetch pending referrals
    const { data: pendingReferrals, error: pendingError } = await supabase
      .from('referrals')
      .select('id, referred_email, status, signed_up_at, created_at')
      .eq('referrer_user_id', user.id)
      .in('status', ['pending', 'signed_up'])
      .order('created_at', { ascending: false });

    if (pendingError) {
      console.error('Failed to fetch pending referrals:', pendingError);
      return NextResponse.json({ error: 'Failed to fetch referrals' }, { status: 500 });
    }

    // Fetch completed referrals with user details
    const { data: completedReferrals, error: completedError } = await supabase
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
      .order('completed_at', { ascending: false });

    if (completedError) {
      console.error('Failed to fetch completed referrals:', completedError);
      return NextResponse.json({ error: 'Failed to fetch referrals' }, { status: 500 });
    }

    // Fetch credits breakdown
    const { data: creditsData, error: creditsError } = await supabase
      .from('referral_credits')
      .select('credit_type, amount, earned_at')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false });

    if (creditsError) {
      console.error('Failed to fetch referral credits:', creditsError);
      return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 });
    }

    // Get user plan and calculate next milestone
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('total_referrals_completed, plan_type')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Failed to fetch user data:', userError);
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }

    // Calculate next milestone (for Pro users, every 5 referrals = free month)
    const isPro = userData.plan_type === 'pro';
    const nextMilestone = isPro
      ? {
          target: 5,
          current: userData.total_referrals_completed % 5,
          reward: '1 free month',
        }
      : null;

    return NextResponse.json({
      pending_referrals: pendingReferrals || [],
      completed_referrals: completedReferrals || [],
      credits_breakdown: creditsData || [],
      next_milestone: nextMilestone,
    });
  } catch (error) {
    console.error('Referral stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
