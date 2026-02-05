-- ============================================================================
-- Add email_timing column to users table
-- Migration: 22_add_email_timing_column
-- Description: Adds email_timing preference for prep note delivery
-- ============================================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS email_timing TEXT DEFAULT 'digest'
  CHECK (email_timing IN ('immediate', '1hr', '30min', 'digest'));

COMMENT ON COLUMN public.users.email_timing IS 'User preference for prep note email delivery timing';
