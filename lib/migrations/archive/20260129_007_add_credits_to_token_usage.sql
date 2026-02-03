-- Migration: Add credits_consumed to token_usage table
-- Date: 2026-01-29
-- Description: Track credit consumption alongside token usage

-- Add credits_consumed column to token_usage
ALTER TABLE public.token_usage
ADD COLUMN IF NOT EXISTS credits_consumed INTEGER DEFAULT 0;

-- Add index for querying credit consumption
CREATE INDEX IF NOT EXISTS idx_token_usage_credits
  ON public.token_usage(credits_consumed)
  WHERE credits_consumed > 0;

-- Add index for aggregating credits by user
CREATE INDEX IF NOT EXISTS idx_token_usage_user_credits
  ON public.token_usage(user_id, credits_consumed);

COMMENT ON COLUMN public.token_usage.credits_consumed IS 'Number of credits consumed for this research operation';
