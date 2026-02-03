-- Migration: Add credit tracking to users table
-- Date: 2026-01-29
-- Description: Add credit balance and usage tracking columns to users table

-- Add credit tracking columns
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS credits_balance INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS credits_used_this_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_credit_reset_at TIMESTAMPTZ DEFAULT DATE_TRUNC('month', NOW());

-- Add index for users with low credits (for monitoring)
CREATE INDEX IF NOT EXISTS idx_users_low_credits
  ON public.users(credits_balance)
  WHERE credits_balance < 5;

COMMENT ON COLUMN public.users.credits_balance IS 'Current available credits for research';
COMMENT ON COLUMN public.users.credits_used_this_month IS 'Credits consumed in current billing period';
COMMENT ON COLUMN public.users.last_credit_reset_at IS 'Last time credits were reset/allocated';
