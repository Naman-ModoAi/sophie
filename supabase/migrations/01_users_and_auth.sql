-- ============================================================================
-- PrepFor.app - Users and Authentication
-- Migration: 01_users_and_auth
-- Description: User profiles, OAuth tokens, and referral tracking
-- ============================================================================

-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_user_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  profile_photo_url TEXT,

  -- Plan and subscription
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'pro')),

  -- Credit tracking
  credits_balance INTEGER DEFAULT 10,
  credits_used_this_month INTEGER DEFAULT 0,
  last_credit_reset_at TIMESTAMPTZ DEFAULT DATE_TRUNC('month', NOW()),

  -- Token usage tracking
  tokens_used_this_month INTEGER DEFAULT 0,
  total_tokens_used BIGINT DEFAULT 0,
  last_token_reset_at TIMESTAMPTZ DEFAULT DATE_TRUNC('month', NOW()),

  -- Referral system
  referral_code TEXT UNIQUE,
  total_referrals_completed INTEGER DEFAULT 0,
  referral_credits_current_month INTEGER DEFAULT 0,
  subscription_extension_months INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_user_id ON public.users(google_user_id);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_low_credits ON public.users(credits_balance) WHERE credits_balance < 5;

-- Comments
COMMENT ON TABLE public.users IS 'User profiles synced with Supabase Auth';
COMMENT ON COLUMN public.users.credits_balance IS 'Current available credits for research';
COMMENT ON COLUMN public.users.credits_used_this_month IS 'Credits consumed in current billing period';
COMMENT ON COLUMN public.users.referral_code IS 'Unique referral code for this user (generated on signup)';
COMMENT ON COLUMN public.users.total_referrals_completed IS 'Total number of completed referrals (first prep note generated)';
COMMENT ON COLUMN public.users.referral_credits_current_month IS 'Referral credits earned this month (Free users only)';
COMMENT ON COLUMN public.users.subscription_extension_months IS 'Free months earned from referrals (Pro users only)';

-- ============================================================================
-- OAUTH_TOKENS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT DEFAULT 'google',
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user_id ON public.oauth_tokens(user_id);

-- Comments
COMMENT ON TABLE public.oauth_tokens IS 'OAuth tokens for Google Calendar API access';
