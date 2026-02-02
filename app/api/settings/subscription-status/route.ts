import { NextResponse } from 'next/server';
import { getAuthUser, createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Fetch subscription status
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('status, cancel_at_period_end, current_period_end')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Failed to fetch subscription:', error);
      return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
    }

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Subscription status check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
