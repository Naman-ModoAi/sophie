# Credit-Based Usage System Migration Guide

## Overview
This migration replaces the meeting-count based limit system with a comprehensive credit-based system. Users consume credits when researching people and companies, with credits allocated per plan and refreshed monthly.

## Migration Files

The migration consists of 8 sequential SQL files that must be run in order:

### Phase 1: Core Tables (001-003)
1. **20260129_001_create_plans_table.sql**
   - Creates `plans` table with credit allocation and feature flags
   - Defines plan structure (free, pro, enterprise)
   - Sets up RLS policies

2. **20260129_002_create_subscriptions_table.sql**
   - Creates `subscriptions` table linking users to plans
   - Tracks Stripe subscription data
   - Manages billing periods and statuses

3. **20260129_003_create_transactions_table.sql**
   - Creates `transactions` table for payment tracking
   - Records Stripe payment events
   - Stores invoice and payment intent references

### Phase 2: User Credits (004)
4. **20260129_004_add_user_credits.sql**
   - Adds credit tracking columns to `users` table:
     - `credits_balance` - current available credits
     - `credits_used_this_month` - consumption tracking
     - `last_credit_reset_at` - reset timestamp

### Phase 3: Credit Logic (005)
5. **20260129_005_credit_functions.sql**
   - Creates database functions:
     - `check_credit_balance()` - verify sufficient credits (Pro = unlimited)
     - `consume_credits()` - atomically deduct credits
     - `allocate_monthly_credits()` - allocate based on plan
     - `reset_monthly_credits()` - monthly cron job

### Phase 4: Data & Cleanup (006-008)
6. **20260129_006_seed_plans.sql**
   - Seeds initial Free and Pro plans
   - Migrates existing users to subscription model
   - Initializes credit balances based on current `plan_type`

7. **20260129_007_add_credits_to_token_usage.sql**
   - Adds `credits_consumed` column to `token_usage` table
   - Links token tracking with credit consumption

8. **20260129_008_cleanup_old_system.sql**
   - Drops old `check_usage_limit()` and `increment_usage()` functions
   - Updates `reset_monthly_usage()` to use new credit system
   - Preserves old columns temporarily for rollback safety

## Application Code

The TypeScript application code is already implemented:

### Already Implemented ✅
- **frontend/lib/research/check-usage.ts** - Credit checking utilities
- **frontend/lib/research/token-tracker.ts** - Consumes credits after tracking tokens
- **frontend/app/api/research/route.ts** - Credit gate before research
- **frontend/app/api/stripe/webhook/route.ts** - Subscription & transaction handling

## Running the Migration

### Prerequisites
1. Backup your database
2. Ensure Supabase environment variables are set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Option 1: Automated Migration
```bash
cd frontend
npm run migrate:latest
```

### Option 2: Manual Migration
Run each SQL file in order via Supabase SQL Editor:

```bash
# Copy each file content to Supabase SQL Editor and execute in order:
cat lib/migrations/20260129_001_create_plans_table.sql
cat lib/migrations/20260129_002_create_subscriptions_table.sql
cat lib/migrations/20260129_003_create_transactions_table.sql
cat lib/migrations/20260129_004_add_user_credits.sql
cat lib/migrations/20260129_005_credit_functions.sql
cat lib/migrations/20260129_006_seed_plans.sql
cat lib/migrations/20260129_007_add_credits_to_token_usage.sql
cat lib/migrations/20260129_008_cleanup_old_system.sql
```

## Verification Steps

### 1. Verify Tables Created
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('plans', 'subscriptions', 'transactions');
```

Expected output: 3 tables

### 2. Verify Plans Seeded
```sql
SELECT name, display_name, monthly_credits, credits_rollover
FROM plans
ORDER BY name;
```

Expected output:
- **free**: 10 credits, no rollover
- **pro**: 1000 credits, with rollover

### 3. Verify User Credits Initialized
```sql
SELECT
  plan_type,
  COUNT(*) as user_count,
  AVG(credits_balance) as avg_credits,
  SUM(CASE WHEN credits_balance > 0 THEN 1 ELSE 0 END) as users_with_credits
FROM users
GROUP BY plan_type;
```

Expected: All users should have credits based on their plan

### 4. Verify Subscriptions Created
```sql
SELECT
  COUNT(*) as subscription_count,
  COUNT(DISTINCT user_id) as unique_users
FROM subscriptions;
```

Expected: One subscription per user

### 5. Test Credit Functions

#### Test Check Balance (Free User)
```sql
-- Find a free user
SELECT id, email, credits_balance FROM users WHERE plan_type = 'free' LIMIT 1;

-- Test with UUID from above
SELECT check_credit_balance('USER-UUID-HERE', 5);
```

Expected: `true` if balance >= 5, `false` otherwise

#### Test Check Balance (Pro User)
```sql
-- Find a pro user
SELECT id, email FROM users WHERE plan_type = 'pro' LIMIT 1;

-- Test with UUID from above
SELECT check_credit_balance('USER-UUID-HERE', 1000000);
```

Expected: Always `true` (pro users have unlimited credits)

#### Test Consume Credits
```sql
-- Get a user's current balance
SELECT id, email, credits_balance FROM users WHERE plan_type = 'free' LIMIT 1;

-- Consume 2 credits
SELECT consume_credits('USER-UUID-HERE', 2, NULL, 'person');

-- Verify balance decreased
SELECT credits_balance, credits_used_this_month FROM users WHERE id = 'USER-UUID-HERE';
```

Expected: Balance decreased by 2, used_this_month increased by 2

#### Test Monthly Allocation
```sql
-- Allocate credits to a user
SELECT allocate_monthly_credits('USER-UUID-HERE');

-- Verify allocation
SELECT credits_balance, credits_used_this_month, last_credit_reset_at
FROM users WHERE id = 'USER-UUID-HERE';
```

Expected:
- Free users: balance = 10, used = 0
- Pro users: balance = 1000, used = 0

## End-to-End Application Test

### 1. Test Credit Check Before Research
```bash
# Create a test meeting with 1 person + 1 company
# Trigger research via API: POST /api/research

# Check logs for:
# "[Research API] Credits needed: 2 (1 people + 1 companies)"
# "[Research API] Research denied..." OR "Research completed..."
```

### 2. Test Credit Consumption
```sql
-- Before research
SELECT credits_balance FROM users WHERE id = 'TEST-USER-ID';

-- Trigger research

-- After research
SELECT credits_balance, credits_used_this_month FROM users WHERE id = 'TEST-USER-ID';
```

Expected: Balance decreased by (attendees + companies)

### 3. Test Insufficient Credits
```sql
-- Set user to low credits
UPDATE users SET credits_balance = 1 WHERE id = 'TEST-USER-ID';

-- Attempt research requiring 2+ credits
-- Should receive 403 error with message about insufficient credits
```

### 4. Test Pro Unlimited
```sql
-- Upgrade user to pro
INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
SELECT 'TEST-USER-ID', id, 'active', NOW(), NOW() + INTERVAL '1 month'
FROM plans WHERE name = 'pro';

-- Attempt research with any amount
-- Should succeed regardless of credit balance
```

## Stripe Integration Test

### 1. Test Subscription Creation
```bash
# Create test subscription in Stripe Dashboard
# Metadata: userId = "TEST-USER-ID"

# Trigger webhook event: customer.subscription.created

# Verify in database:
SELECT * FROM subscriptions WHERE user_id = 'TEST-USER-ID';
SELECT credits_balance FROM users WHERE id = 'TEST-USER-ID';
```

Expected:
- Subscription record created
- Credits allocated immediately

### 2. Test Payment Success
```bash
# Trigger webhook event: invoice.payment_succeeded

# Verify transaction recorded:
SELECT * FROM transactions
WHERE user_id = 'TEST-USER-ID'
ORDER BY created_at DESC LIMIT 1;
```

Expected: Transaction record with status = 'succeeded'

### 3. Test Subscription Cancellation
```bash
# Cancel subscription in Stripe
# Trigger webhook event: customer.subscription.deleted

# Verify downgrade:
SELECT plan_type, credits_balance FROM users WHERE id = 'TEST-USER-ID';
SELECT status FROM subscriptions WHERE user_id = 'TEST-USER-ID';
```

Expected:
- User plan_type = 'free'
- Subscription status = 'canceled'
- Credits reset to free plan amount (10)

## Monthly Reset Test

```sql
-- Manually trigger monthly reset
SELECT reset_monthly_credits();

-- Verify all users have fresh credits
SELECT
  plan_type,
  COUNT(*) as users,
  AVG(credits_balance) as avg_balance,
  AVG(credits_used_this_month) as avg_used
FROM users
GROUP BY plan_type;
```

Expected:
- All `credits_used_this_month` = 0
- Free users: balance = 10
- Pro users: balance = old_balance + 1000 (with rollover)

## Rollback Plan

If critical issues occur:

### 1. Database Rollback
```sql
-- Drop new tables
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS plans CASCADE;

-- Remove new columns
ALTER TABLE users DROP COLUMN IF EXISTS credits_balance;
ALTER TABLE users DROP COLUMN IF EXISTS credits_used_this_month;
ALTER TABLE users DROP COLUMN IF EXISTS last_credit_reset_at;
ALTER TABLE token_usage DROP COLUMN IF EXISTS credits_consumed;

-- Drop new functions
DROP FUNCTION IF EXISTS check_credit_balance(UUID, INTEGER);
DROP FUNCTION IF EXISTS consume_credits(UUID, INTEGER, UUID, TEXT);
DROP FUNCTION IF EXISTS allocate_monthly_credits(UUID);
DROP FUNCTION IF EXISTS reset_monthly_credits();
```

### 2. Application Rollback
```bash
# Revert application code to previous commit
git revert HEAD

# Redeploy previous version
npm run build
npm run deploy
```

### 3. Restore from Backup
If needed, restore database from pre-migration backup.

## Post-Migration Cleanup

After confirming the credit system works in production (1-2 weeks):

```sql
-- Safe to drop old columns
ALTER TABLE users DROP COLUMN IF EXISTS meetings_used;
ALTER TABLE users DROP COLUMN IF EXISTS usage_reset_at;
```

## Monitoring

### Key Metrics to Monitor

```sql
-- Users with low credits (< 5)
SELECT COUNT(*) FROM users
WHERE credits_balance < 5
AND plan_type = 'free';

-- Daily credit consumption
SELECT
  DATE(created_at) as date,
  SUM(credits_consumed) as total_credits,
  COUNT(DISTINCT user_id) as unique_users
FROM token_usage
WHERE credits_consumed > 0
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Plan distribution
SELECT
  p.name,
  COUNT(*) as subscriber_count,
  SUM(u.credits_balance) as total_credits_available
FROM subscriptions s
JOIN plans p ON s.plan_id = p.id
JOIN users u ON s.user_id = u.id
WHERE s.status = 'active'
GROUP BY p.name;
```

## Troubleshooting

### Issue: User has negative credits
```sql
-- Find users with negative balance
SELECT id, email, credits_balance FROM users WHERE credits_balance < 0;

-- Fix by resetting
SELECT allocate_monthly_credits('USER-ID');
```

### Issue: Pro user running out of credits
```sql
-- Verify pro subscription is active
SELECT s.status, p.name
FROM subscriptions s
JOIN plans p ON s.plan_id = p.id
WHERE s.user_id = 'USER-ID';

-- If active but not working, check function logic
SELECT check_credit_balance('USER-ID', 1);
```

### Issue: Credits not allocated after subscription
```sql
-- Check subscription exists
SELECT * FROM subscriptions WHERE user_id = 'USER-ID';

-- Manually allocate
SELECT allocate_monthly_credits('USER-ID');

-- Check webhook logs for errors
```

## Support

For issues or questions:
1. Check application logs: `console.log` statements in token-tracker.ts and webhook.ts
2. Check database function logs: `RAISE NOTICE` statements
3. Verify Stripe webhook delivery in Stripe Dashboard
4. Review this guide's verification steps

## Summary

This migration implements a complete credit-based usage system that:
- ✅ Replaces meeting limits with flexible credit system
- ✅ Supports multiple plans with different credit allocations
- ✅ Integrates with Stripe for subscription management
- ✅ Tracks all payments and transactions
- ✅ Provides monthly credit resets with rollover support
- ✅ Maintains backward compatibility during transition
- ✅ Includes comprehensive verification and rollback procedures

The system is production-ready and fully integrated with the existing TypeScript application.
