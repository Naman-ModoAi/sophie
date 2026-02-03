-- Migration: Add referral columns to users table
-- Date: 2026-02-02
-- Description: Add referral tracking columns to users table

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS total_referrals_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS referral_credits_current_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS subscription_extension_months INTEGER DEFAULT 0;

-- Create unique index on referral_code
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code);

COMMENT ON COLUMN public.users.referral_code IS 'Unique referral code for this user (generated on signup)';
COMMENT ON COLUMN public.users.total_referrals_completed IS 'Total number of completed referrals (first prep note generated)';
COMMENT ON COLUMN public.users.referral_credits_current_month IS 'Referral credits earned this month (Free users only)';
COMMENT ON COLUMN public.users.subscription_extension_months IS 'Free months earned from referrals (Pro users only)';
