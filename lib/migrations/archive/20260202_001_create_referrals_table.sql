-- Migration: Create referrals table
-- Date: 2026-02-02
-- Description: Track referral relationships and completion status

CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,

  -- Referral tracking
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'completed')),
  referred_email TEXT,

  -- Timestamps
  clicked_at TIMESTAMPTZ,
  signed_up_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_user_id ON public.referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON public.referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referral_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);

-- Index for finding pending referrals by referred user
CREATE INDEX IF NOT EXISTS idx_referrals_referred_pending
  ON public.referrals(referred_user_id, status)
  WHERE status = 'pending' OR status = 'signed_up';

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can view referrals where they are the referrer
CREATE POLICY "Users can view their own referrals"
  ON public.referrals
  FOR SELECT
  USING (auth.uid() = referrer_user_id);

-- Service role can manage referrals
CREATE POLICY "Service can manage referrals"
  ON public.referrals
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE public.referrals IS 'Track referral relationships and completion status';
COMMENT ON COLUMN public.referrals.status IS 'Referral status: pending (link clicked), signed_up (account created), completed (first prep note generated)';
COMMENT ON COLUMN public.referrals.referral_code IS 'The referral code used for this referral';
