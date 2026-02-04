-- ============================================================================
-- MeetReady - Meetings and Attendees
-- Migration: 02_meetings
-- Description: Calendar meetings, attendees, companies, and prep notes
-- ============================================================================

-- ============================================================================
-- MEETINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  calendar_event_id TEXT NOT NULL,
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  description TEXT,
  location TEXT,

  -- Meeting attributes
  is_external BOOLEAN DEFAULT FALSE,
  is_all_day BOOLEAN DEFAULT FALSE,
  is_cancelled BOOLEAN DEFAULT FALSE,

  -- Research workflow status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'researching', 'ready', 'skipped')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, calendar_event_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON public.meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_start_time ON public.meetings(start_time);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON public.meetings(status);

-- Comments
COMMENT ON TABLE public.meetings IS 'Calendar meetings synced from Google Calendar';
COMMENT ON COLUMN public.meetings.status IS 'Research status: pending, researching, ready, skipped';

-- ============================================================================
-- COMPANIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT UNIQUE NOT NULL,
  name TEXT,
  research_data JSONB,
  last_researched TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_companies_domain ON public.companies(domain);
CREATE INDEX IF NOT EXISTS idx_companies_last_researched ON public.companies(last_researched);

-- Comments
COMMENT ON TABLE public.companies IS 'Company information cache for research results';
COMMENT ON COLUMN public.companies.domain IS 'Company email domain (unique identifier)';
COMMENT ON COLUMN public.companies.research_data IS 'Cached company research from AI agent';

-- ============================================================================
-- ATTENDEES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  domain TEXT,
  is_internal BOOLEAN DEFAULT FALSE,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  research_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(meeting_id, email)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_attendees_meeting_id ON public.attendees(meeting_id);
CREATE INDEX IF NOT EXISTS idx_attendees_company_id ON public.attendees(company_id);
CREATE INDEX IF NOT EXISTS idx_attendees_domain ON public.attendees(domain);

-- Comments
COMMENT ON TABLE public.attendees IS 'Meeting participants with research data';
COMMENT ON COLUMN public.attendees.company_id IS 'Reference to company (from email domain)';
COMMENT ON COLUMN public.attendees.research_data IS 'Cached person research (7-day cache)';

-- ============================================================================
-- PREP_NOTES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.prep_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  content_html TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(meeting_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_prep_notes_meeting_id ON public.prep_notes(meeting_id);
CREATE INDEX IF NOT EXISTS idx_prep_notes_created_at ON public.prep_notes(created_at DESC);

-- Comments
COMMENT ON TABLE public.prep_notes IS 'AI-generated meeting preparation notes';
COMMENT ON COLUMN public.prep_notes.content IS 'Structured prep note data (JSON)';
COMMENT ON COLUMN public.prep_notes.content_html IS 'Rendered HTML for email';

-- ============================================================================
-- EMAIL_QUEUE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  prep_note_id UUID NOT NULL REFERENCES public.prep_notes(id) ON DELETE CASCADE,
  send_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_queue_user_id ON public.email_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON public.email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_send_at ON public.email_queue(send_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_pending ON public.email_queue(status, send_at) WHERE status = 'pending';

-- Comments
COMMENT ON TABLE public.email_queue IS 'Queue for scheduled email deliveries';
COMMENT ON COLUMN public.email_queue.send_at IS 'Scheduled send time';
COMMENT ON COLUMN public.email_queue.status IS 'pending, sent, failed';

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_meetings_updated_at ON public.meetings;
DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
DROP TRIGGER IF EXISTS update_prep_notes_updated_at ON public.prep_notes;
DROP TRIGGER IF EXISTS update_email_queue_updated_at ON public.email_queue;

CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prep_notes_updated_at
  BEFORE UPDATE ON public.prep_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_queue_updated_at
  BEFORE UPDATE ON public.email_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_pending_emails(batch_size INT DEFAULT 10)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  prep_note_id UUID,
  send_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT eq.id, eq.user_id, eq.prep_note_id, eq.send_at
  FROM public.email_queue eq
  WHERE eq.status = 'pending'
    AND eq.send_at <= NOW()
  ORDER BY eq.send_at ASC
  LIMIT batch_size;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_pending_emails IS 'Get batch of pending emails ready to send';
