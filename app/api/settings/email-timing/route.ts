import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email_timing } = await request.json();

    // Validate email_timing value
    const validOptions = ['immediate', '1hr', '30min', 'digest'];
    if (!validOptions.includes(email_timing)) {
      return NextResponse.json({ error: 'Invalid email_timing value' }, { status: 400 });
    }

    // Check if user is trying to set Pro-only option
    const supabase = createClient();
    const { data: user } = await supabase
      .from('users')
      .select('plan_type')
      .eq('id', session.userId)
      .single();

    if (email_timing === 'immediate' && user?.plan_type !== 'pro') {
      return NextResponse.json({ error: 'Immediate delivery requires Pro plan' }, { status: 403 });
    }

    // Update user email_timing
    const { error } = await supabase
      .from('users')
      .update({ email_timing })
      .eq('id', session.userId);

    if (error) {
      console.error('Failed to update email_timing:', error);
      return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email timing update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
