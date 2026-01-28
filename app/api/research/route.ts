import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { ResearchOrchestrator } from '@/lib/research/agents/orchestrator';

export async function POST(request: NextRequest) {
  try {
    const { meeting_id } = await request.json();

    if (!meeting_id) {
      return NextResponse.json(
        { error: 'meeting_id is required' },
        { status: 400 }
      );
    }

    // Verify meeting exists and user has access (optional security check)
    const supabase = await createServiceClient();
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id, user_id, title')
      .eq('id', meeting_id)
      .single();

    if (meetingError || !meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    // Call local TypeScript research agent
    console.log(`[Research API] Triggering research for meeting: ${meeting_id}`);

    const orchestrator = new ResearchOrchestrator();
    const result = await orchestrator.researchMeeting(meeting_id);

    console.log(`[Research API] Research completed for: ${meeting.title}`);

    return NextResponse.json({
      success: true,
      message: 'Research completed successfully',
      meeting_id,
      result
    });

  } catch (error: any) {
    console.error('[Research API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Optional: GET to check status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const meeting_id = searchParams.get('meeting_id');

  if (!meeting_id) {
    return NextResponse.json(
      { error: 'meeting_id is required' },
      { status: 400 }
    );
  }

  try {
    const supabase = await createServiceClient();

    // Get meeting status
    const { data: meeting } = await supabase
      .from('meetings')
      .select('id, title, status')
      .eq('id', meeting_id)
      .single();

    // Get prep note if available
    const { data: prepNote } = await supabase
      .from('prep_notes')
      .select('content, created_at')
      .eq('meeting_id', meeting_id)
      .single();

    return NextResponse.json({
      meeting_id,
      status: meeting?.status || 'unknown',
      has_prep_note: !!prepNote,
      prep_note: prepNote?.content,
      created_at: prepNote?.created_at
    });

  } catch (error: any) {
    console.error('[Research API] Error fetching status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch research status', details: error.message },
      { status: 500 }
    );
  }
}
