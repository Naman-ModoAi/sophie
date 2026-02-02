-- Migration: Create referral management functions
-- Date: 2026-02-02
-- Description: Database functions for referral code generation and credit distribution

-- ============================================================================
-- Function: generate_referral_code
-- Description: Generate unique 8-character alphanumeric referral code
-- ============================================================================
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character random alphanumeric code
    v_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8));

    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.users WHERE referral_code = v_code) INTO v_exists;

    -- Exit loop if unique
    EXIT WHEN NOT v_exists;
  END LOOP;

  RETURN v_code;
END;
$$;

-- ============================================================================
-- Function: award_referral_credits
-- Description: Award credits to referrer and referred user on referral completion
-- ============================================================================
CREATE OR REPLACE FUNCTION public.award_referral_credits(
  p_referral_id UUID
)
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
  -- Get referral details
  SELECT referrer_user_id, referred_user_id
  INTO v_referrer_id, v_referred_id
  FROM public.referrals
  WHERE id = p_referral_id AND status = 'signed_up';

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Get referrer's plan type
  SELECT COALESCE(p.name, 'free')
  INTO v_referrer_plan
  FROM public.users u
  LEFT JOIN public.subscriptions s ON u.id = s.user_id AND s.status = 'active'
  LEFT JOIN public.plans p ON s.plan_id = p.id
  WHERE u.id = v_referrer_id;

  -- Set expiration for meeting credits (end of current month)
  v_expires_at := DATE_TRUNC('month', NOW()) + INTERVAL '1 month';

  -- Award credits based on referrer's plan
  IF v_referrer_plan IN ('pro', 'enterprise') THEN
    -- Pro users: Check if earned 5th referral for free month
    SELECT total_referrals_completed INTO v_referrer_referral_count
    FROM public.users
    WHERE id = v_referrer_id;

    -- Award subscription extension every 5 referrals
    IF (v_referrer_referral_count + 1) % 5 = 0 THEN
      INSERT INTO public.referral_credits (user_id, referral_id, credit_type, amount, expires_at)
      VALUES (v_referrer_id, p_referral_id, 'subscription_extension', 1, NULL);

      -- Update user's subscription extension count
      UPDATE public.users
      SET subscription_extension_months = subscription_extension_months + 1
      WHERE id = v_referrer_id;
    END IF;
  ELSE
    -- Free users: +2 meeting credits
    INSERT INTO public.referral_credits (user_id, referral_id, credit_type, amount, expires_at)
    VALUES (v_referrer_id, p_referral_id, 'meeting_credit', 2, v_expires_at);

    -- Update user's current month referral credits
    UPDATE public.users
    SET referral_credits_current_month = referral_credits_current_month + 2
    WHERE id = v_referrer_id;
  END IF;

  -- Award referred user +3 bonus credits
  INSERT INTO public.referral_credits (user_id, referral_id, credit_type, amount, expires_at)
  VALUES (v_referred_id, p_referral_id, 'meeting_credit', 3, v_expires_at);

  UPDATE public.users
  SET referral_credits_current_month = referral_credits_current_month + 3
  WHERE id = v_referred_id;

  -- Update referral status and referrer's total count
  UPDATE public.referrals
  SET status = 'completed', completed_at = NOW(), updated_at = NOW()
  WHERE id = p_referral_id;

  UPDATE public.users
  SET total_referrals_completed = total_referrals_completed + 1
  WHERE id = v_referrer_id;

  RETURN TRUE;
END;
$$;

-- ============================================================================
-- Function: check_and_complete_referral
-- Description: Check if user has pending referral and complete it on first prep note
-- ============================================================================
CREATE OR REPLACE FUNCTION public.check_and_complete_referral(
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referral_id UUID;
BEGIN
  -- Find pending referral for this user
  SELECT id INTO v_referral_id
  FROM public.referrals
  WHERE referred_user_id = p_user_id
    AND status = 'signed_up'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Award credits
  RETURN award_referral_credits(v_referral_id);
END;
$$;

COMMENT ON FUNCTION public.generate_referral_code() IS 'Generate unique 8-character referral code';
COMMENT ON FUNCTION public.award_referral_credits(UUID) IS 'Award credits to both users on referral completion';
COMMENT ON FUNCTION public.check_and_complete_referral(UUID) IS 'Check and complete referral on first prep note';
