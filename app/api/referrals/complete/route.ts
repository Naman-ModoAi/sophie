import { NextResponse } from 'next/server';
import { getAuthUser, createServiceClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_id } = await request.json();

    // Validate user_id matches authenticated user (security check)
    if (user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Use service client to call referral completion function
    const supabase = await createServiceClient();

    const { data, error } = await supabase.rpc('check_and_complete_referral', {
      p_user_id: user_id,
    });

    if (error) {
      console.error('Failed to complete referral:', error);
      return NextResponse.json({ error: 'Failed to complete referral' }, { status: 500 });
    }

    // data is boolean - true if referral was completed, false if none found
    return NextResponse.json({
      success: true,
      referral_completed: data,
    });
  } catch (error) {
    console.error('Referral complete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
