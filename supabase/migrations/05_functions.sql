-- ============================================================================
-- MeetReady - Database Functions
-- Migration: 05_functions
-- Description: Credit management, token tracking, and referral functions
-- ============================================================================

-- ============================================================================
-- CREDIT MANAGEMENT FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_credit_balance(
  p_user_id UUID,
  p_credits_needed NUMERIC  -- NUMERIC for decimal precision (0.05 steps)
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance NUMERIC;
  v_is_pro BOOLEAN;
BEGIN
  -- Get user's current credits
  SELECT credits_balance INTO v_balance
  FROM public.users
  WHERE id = p_user_id;

  -- Check if user has active pro/enterprise subscription (unlimited credits)
  SELECT EXISTS(
    SELECT 1 FROM public.subscriptions s
    JOIN public.plans p ON s.plan_id = p.id
    WHERE s.user_id = p_user_id
      AND s.status = 'active'
      AND p.name IN ('pro', 'enterprise')
  ) INTO v_is_pro;

  -- Pro users have unlimited credits
  IF v_is_pro THEN
    RETURN TRUE;
  END IF;

  -- Check if user has enough credits
  RETURN v_balance >= p_credits_needed;
END;
$$;

COMMENT ON FUNCTION public.check_credit_balance IS 'Check if user has sufficient credits (Pro users have unlimited)';

-- ============================================================================

CREATE OR REPLACE FUNCTION public.consume_credits(
  p_user_id UUID,
  p_credits NUMERIC,  -- NUMERIC for decimal precision (0.05 steps)
  p_meeting_id UUID DEFAULT NULL,
  p_research_type TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance NUMERIC;
BEGIN
  -- Deduct credits atomically
  UPDATE public.users
  SET
    credits_balance = credits_balance - p_credits,
    credits_used_this_month = credits_used_this_month + p_credits
  WHERE id = p_user_id
    AND credits_balance >= p_credits
  RETURNING credits_balance INTO v_balance;

  -- If no rows updated, user didn't have enough credits
  IF v_balance IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION public.consume_credits IS 'Deduct credits from user balance atomically';

-- ============================================================================

CREATE OR REPLACE FUNCTION public.allocate_monthly_credits(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_monthly_credits NUMERIC;  -- NUMERIC for decimal precision
  v_rollover BOOLEAN;
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  -- Get user's plan details from active subscription
  SELECT p.monthly_credits, p.credits_rollover, u.credits_balance
  INTO v_monthly_credits, v_rollover, v_current_balance
  FROM public.users u
  LEFT JOIN public.subscriptions s ON s.user_id = u.id AND s.status = 'active'
  LEFT JOIN public.plans p ON p.id = s.plan_id
  WHERE u.id = p_user_id;

  -- Default to free plan if no active subscription found
  IF v_monthly_credits IS NULL THEN
    SELECT monthly_credits, credits_rollover
    INTO v_monthly_credits, v_rollover
    FROM public.plans
    WHERE name = 'free';
  END IF;

  -- Calculate new balance based on rollover policy
  IF v_rollover THEN
    v_new_balance := v_current_balance + v_monthly_credits;
  ELSE
    v_new_balance := v_monthly_credits;
  END IF;

  -- Update user credits
  UPDATE public.users
  SET
    credits_balance = v_new_balance,
    credits_used_this_month = 0,
    last_credit_reset_at = NOW()
  WHERE id = p_user_id;

  RAISE NOTICE 'Allocated % credits to user % (rollover: %)', v_monthly_credits, p_user_id, v_rollover;
END;
$$;

COMMENT ON FUNCTION public.allocate_monthly_credits IS 'Allocate monthly credits based on user plan';

-- ============================================================================

CREATE OR REPLACE FUNCTION public.reset_monthly_credits()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_count INTEGER;
BEGIN
  -- Allocate credits for all users
  SELECT COUNT(*) INTO v_user_count FROM public.users;

  PERFORM allocate_monthly_credits(id)
  FROM public.users;

  RAISE NOTICE 'Reset credits for % users', v_user_count;
END;
$$;

COMMENT ON FUNCTION public.reset_monthly_credits IS 'Monthly cron job to reset all user credits';

-- ============================================================================
-- TOKEN TRACKING FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.track_token_usage(
  p_user_id UUID,
  p_meeting_id UUID,
  p_agent_type TEXT,
  p_model_name TEXT,
  p_input_tokens INTEGER,
  p_output_tokens INTEGER,
  p_cached_tokens INTEGER DEFAULT 0,
  p_thoughts_tokens INTEGER DEFAULT 0,
  p_tool_use_prompt_tokens INTEGER DEFAULT 0,
  p_web_search_queries TEXT[] DEFAULT NULL,
  p_grounded_prompt_count INTEGER DEFAULT 0
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_tokens INTEGER;
  v_usage_id UUID;
BEGIN
  -- Total includes input + output + thoughts + tool_use (cached tokens are a subset of input)
  v_total_tokens := p_input_tokens + p_output_tokens + p_thoughts_tokens + p_tool_use_prompt_tokens;

  -- Insert token usage record
  INSERT INTO public.token_usage (
    user_id,
    meeting_id,
    agent_type,
    model_name,
    input_tokens,
    output_tokens,
    cached_tokens,
    thoughts_tokens,
    tool_use_prompt_tokens,
    total_tokens,
    web_search_queries,
    grounded_prompt_count
  ) VALUES (
    p_user_id,
    p_meeting_id,
    p_agent_type,
    p_model_name,
    p_input_tokens,
    p_output_tokens,
    p_cached_tokens,
    p_thoughts_tokens,
    p_tool_use_prompt_tokens,
    v_total_tokens,
    p_web_search_queries,
    p_grounded_prompt_count
  ) RETURNING id INTO v_usage_id;

  -- No user aggregate updates (credits are tracked separately)

  RETURN v_usage_id;
END;
$$;

COMMENT ON FUNCTION public.track_token_usage(UUID, UUID, TEXT, TEXT, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, TEXT[], INTEGER) IS 'Records token usage with grounding metadata, thoughts tokens, tool use tokens, search queries, and grounded prompt count';

-- ============================================================================

CREATE OR REPLACE FUNCTION public.track_api_usage(
  p_user_id UUID,
  p_meeting_id UUID,
  p_api_name TEXT,
  p_operation_type TEXT,
  p_request_count INTEGER DEFAULT 1,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_usage_id UUID;
BEGIN
  -- Insert API usage record
  INSERT INTO public.api_usage (
    user_id,
    meeting_id,
    api_name,
    operation_type,
    request_count,
    metadata
  ) VALUES (
    p_user_id,
    p_meeting_id,
    p_api_name,
    p_operation_type,
    p_request_count,
    p_metadata
  ) RETURNING id INTO v_usage_id;

  RETURN v_usage_id;
END;
$$;

COMMENT ON FUNCTION public.track_api_usage IS 'Records external API usage for cost tracking';

-- ============================================================================
-- REFERRAL FUNCTIONS
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

COMMENT ON FUNCTION public.generate_referral_code() IS 'Generate unique 8-character referral code';

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

COMMENT ON FUNCTION public.award_referral_credits(UUID) IS 'Award credits to both users on referral completion';

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

COMMENT ON FUNCTION public.check_and_complete_referral(UUID) IS 'Check and complete referral on first prep note';
