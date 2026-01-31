import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Fetch subscription status
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('status, cancel_at_period_end, current_period_end')
      .eq('user_id', session.userId)
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
