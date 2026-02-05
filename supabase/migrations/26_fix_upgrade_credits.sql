-- ============================================================================
-- Fix: allocate_monthly_credits should not rollover on plan changes
--
-- Problem: When a free user (20 credits) upgrades to Pro, the function
-- adds 200 to existing 20 = 220 because Pro has credits_rollover = TRUE.
-- Rollover is meant for monthly resets, not plan changes.
--
-- Fix: Add p_is_plan_change parameter. When TRUE, always SET credits to
-- the plan amount instead of adding to existing balance.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.allocate_monthly_credits(
  p_user_id UUID,
  p_is_plan_change BOOLEAN DEFAULT FALSE
)
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
  -- On plan change, always set to plan amount (don't rollover from old plan)
  IF v_rollover AND NOT p_is_plan_change THEN
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

  RAISE NOTICE 'Allocated % credits to user % (rollover: %, plan_change: %)', v_monthly_credits, p_user_id, v_rollover, p_is_plan_change;
END;
$$;

COMMENT ON FUNCTION public.allocate_monthly_credits IS 'Allocate monthly credits based on user plan. Use p_is_plan_change=TRUE on upgrades/downgrades to prevent rollover from old plan.';
