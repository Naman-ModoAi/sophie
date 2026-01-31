-- Verification Script for Token-Based Credit System
-- Run this script after migrations to verify everything is working correctly

-- ============================================================================
-- SECTION 1: Verify Schema Changes
-- ============================================================================

\echo '=== SECTION 1: VERIFY SCHEMA CHANGES ==='
\echo ''

-- 1.1: Check that old token columns are REMOVED from users table
\echo '1.1: Checking users table (should NOT have old token columns)...'
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
  AND table_schema = 'public'
  AND column_name IN ('tokens_used_this_month', 'total_tokens_used', 'last_token_reset_at');
-- Expected: NO ROWS (columns should be removed)

\echo ''

-- 1.2: Check that total_tokens is REMOVED from token_usage table
\echo '1.2: Checking token_usage for removed total_tokens column...'
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'token_usage'
  AND table_schema = 'public'
  AND column_name = 'total_tokens';
-- Expected: NO ROWS (column should be removed)

\echo ''

-- 1.3: Check that NEW columns exist in token_usage table
\echo '1.3: Checking token_usage for NEW columns (effective_tokens, actual_cost_usd)...'
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'token_usage'
  AND table_schema = 'public'
  AND column_name IN ('effective_tokens', 'actual_cost_usd')
ORDER BY column_name;
-- Expected: 2 rows showing effective_tokens and actual_cost_usd

\echo ''

-- ============================================================================
-- SECTION 2: Verify New Tables
-- ============================================================================

\echo '=== SECTION 2: VERIFY NEW TABLES ==='
\echo ''

-- 2.1: Check credit_baseline table exists
\echo '2.1: Checking credit_baseline table structure...'
\d credit_baseline
-- Expected: Shows table with id, avg_tokens_per_attendee, sample_size, updated_at, created_at

\echo ''

-- 2.2: Check initial baseline data
\echo '2.2: Checking initial baseline data...'
SELECT * FROM credit_baseline;
-- Expected: 1 row with avg_tokens_per_attendee = 5000, sample_size = 0

\echo ''

-- ============================================================================
-- SECTION 3: Verify Database Functions
-- ============================================================================

\echo '=== SECTION 3: VERIFY DATABASE FUNCTIONS ==='
\echo ''

-- 3.1: Test get_credit_baseline() function
\echo '3.1: Testing get_credit_baseline() function...'
SELECT get_credit_baseline() as current_baseline;
-- Expected: 5000.00

\echo ''

-- 3.2: Test calculate_actual_cost() function
\echo '3.2: Testing calculate_actual_cost() function...'
\echo 'Test case: 2000 input, 500 output, 0 cached tokens'
SELECT calculate_actual_cost(2000, 500, 0) as cost_usd;
-- Expected: 0.002500 ($0.0025)

\echo ''

\echo 'Test case: 3500 input, 1200 output, 0 cached tokens'
SELECT calculate_actual_cost(3500, 1200, 0) as cost_usd;
-- Expected: 0.005350 ($0.00535)

\echo ''

\echo 'Test case: 1500 input, 400 output, 1000 cached tokens'
SELECT calculate_actual_cost(1500, 400, 1000) as cost_usd;
-- Expected: 0.002125 ($0.002125)

\echo ''

-- 3.3: Verify update_credit_baseline() function exists
\echo '3.3: Checking update_credit_baseline() function exists...'
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'update_credit_baseline';
-- Expected: Shows function definition

\echo ''

-- ============================================================================
-- SECTION 4: Verify Indexes
-- ============================================================================

\echo '=== SECTION 4: VERIFY INDEXES ==='
\echo ''

-- 4.1: Check index on actual_cost_usd
\echo '4.1: Checking index on token_usage.actual_cost_usd...'
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'token_usage'
  AND indexname = 'idx_token_usage_cost';
-- Expected: Shows index definition

\echo ''

-- ============================================================================
-- SECTION 5: Test Credit Calculation (Simulation)
-- ============================================================================

\echo '=== SECTION 5: TEST CREDIT CALCULATION (SIMULATION) ==='
\echo ''

-- 5.1: Simulate credit calculation for typical usage
\echo '5.1: Simulating credit calculation for typical attendee...'
\echo 'Input: 2000 tokens, Output: 500 tokens, Cached: 0 tokens'
WITH calculation AS (
  SELECT
    2000 as input_tokens,
    500 as output_tokens,
    0 as cached_tokens,
    -- Calculate effective tokens: (input×1.0) + (output×6.0) + (cached×0.25)
    (2000 * 1.0) + (500 * 6.0) + (0 * 0.25) as effective_tokens,
    -- Get baseline
    get_credit_baseline() as baseline
)
SELECT
  input_tokens,
  output_tokens,
  cached_tokens,
  effective_tokens,
  baseline,
  -- Raw credits = effective / baseline
  (effective_tokens / baseline) as raw_credits,
  -- Rounded credits = ceil(raw / 0.25) × 0.25
  CEIL((effective_tokens / baseline) / 0.25) * 0.25 as rounded_credits,
  -- Final credits = max(rounded, 0.25)
  GREATEST(CEIL((effective_tokens / baseline) / 0.25) * 0.25, 0.25) as final_credits,
  -- Actual cost
  calculate_actual_cost(input_tokens, output_tokens, cached_tokens) as actual_cost_usd
FROM calculation;
-- Expected: effective_tokens=5000, raw_credits=1.0, final_credits=1.0, cost=$0.0025

\echo ''

-- 5.2: Simulate credit calculation for complex research
\echo '5.2: Simulating credit calculation for complex research...'
\echo 'Input: 3500 tokens, Output: 1200 tokens, Cached: 0 tokens'
WITH calculation AS (
  SELECT
    3500 as input_tokens,
    1200 as output_tokens,
    0 as cached_tokens,
    (3500 * 1.0) + (1200 * 6.0) + (0 * 0.25) as effective_tokens,
    get_credit_baseline() as baseline
)
SELECT
  input_tokens,
  output_tokens,
  cached_tokens,
  effective_tokens,
  baseline,
  (effective_tokens / baseline) as raw_credits,
  CEIL((effective_tokens / baseline) / 0.25) * 0.25 as rounded_credits,
  GREATEST(CEIL((effective_tokens / baseline) / 0.25) * 0.25, 0.25) as final_credits,
  calculate_actual_cost(input_tokens, output_tokens, cached_tokens) as actual_cost_usd
FROM calculation;
-- Expected: effective_tokens=10700, raw_credits=2.14, final_credits=2.25, cost=$0.00535

\echo ''

-- 5.3: Simulate credit calculation with caching
\echo '5.3: Simulating credit calculation with caching...'
\echo 'Input: 1500 tokens, Output: 400 tokens, Cached: 1000 tokens'
WITH calculation AS (
  SELECT
    1500 as input_tokens,
    400 as output_tokens,
    1000 as cached_tokens,
    (1500 * 1.0) + (400 * 6.0) + (1000 * 0.25) as effective_tokens,
    get_credit_baseline() as baseline
)
SELECT
  input_tokens,
  output_tokens,
  cached_tokens,
  effective_tokens,
  baseline,
  (effective_tokens / baseline) as raw_credits,
  CEIL((effective_tokens / baseline) / 0.25) * 0.25 as rounded_credits,
  GREATEST(CEIL((effective_tokens / baseline) / 0.25) * 0.25, 0.25) as final_credits,
  calculate_actual_cost(input_tokens, output_tokens, cached_tokens) as actual_cost_usd
FROM calculation;
-- Expected: effective_tokens=4150, raw_credits=0.83, final_credits=1.0, cost=$0.00213

\echo ''

-- 5.4: Simulate credit calculation for minimal usage
\echo '5.4: Simulating credit calculation for minimal usage...'
\echo 'Input: 400 tokens, Output: 100 tokens, Cached: 0 tokens'
WITH calculation AS (
  SELECT
    400 as input_tokens,
    100 as output_tokens,
    0 as cached_tokens,
    (400 * 1.0) + (100 * 6.0) + (0 * 0.25) as effective_tokens,
    get_credit_baseline() as baseline
)
SELECT
  input_tokens,
  output_tokens,
  cached_tokens,
  effective_tokens,
  baseline,
  (effective_tokens / baseline) as raw_credits,
  CEIL((effective_tokens / baseline) / 0.25) * 0.25 as rounded_credits,
  GREATEST(CEIL((effective_tokens / baseline) / 0.25) * 0.25, 0.25) as final_credits,
  calculate_actual_cost(input_tokens, output_tokens, cached_tokens) as actual_cost_usd
FROM calculation;
-- Expected: effective_tokens=1000, raw_credits=0.2, final_credits=0.25 (min enforced), cost=$0.00050

\echo ''

-- ============================================================================
-- SECTION 6: Check Recent Token Usage (if any exists)
-- ============================================================================

\echo '=== SECTION 6: CHECK RECENT TOKEN USAGE ==='
\echo ''

-- 6.1: Show recent token usage with new columns
\echo '6.1: Recent token usage records (if any)...'
SELECT
  id,
  created_at,
  agent_type,
  input_tokens,
  output_tokens,
  cached_tokens,
  effective_tokens,
  credits_consumed,
  actual_cost_usd,
  CASE
    WHEN credits_consumed > 0 THEN ROUND((actual_cost_usd / credits_consumed)::NUMERIC, 6)
    ELSE 0
  END as cost_per_credit
FROM token_usage
ORDER BY created_at DESC
LIMIT 10;
-- Expected: Shows recent records with all columns populated (or empty if no usage yet)

\echo ''

-- ============================================================================
-- VERIFICATION SUMMARY
-- ============================================================================

\echo '=== VERIFICATION SUMMARY ==='
\echo ''
\echo 'If all sections passed without errors:'
\echo '  ✅ Schema changes complete (old columns removed, new columns added)'
\echo '  ✅ credit_baseline table created with initial data'
\echo '  ✅ Database functions working correctly'
\echo '  ✅ Indexes created'
\echo '  ✅ Credit calculations produce expected results'
\echo ''
\echo 'Next steps:'
\echo '  1. Deploy code changes to production'
\echo '  2. Test with real meeting research'
\echo '  3. Monitor logs for credit calculation details'
\echo '  4. Update baseline after collecting real usage data (1 week)'
\echo ''
\echo 'See NEXT_STEPS.md for detailed deployment instructions.'
\echo ''
