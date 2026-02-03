-- Migration: Create credit management functions
-- Date: 2026-01-29
-- Description: Database functions for credit checking, consumption, and allocation

-- ============================================================================
-- Function: check_credit_balance
-- Description: Check if user has sufficient credits for an operation
-- ============================================================================
CREATE OR REPLACE FUNCTION public.check_credit_balance(
  p_user_id UUID,
  p_credits_needed INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance INTEGER;
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

-- ============================================================================
-- Function: consume_credits
-- Description: Deduct credits from user's balance
-- ============================================================================
CREATE OR REPLACE FUNCTION public.consume_credits(
  p_user_id UUID,
  p_credits INTEGER,
  p_meeting_id UUID DEFAULT NULL,
  p_research_type TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance INTEGER;
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

-- ============================================================================
-- Function: allocate_monthly_credits
-- Description: Allocate monthly credits to a user based on their plan
-- ============================================================================
CREATE OR REPLACE FUNCTION public.allocate_monthly_credits(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_monthly_credits INTEGER;
  v_rollover BOOLEAN;
  v_current_balance INTEGER;
  v_new_balance INTEGER;
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

-- ============================================================================
-- Function: reset_monthly_credits (Cron job)
-- Description: Reset credits for all users (called monthly via cron)
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

-- Comments for documentation
COMMENT ON FUNCTION public.check_credit_balance IS 'Check if user has sufficient credits (Pro users have unlimited)';
COMMENT ON FUNCTION public.consume_credits IS 'Deduct credits from user balance atomically';
COMMENT ON FUNCTION public.allocate_monthly_credits IS 'Allocate monthly credits based on user plan';
COMMENT ON FUNCTION public.reset_monthly_credits IS 'Monthly cron job to reset all user credits';
