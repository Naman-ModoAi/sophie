-- Migration: Clean up old meeting-based limit system
-- Date: 2026-01-29
-- Description: Remove old meeting limit fields and functions

-- Drop old usage tracking columns (keep for now, will drop in future migration after confirming credit system works)
-- ALTER TABLE public.users DROP COLUMN IF EXISTS meetings_used;
-- ALTER TABLE public.users DROP COLUMN IF EXISTS usage_reset_at;

-- Note: Keeping old columns for now to allow rollback if needed
-- They can be safely dropped after confirming credit system works in production

-- Drop old functions (if they exist)
DROP FUNCTION IF EXISTS public.check_usage_limit(UUID);
DROP FUNCTION IF EXISTS public.increment_usage(UUID);

-- Update the reset_monthly_usage function to only handle credit resets
-- (This replaces the function created in 20260126_001_add_token_tracking.sql)
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Just call the new credit reset function
  PERFORM reset_monthly_credits();

  -- Also reset token counters
  UPDATE public.users
  SET
    tokens_used_this_month = 0,
    last_token_reset_at = DATE_TRUNC('month', NOW());

  RAISE NOTICE 'Reset tokens and credits for all users';
END;
$$;

COMMENT ON FUNCTION public.reset_monthly_usage IS 'Monthly reset of both credits and token counters (calls reset_monthly_credits)';
