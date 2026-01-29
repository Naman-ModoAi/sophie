-- ============================================================================
-- Credit System Migration Verification Script
-- ============================================================================
-- Run this script after migration to verify everything is working correctly
-- All queries should return expected results as documented in comments

-- ============================================================================
-- SECTION 1: Schema Verification
-- ============================================================================

\echo '=== SECTION 1: Schema Verification ==='

-- Check new tables exist
-- Expected: 3 rows (plans, subscriptions, transactions)
SELECT 'New Tables Check' as test, COUNT(*) as count, 'Expected: 3' as expected
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('plans', 'subscriptions', 'transactions');

-- Check new columns on users table
-- Expected: 3 rows (credits_balance, credits_used_this_month, last_credit_reset_at)
SELECT 'User Credit Columns' as test, COUNT(*) as count, 'Expected: 3' as expected
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'users'
AND column_name IN ('credits_balance', 'credits_used_this_month', 'last_credit_reset_at');

-- Check credits_consumed column on token_usage
-- Expected: 1 row
SELECT 'Token Usage Credit Column' as test, COUNT(*) as count, 'Expected: 1' as expected
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'token_usage'
AND column_name = 'credits_consumed';

-- ============================================================================
-- SECTION 2: Data Verification
-- ============================================================================

\echo '=== SECTION 2: Data Verification ==='

-- Check plans seeded
-- Expected: 2 rows (free, pro)
SELECT
  'Plans Seeded' as test,
  name,
  monthly_credits,
  credits_rollover,
  person_credit_cost,
  company_credit_cost,
  is_active
FROM public.plans
ORDER BY name;

-- Check all users have credits
-- Expected: All users should have credits_balance > 0
SELECT
  'User Credits by Plan' as test,
  plan_type,
  COUNT(*) as user_count,
  MIN(credits_balance) as min_credits,
  AVG(credits_balance) as avg_credits,
  MAX(credits_balance) as max_credits,
  SUM(CASE WHEN credits_balance = 0 THEN 1 ELSE 0 END) as users_with_zero_credits
FROM public.users
GROUP BY plan_type
ORDER BY plan_type;

-- Check subscriptions created
-- Expected: Should match user count (one subscription per user)
SELECT
  'Subscriptions Created' as test,
  (SELECT COUNT(*) FROM public.subscriptions) as subscription_count,
  (SELECT COUNT(*) FROM public.users) as user_count,
  CASE
    WHEN (SELECT COUNT(*) FROM public.subscriptions) = (SELECT COUNT(*) FROM public.users)
    THEN '✓ Match'
    ELSE '✗ Mismatch'
  END as status;

-- Check subscription distribution
-- Expected: Subscriptions distributed according to plan_type
SELECT
  'Subscription Distribution' as test,
  p.name as plan,
  COUNT(s.id) as subscription_count,
  COUNT(CASE WHEN s.status = 'active' THEN 1 END) as active_count
FROM public.subscriptions s
JOIN public.plans p ON s.plan_id = p.id
GROUP BY p.name
ORDER BY p.name;

-- ============================================================================
-- SECTION 3: Function Verification
-- ============================================================================

\echo '=== SECTION 3: Function Verification ==='

-- Check functions exist
-- Expected: 4 rows (check_credit_balance, consume_credits, allocate_monthly_credits, reset_monthly_credits)
SELECT
  'Credit Functions' as test,
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'check_credit_balance',
  'consume_credits',
  'allocate_monthly_credits',
  'reset_monthly_credits'
)
ORDER BY routine_name;

-- ============================================================================
-- SECTION 4: Functional Tests
-- ============================================================================

\echo '=== SECTION 4: Functional Tests ==='

-- Test check_credit_balance for free user
-- Expected: Should return true if user has >= 5 credits
DO $$
DECLARE
  v_user_id UUID;
  v_balance INTEGER;
  v_result BOOLEAN;
BEGIN
  -- Get first free user with credits
  SELECT id, credits_balance INTO v_user_id, v_balance
  FROM public.users
  WHERE plan_type = 'free'
  AND credits_balance >= 5
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    SELECT check_credit_balance(v_user_id, 5) INTO v_result;
    RAISE NOTICE 'Free user credit check: User has % credits, check(5) = %', v_balance, v_result;
  ELSE
    RAISE NOTICE 'Free user credit check: No free users with >= 5 credits found';
  END IF;
END $$;

-- Test check_credit_balance for pro user (should always return true)
-- Expected: Should return true even for large amounts
DO $$
DECLARE
  v_user_id UUID;
  v_result BOOLEAN;
  v_has_active_sub BOOLEAN;
BEGIN
  -- Get first pro user
  SELECT u.id INTO v_user_id
  FROM public.users u
  JOIN public.subscriptions s ON s.user_id = u.id
  JOIN public.plans p ON s.plan_id = p.id
  WHERE s.status = 'active'
  AND p.name = 'pro'
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- Check if function correctly identifies pro subscription
    SELECT EXISTS(
      SELECT 1 FROM public.subscriptions s
      JOIN public.plans p ON s.plan_id = p.id
      WHERE s.user_id = v_user_id
      AND s.status = 'active'
      AND p.name = 'pro'
    ) INTO v_has_active_sub;

    SELECT check_credit_balance(v_user_id, 1000000) INTO v_result;
    RAISE NOTICE 'Pro user credit check: Has active pro subscription = %, check(1000000) = %',
      v_has_active_sub, v_result;
  ELSE
    RAISE NOTICE 'Pro user credit check: No active pro users found';
  END IF;
END $$;

-- Test allocate_monthly_credits
-- Expected: Should allocate correct amount based on plan
DO $$
DECLARE
  v_user_id UUID;
  v_plan_name TEXT;
  v_balance_before INTEGER;
  v_balance_after INTEGER;
  v_expected_credits INTEGER;
BEGIN
  -- Get a free user
  SELECT u.id, p.name, u.credits_balance, p.monthly_credits
  INTO v_user_id, v_plan_name, v_balance_before, v_expected_credits
  FROM public.users u
  LEFT JOIN public.subscriptions s ON s.user_id = u.id AND s.status = 'active'
  LEFT JOIN public.plans p ON p.id = s.plan_id
  WHERE u.plan_type = 'free'
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- Allocate credits
    PERFORM allocate_monthly_credits(v_user_id);

    -- Get new balance
    SELECT credits_balance INTO v_balance_after FROM public.users WHERE id = v_user_id;

    RAISE NOTICE 'Credit allocation test: Plan = %, Before = %, After = %, Expected = %',
      COALESCE(v_plan_name, 'free (default)'), v_balance_before, v_balance_after, v_expected_credits;
  END IF;
END $$;

-- ============================================================================
-- SECTION 5: Integration Verification
-- ============================================================================

\echo '=== SECTION 5: Integration Verification ==='

-- Check token_usage table has credits_consumed column and is being used
-- Expected: Should show token usage records with credit consumption
SELECT
  'Token Usage Credits' as test,
  COUNT(*) as total_records,
  SUM(CASE WHEN credits_consumed > 0 THEN 1 ELSE 0 END) as records_with_credits,
  SUM(credits_consumed) as total_credits_consumed
FROM public.token_usage;

-- Check RLS policies exist
-- Expected: Multiple policies for each new table
SELECT
  'RLS Policies' as test,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('plans', 'subscriptions', 'transactions', 'token_usage')
ORDER BY tablename, policyname;

-- ============================================================================
-- SECTION 6: Data Integrity Checks
-- ============================================================================

\echo '=== SECTION 6: Data Integrity Checks ==='

-- Check for users with negative credits (BUG indicator)
-- Expected: 0 rows
SELECT
  'Negative Credits Check' as test,
  COUNT(*) as count,
  'Expected: 0' as expected
FROM public.users
WHERE credits_balance < 0;

-- Check for orphaned subscriptions
-- Expected: 0 rows
SELECT
  'Orphaned Subscriptions' as test,
  COUNT(*) as count,
  'Expected: 0' as expected
FROM public.subscriptions s
LEFT JOIN public.users u ON s.user_id = u.id
WHERE u.id IS NULL;

-- Check for invalid subscription statuses
-- Expected: 0 rows
SELECT
  'Invalid Subscription Status' as test,
  COUNT(*) as count,
  'Expected: 0' as expected
FROM public.subscriptions
WHERE status NOT IN ('active', 'canceled', 'past_due', 'trialing', 'paused');

-- ============================================================================
-- SECTION 7: Summary Report
-- ============================================================================

\echo '=== SECTION 7: Summary Report ==='

SELECT
  'MIGRATION SUMMARY' as report,
  json_build_object(
    'total_users', (SELECT COUNT(*) FROM public.users),
    'total_plans', (SELECT COUNT(*) FROM public.plans),
    'total_subscriptions', (SELECT COUNT(*) FROM public.subscriptions),
    'total_transactions', (SELECT COUNT(*) FROM public.transactions),
    'active_subscriptions', (SELECT COUNT(*) FROM public.subscriptions WHERE status = 'active'),
    'total_credits_available', (SELECT SUM(credits_balance) FROM public.users),
    'total_credits_consumed', (SELECT SUM(credits_consumed) FROM public.token_usage),
    'free_users', (SELECT COUNT(*) FROM public.users WHERE plan_type = 'free'),
    'pro_users', (SELECT COUNT(*) FROM public.users WHERE plan_type = 'pro'),
    'avg_free_credits', (SELECT ROUND(AVG(credits_balance)) FROM public.users WHERE plan_type = 'free'),
    'avg_pro_credits', (SELECT ROUND(AVG(credits_balance)) FROM public.users WHERE plan_type = 'pro')
  ) as summary;

-- ============================================================================
-- END OF VERIFICATION
-- ============================================================================

\echo '=== Verification Complete ==='
\echo 'Review all results above. All counts should match expected values.'
\echo 'If any checks fail, review CREDIT_SYSTEM_MIGRATION.md for troubleshooting.'
