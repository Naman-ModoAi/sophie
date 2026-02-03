-- Migration: Add email timing preference to users
-- Date: 2026-01-23
-- Description: Add email_timing column for email delivery preferences

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS email_timing TEXT DEFAULT 'digest'
CHECK (email_timing IN ('immediate', '1hr', '30min', 'digest'));

COMMENT ON COLUMN public.users.email_timing IS 'Email delivery preference: immediate (Pro only), 1hr, 30min, or morning digest';
