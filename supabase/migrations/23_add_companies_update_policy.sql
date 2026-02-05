-- ============================================================================
-- Add UPDATE policy for companies table
-- Migration: 23_add_companies_update_policy
-- Description: Allow users to update company information for their meetings
-- ============================================================================

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Users can update companies from their meetings" ON public.companies;

-- Create UPDATE policy for companies
-- Users can update companies that are linked to attendees in their meetings
CREATE POLICY "Users can update companies from their meetings"
  ON public.companies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.attendees a
      INNER JOIN public.meetings m ON m.id = a.meeting_id
      WHERE a.company_id = companies.id
        AND m.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.attendees a
      INNER JOIN public.meetings m ON m.id = a.meeting_id
      WHERE a.company_id = companies.id
        AND m.user_id = auth.uid()
    )
  );

COMMENT ON POLICY "Users can update companies from their meetings" ON public.companies
  IS 'Allow users to update company information for companies linked to their meeting attendees';
