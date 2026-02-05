-- ============================================================================
-- Add manual edit tracking for attendees
-- Migration: 24_add_manual_edit_tracking
-- Description: Track when attendee names are manually edited to prevent overwriting
-- ============================================================================

-- Add columns to track manual edits
ALTER TABLE public.attendees
ADD COLUMN IF NOT EXISTS name_manually_edited BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS company_manually_edited BOOLEAN DEFAULT FALSE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_attendees_name_manually_edited
ON public.attendees(name_manually_edited)
WHERE name_manually_edited = TRUE;

-- Add comments
COMMENT ON COLUMN public.attendees.name_manually_edited
IS 'TRUE if user has manually edited the name (prevents calendar sync from overwriting)';

COMMENT ON COLUMN public.attendees.company_manually_edited
IS 'TRUE if user has manually edited the company (prevents calendar sync from overwriting)';
