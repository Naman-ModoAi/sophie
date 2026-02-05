-- ============================================================================
-- MeetReady - Seed Data
-- Migration: 07_seed_data
-- Description: Insert initial plan data and generate referral codes
-- ============================================================================

-- ============================================================================
-- SEED PLANS
-- ============================================================================

INSERT INTO public.plans (
  name,
  display_name,
  monthly_credits,
  credits_rollover,
  person_credit_cost,
  company_credit_cost,
  research_retention_days,
  stripe_price_id,
  price_monthly_cents,
  description,
  priority_support,
  is_active
) VALUES
  (
    'free',
    'Free Plan',
    20,
    FALSE,
    1,
    1,
    30,
    NULL,
    0,
    'Free plan with 20 credits per month. Credits reset monthly and don''t roll over. Research data retained for 30 days.',
    FALSE,
    TRUE
  ),
  (
    'pro',
    'Pro Plan',
    200,
    TRUE,
    1,
    1,
    NULL,
    NULL,  -- IMPORTANT: Set stripe_price_id manually after deployment via: UPDATE plans SET stripe_price_id = 'price_xxx' WHERE name = 'pro';
    2000,
    'Professional plan with 200 credits per month. Unused credits roll over. Unlimited research data retention and priority support.',
    TRUE,
    TRUE
  )
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  monthly_credits = EXCLUDED.monthly_credits,
  credits_rollover = EXCLUDED.credits_rollover,
  person_credit_cost = EXCLUDED.person_credit_cost,
  company_credit_cost = EXCLUDED.company_credit_cost,
  research_retention_days = EXCLUDED.research_retention_days,
  price_monthly_cents = EXCLUDED.price_monthly_cents,
  description = EXCLUDED.description,
  priority_support = EXCLUDED.priority_support,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- ============================================================================
-- INITIALIZE EXISTING USERS
-- ============================================================================

DO $$
DECLARE
  v_free_plan_id UUID;
  v_pro_plan_id UUID;
  v_free_credits NUMERIC;
  v_pro_credits NUMERIC;
BEGIN
  -- Get plan IDs and credit amounts
  SELECT id, monthly_credits INTO v_free_plan_id, v_free_credits
  FROM public.plans WHERE name = 'free';

  SELECT id, monthly_credits INTO v_pro_plan_id, v_pro_credits
  FROM public.plans WHERE name = 'pro';

  -- Initialize credits for free users
  UPDATE public.users
  SET credits_balance = v_free_credits
  WHERE plan_type = 'free'
    AND (credits_balance IS NULL OR credits_balance = 0);

  -- Initialize credits for pro users
  UPDATE public.users
  SET credits_balance = v_pro_credits
  WHERE plan_type = 'pro'
    AND (credits_balance IS NULL OR credits_balance = 0);

  -- Create subscriptions for existing users based on their plan_type
  INSERT INTO public.subscriptions (
    user_id,
    plan_id,
    status,
    current_period_start,
    current_period_end,
    stripe_subscription_id,
    stripe_customer_id
  )
  SELECT
    u.id,
    CASE
      WHEN u.plan_type = 'pro' THEN v_pro_plan_id
      ELSE v_free_plan_id
    END,
    'active',
    COALESCE(u.created_at, NOW()),
    COALESCE(u.created_at, NOW()) + INTERVAL '1 month',
    NULL,
    NULL
  FROM public.users u
  WHERE NOT EXISTS (
    SELECT 1 FROM public.subscriptions s WHERE s.user_id = u.id
  );

  RAISE NOTICE 'Initialized credits and subscriptions for existing users';
END $$;

-- ============================================================================
-- GENERATE REFERRAL CODES FOR EXISTING USERS
-- ============================================================================

DO $$
DECLARE
  v_user_record RECORD;
  v_new_code TEXT;
BEGIN
  FOR v_user_record IN
    SELECT id FROM public.users WHERE referral_code IS NULL
  LOOP
    v_new_code := public.generate_referral_code();

    UPDATE public.users
    SET referral_code = v_new_code
    WHERE id = v_user_record.id;
  END LOOP;

  RAISE NOTICE 'Generated referral codes for existing users';
END $$;

-- ============================================================================
-- LOG SEED DATA
-- ============================================================================

DO $$
DECLARE
  v_free_count INTEGER;
  v_pro_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_free_count FROM public.users WHERE plan_type = 'free';
  SELECT COUNT(*) INTO v_pro_count FROM public.users WHERE plan_type = 'pro';

  RAISE NOTICE 'Seeded plans: Free (% users), Pro (% users)', v_free_count, v_pro_count;
END $$;
