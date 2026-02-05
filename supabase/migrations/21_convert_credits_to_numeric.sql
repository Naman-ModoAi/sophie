-- ============================================================================
-- Convert credit columns from INTEGER to NUMERIC for decimal precision
-- Migration: 21_convert_credits_to_numeric
-- Description:
--   For existing databases that have INTEGER credit columns, convert to NUMERIC(10,2)
--   This allows 0.05 step deductions in the credit system
-- ============================================================================

-- ============================================================================
-- CONVERT USERS TABLE CREDIT COLUMNS
-- ============================================================================

-- Convert credits_balance to NUMERIC(10,2) with default 20
ALTER TABLE public.users
  ALTER COLUMN credits_balance TYPE NUMERIC(10,2) USING credits_balance::NUMERIC(10,2);
ALTER TABLE public.users
  ALTER COLUMN credits_balance SET DEFAULT 20;

-- Convert credits_used_this_month to NUMERIC(10,2)
ALTER TABLE public.users
  ALTER COLUMN credits_used_this_month TYPE NUMERIC(10,2) USING credits_used_this_month::NUMERIC(10,2);
ALTER TABLE public.users
  ALTER COLUMN credits_used_this_month SET DEFAULT 0;

-- Convert referral_credits_current_month to NUMERIC(10,2)
ALTER TABLE public.users
  ALTER COLUMN referral_credits_current_month TYPE NUMERIC(10,2) USING referral_credits_current_month::NUMERIC(10,2);
ALTER TABLE public.users
  ALTER COLUMN referral_credits_current_month SET DEFAULT 0;

-- ============================================================================
-- CONVERT PLANS TABLE CREDIT COLUMNS
-- ============================================================================

-- Convert monthly_credits to NUMERIC(10,2)
ALTER TABLE public.plans
  ALTER COLUMN monthly_credits TYPE NUMERIC(10,2) USING monthly_credits::NUMERIC(10,2);

-- Convert person_credit_cost to NUMERIC(10,2)
ALTER TABLE public.plans
  ALTER COLUMN person_credit_cost TYPE NUMERIC(10,2) USING person_credit_cost::NUMERIC(10,2);
ALTER TABLE public.plans
  ALTER COLUMN person_credit_cost SET DEFAULT 1;

-- Convert company_credit_cost to NUMERIC(10,2)
ALTER TABLE public.plans
  ALTER COLUMN company_credit_cost TYPE NUMERIC(10,2) USING company_credit_cost::NUMERIC(10,2);
ALTER TABLE public.plans
  ALTER COLUMN company_credit_cost SET DEFAULT 1;

-- ============================================================================
-- UPDATE FUNCTIONS TO USE NUMERIC
-- ============================================================================

-- Update check_credit_balance function
CREATE OR REPLACE FUNCTION public.check_credit_balance(
  p_user_id UUID,
  p_credits_needed NUMERIC  -- Changed from INTEGER
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

-- Update consume_credits function
CREATE OR REPLACE FUNCTION public.consume_credits(
  p_user_id UUID,
  p_credits NUMERIC,  -- Changed from INTEGER
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

-- Update allocate_monthly_credits function
CREATE OR REPLACE FUNCTION public.allocate_monthly_credits(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_monthly_credits NUMERIC;
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

-- ============================================================================
-- FIX USERS WITH 0 CREDITS
-- ============================================================================

-- Set credits_balance to 20 for users who have 0 or NULL credits
UPDATE public.users
SET credits_balance = 20
WHERE credits_balance = 0 OR credits_balance IS NULL;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN public.users.credits_balance IS 'Current available credits for research (NUMERIC for 0.05 step deductions, default 20)';
COMMENT ON COLUMN public.users.credits_used_this_month IS 'Credits consumed in current billing period (NUMERIC for decimal precision)';
COMMENT ON COLUMN public.plans.monthly_credits IS 'Number of credits allocated per month (NUMERIC for decimal precision)';
