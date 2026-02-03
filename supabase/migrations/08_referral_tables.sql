-- Migration: Referral System Tables
-- Description: Create referrals and referral_credits tables with indexes

-- ============================================================================
-- TABLES
-- ============================================================================

-- Referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'completed')),
  referred_email TEXT,
  clicked_at TIMESTAMPTZ,
  signed_up_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_user_id ON public.referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON public.referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referral_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_pending ON public.referrals(referred_user_id, status) WHERE status = 'pending' OR status = 'signed_up';

-- Referral credits table
CREATE TABLE IF NOT EXISTS public.referral_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  credit_type TEXT NOT NULL CHECK (credit_type IN ('meeting_credit', 'subscription_extension')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_credits_user_id ON public.referral_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_credits_referral_id ON public.referral_credits(referral_id);
CREATE INDEX IF NOT EXISTS idx_referral_credits_expires_at ON public.referral_credits(user_id, expires_at);

-- Add referral columns to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS total_referrals_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS referral_credits_current_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS subscription_extension_months INTEGER DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    v_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8));
    SELECT EXISTS(SELECT 1 FROM public.users WHERE referral_code = v_code) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;
  RETURN v_code;
END;
$$;

-- Award referral credits
CREATE OR REPLACE FUNCTION public.award_referral_credits(p_referral_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referrer_id UUID;
  v_referred_id UUID;
  v_referrer_plan TEXT;
  v_referrer_referral_count INTEGER;
  v_expires_at TIMESTAMPTZ;
BEGIN
  SELECT referrer_user_id, referred_user_id INTO v_referrer_id, v_referred_id
  FROM public.referrals WHERE id = p_referral_id AND status = 'signed_up';

  IF NOT FOUND THEN RETURN FALSE; END IF;

  SELECT COALESCE(p.name, 'free') INTO v_referrer_plan
  FROM public.users u
  LEFT JOIN public.subscriptions s ON u.id = s.user_id AND s.status = 'active'
  LEFT JOIN public.plans p ON s.plan_id = p.id
  WHERE u.id = v_referrer_id;

  v_expires_at := DATE_TRUNC('month', NOW()) + INTERVAL '1 month';

  IF v_referrer_plan IN ('pro', 'enterprise') THEN
    SELECT total_referrals_completed INTO v_referrer_referral_count FROM public.users WHERE id = v_referrer_id;
    IF (v_referrer_referral_count + 1) % 5 = 0 THEN
      INSERT INTO public.referral_credits (user_id, referral_id, credit_type, amount, expires_at)
      VALUES (v_referrer_id, p_referral_id, 'subscription_extension', 1, NULL);
      UPDATE public.users SET subscription_extension_months = subscription_extension_months + 1 WHERE id = v_referrer_id;
    END IF;
  ELSE
    INSERT INTO public.referral_credits (user_id, referral_id, credit_type, amount, expires_at)
    VALUES (v_referrer_id, p_referral_id, 'meeting_credit', 2, v_expires_at);
    UPDATE public.users SET referral_credits_current_month = referral_credits_current_month + 2 WHERE id = v_referrer_id;
  END IF;

  INSERT INTO public.referral_credits (user_id, referral_id, credit_type, amount, expires_at)
  VALUES (v_referred_id, p_referral_id, 'meeting_credit', 3, v_expires_at);
  UPDATE public.users SET referral_credits_current_month = referral_credits_current_month + 3 WHERE id = v_referred_id;

  UPDATE public.referrals SET status = 'completed', completed_at = NOW(), updated_at = NOW() WHERE id = p_referral_id;
  UPDATE public.users SET total_referrals_completed = total_referrals_completed + 1 WHERE id = v_referrer_id;

  RETURN TRUE;
END;
$$;

-- Check and complete referral
CREATE OR REPLACE FUNCTION public.check_and_complete_referral(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referral_id UUID;
BEGIN
  SELECT id INTO v_referral_id FROM public.referrals
  WHERE referred_user_id = p_user_id AND status = 'signed_up' LIMIT 1;

  IF NOT FOUND THEN RETURN FALSE; END IF;

  RETURN award_referral_credits(v_referral_id);
END;
$$;

-- Generate referral codes for existing users
UPDATE public.users SET referral_code = public.generate_referral_code() WHERE referral_code IS NULL;

-- Comments
COMMENT ON TABLE public.referrals IS 'Track referral relationships and completion status';
COMMENT ON TABLE public.referral_credits IS 'Track credits awarded from completed referrals';
COMMENT ON FUNCTION public.generate_referral_code() IS 'Generate unique 8-character referral code';
COMMENT ON FUNCTION public.award_referral_credits(UUID) IS 'Award credits to both users on referral completion';
COMMENT ON FUNCTION public.check_and_complete_referral(UUID) IS 'Check and complete referral on first prep note';
