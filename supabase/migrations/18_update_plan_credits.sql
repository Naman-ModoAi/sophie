-- ============================================================================
-- MeetReady - Update Plan Credits
-- Migration: 18_update_plan_credits
-- Description: Align plan credits with landing page pricing
--              Free: 10 -> 20 credits/month
--              Pro: 1000 -> 200 credits/month
-- ============================================================================

-- ============================================================================
-- UPDATE PLAN CREDIT ALLOCATIONS
-- ============================================================================

-- Update Free plan to 20 credits per month
UPDATE public.plans
SET
  monthly_credits = 20,
  description = 'Free plan with 20 credits per month. Credits reset monthly and don''t roll over. Research data retained for 30 days.'
WHERE name = 'free';

-- Update Pro plan to 200 credits per month
UPDATE public.plans
SET
  monthly_credits = 200,
  description = 'Professional plan with 200 credits per month. Unused credits roll over. Unlimited research data retention and priority support.'
WHERE name = 'pro';

-- ============================================================================
-- UPDATE DEFAULT CREDITS FOR NEW USERS
-- ============================================================================

-- Update default credits_balance from 10 to 20
ALTER TABLE public.users
ALTER COLUMN credits_balance SET DEFAULT 20;

-- ============================================================================
-- UPDATE EXISTING USERS' CREDIT BALANCES
-- ============================================================================

-- Top up existing free users to 20 credits minimum (one-time boost)
UPDATE public.users
SET credits_balance = GREATEST(credits_balance, 20)
WHERE plan_type = 'free'
  AND credits_balance < 20;

-- Cap existing pro users at 200 credits (proportional reduction from 1000)
-- Only reduce if they have an active subscription and more than 200 credits
UPDATE public.users u
SET credits_balance = 200
WHERE plan_type = 'pro'
  AND EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.user_id = u.id
      AND s.status = 'active'
  )
  AND credits_balance > 200;

-- ============================================================================
-- LOG MIGRATION RESULTS
-- ============================================================================

DO $$
DECLARE
  v_free_plan_credits INTEGER;
  v_pro_plan_credits INTEGER;
  v_free_users_updated INTEGER;
  v_pro_users_updated INTEGER;
BEGIN
  -- Get updated plan credits
  SELECT monthly_credits INTO v_free_plan_credits FROM public.plans WHERE name = 'free';
  SELECT monthly_credits INTO v_pro_plan_credits FROM public.plans WHERE name = 'pro';

  -- Count users per plan
  SELECT COUNT(*) INTO v_free_users_updated FROM public.users WHERE plan_type = 'free';
  SELECT COUNT(*) INTO v_pro_users_updated FROM public.users WHERE plan_type = 'pro';

  RAISE NOTICE 'Migration completed successfully:';
  RAISE NOTICE '  Free plan: % credits/month (% users)', v_free_plan_credits, v_free_users_updated;
  RAISE NOTICE '  Pro plan: % credits/month (% users)', v_pro_plan_credits, v_pro_users_updated;
END $$;
