import { NextResponse } from 'next/server';
import { getAuthUser, createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email_timing } = await request.json();

    // Validate email_timing value
    const validOptions = ['immediate', '1hr', '30min', 'digest'];
    if (!validOptions.includes(email_timing)) {
      return NextResponse.json({ error: 'Invalid email_timing value' }, { status: 400 });
    }

    // Check if user is trying to set Pro-only option
    const supabase = await createClient();
    const { data: userData } = await supabase
      .from('users')
      .select('plan_type')
      .eq('id', user.id)
      .single();

    if (email_timing === 'immediate' && userData?.plan_type !== 'pro') {
      return NextResponse.json({ error: 'Immediate delivery requires Pro plan' }, { status: 403 });
    }

    // Update user email_timing
    const { error } = await supabase
      .from('users')
      .update({ email_timing })
      .eq('id', user.id);

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
