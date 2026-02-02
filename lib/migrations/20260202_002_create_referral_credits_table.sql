-- Migration: Create referral_credits table
-- Date: 2026-02-02
-- Description: Track credits awarded from referrals

CREATE TABLE IF NOT EXISTS public.referral_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,

  -- Credit details
  credit_type TEXT NOT NULL CHECK (credit_type IN ('meeting_credit', 'subscription_extension')),
  amount INTEGER NOT NULL CHECK (amount > 0),

  -- Timestamps
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_referral_credits_user_id ON public.referral_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_credits_referral_id ON public.referral_credits(referral_id);

-- Index for finding active (non-expired) credits
CREATE INDEX IF NOT EXISTS idx_referral_credits_active
  ON public.referral_credits(user_id, expires_at)
  WHERE expires_at IS NULL OR expires_at > NOW();

-- Enable RLS
ALTER TABLE public.referral_credits ENABLE ROW LEVEL SECURITY;

-- Users can view their own referral credits
CREATE POLICY "Users can view their own referral credits"
  ON public.referral_credits
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage referral credits
CREATE POLICY "Service can manage referral credits"
  ON public.referral_credits
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE public.referral_credits IS 'Track credits awarded from completed referrals';
COMMENT ON COLUMN public.referral_credits.credit_type IS 'Type of credit: meeting_credit (for Free users) or subscription_extension (for Pro users)';
COMMENT ON COLUMN public.referral_credits.amount IS 'Number of credits or months awarded';
COMMENT ON COLUMN public.referral_credits.expires_at IS 'When credits expire (NULL for subscription extensions)';
