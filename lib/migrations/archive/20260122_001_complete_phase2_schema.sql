-- Migration: Complete Phase 2 Database Schema
-- Date: 2026-01-22
-- Description: Add all missing tables and columns for AI research agent
-- Order: Creates tables/columns first, then adds RLS policies that reference them

-- ============================================================================
-- STEP 1: CREATE COMPANIES TABLE (no dependencies)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain TEXT UNIQUE NOT NULL,
    name TEXT,
    research_data JSONB,
    last_researched TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_domain ON public.companies(domain);
CREATE INDEX IF NOT EXISTS idx_companies_last_researched ON public.companies(last_researched);

COMMENT ON TABLE public.companies IS 'Company information cache for research results';
COMMENT ON COLUMN public.companies.domain IS 'Company email domain (unique identifier)';
COMMENT ON COLUMN public.companies.research_data IS 'Cached company research from AI agent';

-- ============================================================================
-- STEP 2: ADD MISSING COLUMNS TO MEETINGS TABLE
-- ============================================================================

ALTER TABLE public.meetings
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'
CHECK (status IN ('pending', 'researching', 'ready', 'skipped'));

CREATE INDEX IF NOT EXISTS idx_meetings_status ON public.meetings(status);

COMMENT ON COLUMN public.meetings.status IS 'Research status: pending, researching, ready, skipped';

-- ============================================================================
-- STEP 3: ADD MISSING COLUMNS TO ATTENDEES TABLE
-- ============================================================================
-- IMPORTANT: Must happen BEFORE RLS policies that reference these columns

ALTER TABLE public.attendees
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL;

ALTER TABLE public.attendees
ADD COLUMN IF NOT EXISTS research_data JSONB;

CREATE INDEX IF NOT EXISTS idx_attendees_company_id ON public.attendees(company_id);
CREATE INDEX IF NOT EXISTS idx_attendees_domain ON public.attendees(domain);

COMMENT ON COLUMN public.attendees.company_id IS 'Reference to company (from email domain)';
COMMENT ON COLUMN public.attendees.research_data IS 'Cached person research (7-day cache)';

-- ============================================================================
-- STEP 4: CREATE PREP_NOTES TABLE (depends on meetings)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.prep_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    content JSONB NOT NULL,
    content_html TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(meeting_id)
);

CREATE INDEX IF NOT EXISTS idx_prep_notes_meeting_id ON public.prep_notes(meeting_id);
CREATE INDEX IF NOT EXISTS idx_prep_notes_created_at ON public.prep_notes(created_at DESC);

COMMENT ON TABLE public.prep_notes IS 'AI-generated meeting preparation notes';
COMMENT ON COLUMN public.prep_notes.content IS 'Structured prep note data (JSON)';
COMMENT ON COLUMN public.prep_notes.content_html IS 'Rendered HTML for email';

-- ============================================================================
-- STEP 5: CREATE EMAIL_QUEUE TABLE (depends on prep_notes)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.email_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prep_note_id UUID NOT NULL REFERENCES public.prep_notes(id) ON DELETE CASCADE,
    send_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_queue_user_id ON public.email_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON public.email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_send_at ON public.email_queue(send_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_pending ON public.email_queue(status, send_at)
    WHERE status = 'pending';

COMMENT ON TABLE public.email_queue IS 'Queue for scheduled email deliveries';
COMMENT ON COLUMN public.email_queue.send_at IS 'Scheduled send time';
COMMENT ON COLUMN public.email_queue.status IS 'pending, sent, failed';

-- ============================================================================
-- STEP 6: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prep_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 7: CREATE RLS POLICIES
-- ============================================================================
-- IMPORTANT: These policies reference attendees.company_id which NOW EXISTS

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read companies from their meetings" ON public.companies;
DROP POLICY IF EXISTS "Service role can manage companies" ON public.companies;
DROP POLICY IF EXISTS "Users can read their own prep notes" ON public.prep_notes;
DROP POLICY IF EXISTS "Service role can manage prep notes" ON public.prep_notes;
DROP POLICY IF EXISTS "Users can read their own email queue" ON public.email_queue;
DROP POLICY IF EXISTS "Service role can manage email queue" ON public.email_queue;

-- COMPANIES: Users can read companies from their meetings
CREATE POLICY "Users can read companies from their meetings"
ON public.companies FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.attendees a
        INNER JOIN public.meetings m ON m.id = a.meeting_id
        WHERE a.company_id = companies.id
        AND m.user_id = auth.uid()
    )
);

CREATE POLICY "Service role can manage companies"
ON public.companies FOR ALL
USING (auth.role() = 'service_role');

-- PREP_NOTES: Users can read their own prep notes
CREATE POLICY "Users can read their own prep notes"
ON public.prep_notes FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.meetings
        WHERE meetings.id = prep_notes.meeting_id
        AND meetings.user_id = auth.uid()
    )
);

CREATE POLICY "Service role can manage prep notes"
ON public.prep_notes FOR ALL
USING (auth.role() = 'service_role');

-- EMAIL_QUEUE: Users can read their own email queue
CREATE POLICY "Users can read their own email queue"
ON public.email_queue FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage email queue"
ON public.email_queue FOR ALL
USING (auth.role() = 'service_role');

-- ============================================================================
-- STEP 8: GRANT PERMISSIONS
-- ============================================================================

GRANT ALL ON TABLE public.companies TO authenticated, service_role;
GRANT ALL ON TABLE public.prep_notes TO authenticated, service_role;
GRANT ALL ON TABLE public.email_queue TO authenticated, service_role;

GRANT SELECT ON TABLE public.companies TO anon;
GRANT SELECT ON TABLE public.prep_notes TO anon;

-- ============================================================================
-- STEP 9: UPDATED_AT TRIGGERS
-- ============================================================================

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
DROP TRIGGER IF EXISTS update_prep_notes_updated_at ON public.prep_notes;
DROP TRIGGER IF EXISTS update_email_queue_updated_at ON public.email_queue;

-- Create triggers
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prep_notes_updated_at
    BEFORE UPDATE ON public.prep_notes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_queue_updated_at
    BEFORE UPDATE ON public.email_queue
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- STEP 10: HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_pending_emails(batch_size INT DEFAULT 10)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    prep_note_id UUID,
    send_at TIMESTAMP WITH TIME ZONE
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

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Tables created: companies, prep_notes, email_queue
-- Columns added: meetings.status, attendees.company_id, attendees.research_data
-- RLS policies, triggers, and helper functions configured
-- ============================================================================
