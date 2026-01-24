-- Migration: Add usage tracking to users
-- Date: 2026-01-23
-- Description: Add meetings_used and usage_reset_at for free plan limits

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS meetings_used INTEGER DEFAULT 0;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS usage_reset_at TIMESTAMPTZ DEFAULT DATE_TRUNC('month', NOW() + INTERVAL '1 month');

COMMENT ON COLUMN public.users.meetings_used IS 'Number of meetings researched this month (free plan: max 5)';
COMMENT ON COLUMN public.users.usage_reset_at IS 'When the usage counter resets (first of next month)';
