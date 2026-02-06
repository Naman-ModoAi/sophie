# Database Migrations

This directory contains all database schema and configuration migrations for SophiHQ.

## Migrations Overview

| File | Purpose | Status |
|------|---------|--------|
| `001_init_schema.sql` | Complete schema: creates tables + RLS policies + permissions | Required (full setup) |
| `003_fix_rls_policies.sql` | Fix RLS policies if they break or become corrupted | Optional (fix only) |
| `004_fix_table_permissions.sql` | Fix table permissions if they break or become corrupted | Optional (fix only) |

## Running Migrations

### Option 1: Fresh Setup (Recommended)

For a fresh database setup, `001_init_schema.sql` contains everything you need:

```bash
npm run migrate
```

This will run all three migrations in sequence:
1. Create all tables + RLS policies + permissions (001)
2. Apply RLS policies fix (003)
3. Apply table permissions fix (004)

Result: Fully initialized database ready for use.

### Option 2: Fix Broken Permissions

If RLS policies or table permissions break, run the fix scripts separately:

**Fix RLS policies only:**
```bash
npm run migrate 003
```

**Fix table permissions only:**
```bash
npm run migrate 004
```

### Option 3: Manual via Supabase Dashboard

1. Go to https://app.supabase.com/
2. Select your project
3. Click **SQL Editor** → **New Query**
4. For fresh setup, paste: `001_init_schema.sql` (has everything)
5. For fixes, paste the specific script that needs to be fixed:
   - `003_fix_rls_policies.sql` - To fix RLS policies
   - `004_fix_table_permissions.sql` - To fix table permissions
6. Click **Run**

## What Each Migration Does

### 001_init_schema.sql

**Complete initial setup** - Creates everything needed for a fresh database:

**1. Creates four tables with proper indexes and constraints:**

- **users** - Google user accounts
  - Columns: id, google_user_id, email, name, profile_photo_url, plan_type, created_at, last_login_at

- **oauth_tokens** - Google OAuth tokens
  - Columns: id, user_id, provider, access_token, refresh_token, expires_at, created_at, updated_at
  - Index: oauth_tokens_user_id

- **meetings** - Calendar events synced from Google Calendar
  - Columns: id, user_id, calendar_event_id, title, start_time, end_time, description, location, is_external, is_all_day, is_cancelled, created_at, updated_at
  - Indexes: meetings_user_id, meetings_start_time
  - Constraint: Unique(user_id, calendar_event_id)

- **attendees** - People attending meetings
  - Columns: id, meeting_id, email, name, domain, is_internal, created_at
  - Index: attendees_meeting_id
  - Constraint: Unique(meeting_id, email)

**2. Enables RLS and creates policies** - Same as 003_fix_rls_policies.sql

**3. Grants table permissions** - Same as 004_fix_table_permissions.sql

This is a **complete, standalone migration**. After running this, your database is fully initialized with schema, RLS, and permissions.

### 003_fix_rls_policies.sql

**RLS policies fix script** - Use when RLS policies break or become corrupted.

Drops and recreates all RLS policies from scratch:

**Users Table:**
- SELECT: Own record only (auth.uid() = id)
- UPDATE: Own record only (auth.uid() = id)
- Service role: Full access

**OAuth Tokens Table:**
- SELECT/INSERT/UPDATE/DELETE: Own tokens only (user_id matches auth.uid())
- Service role: Full access

**Meetings Table:**
- SELECT/INSERT/UPDATE/DELETE: Own meetings only (user_id matches auth.uid())
- Service role: Full access

**Attendees Table:**
- SELECT/INSERT/UPDATE/DELETE: Attendees from own meetings only
- Service role: Full access

### 004_fix_table_permissions.sql

**Table permissions fix script** - Use when table permissions are denied or broken.

Grants table permissions to database roles:

**Authenticated Role:**
- ALL permissions on all tables (RLS policies enforce ownership)

**Service Role:**
- ALL permissions on all tables (bypasses RLS, for backend services)

**Anon Role:**
- SELECT permission on users, meetings, attendees (for public access if needed)

**All Roles:**
- USAGE, SELECT on all sequences

## Troubleshooting

### Migration Failed: "Permission Denied"

If you see "permission denied for table X", the 004 migration may have failed. Run it manually or run `npm run migrate` again.

### Migration Failed: "Duplicate Policy"

If you see "policy already exists", you may have run the migration twice. This is safe - the migration drops policies before creating new ones.

### Verify RLS Policies Are Active

Run this query in Supabase SQL Editor:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Should show multiple policies for each table.

### Verify Table Permissions

Run this query in Supabase SQL Editor:

```sql
SELECT grantee, privilege_type, table_name
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
AND grantee IN ('authenticated', 'service_role', 'anon')
ORDER BY table_name, grantee, privilege_type;
```

Should show appropriate grants for each role.

## Environment Setup

Make sure `.env.local` has these variables before running migrations:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Next Steps After Migrations

1. Start the development server: `npm run dev`
2. Visit http://localhost:3000
3. Sign in with Google (OAuth flow)
4. Click "Sync Calendar" to fetch your meetings
5. Verify data appears in Supabase dashboard

## Migration History

All migrations are sourced from `C:\sophie\backend\setup\migrations\` in the Python backend and have been incorporated into the Next.js frontend for ease of deployment.

**Created:** 2026-01-21
**Version:** 1.0

---

# Token-Based Credit System Migrations

## New Migrations (2026-01-30)

The following migrations implement a token-based credit calculation system that charges credits based on actual API usage rather than a fixed rate.

| File | Purpose | Run Order |
|------|---------|-----------|
| `20260130_000_cleanup_old_token_system.sql` | Remove deprecated token tracking columns | 1st |
| `20260130_001_add_credit_baseline.sql` | Add credit baseline table and functions | 2nd |
| `20260130_002_add_actual_cost.sql` | Add cost tracking columns to token_usage | 3rd |

## Running Token System Migrations

### Using Supabase CLI

```bash
# Run all token system migrations in order
supabase db execute --file lib/migrations/20260130_000_cleanup_old_token_system.sql
supabase db execute --file lib/migrations/20260130_001_add_credit_baseline.sql
supabase db execute --file lib/migrations/20260130_002_add_actual_cost.sql
```

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste each migration file content
4. Execute them **in order** (000 → 001 → 002)

## Migration Details

### 20260130_000_cleanup_old_token_system.sql

**Removes deprecated token tracking:**
- Drops `tokens_used_this_month`, `total_tokens_used`, `last_token_reset_at` from users table
- Drops `total_tokens` from token_usage table
- Updates `track_token_usage()` to not update user aggregate counts
- Updates `reset_monthly_usage()` to only handle credits

**Why:** The old system tracked raw token counts at the user level, which is redundant now that we have per-operation tracking in `token_usage` table.

### 20260130_001_add_credit_baseline.sql

**Creates credit baseline system:**
- Creates `credit_baseline` table to store rolling averages
- Adds `get_credit_baseline()` function to retrieve current baseline
- Adds `update_credit_baseline()` function to recalculate baseline from recent usage
- Inserts initial baseline of 5000 effective tokens

**Why:** Credits are calculated relative to a baseline (average effective tokens per attendee). This allows the system to self-adjust as usage patterns change.

### 20260130_002_add_actual_cost.sql

**Adds cost tracking:**
- Adds `effective_tokens` column to token_usage (weighted token count)
- Adds `actual_cost_usd` column to token_usage (real API cost)
- Adds `calculate_actual_cost()` function for cost calculations
- Creates index on `actual_cost_usd` for analytics

**Why:** Track the actual USD cost of each research operation for transparency and cost analysis.

## Verification

After running migrations, verify the changes:

```sql
-- Check that old token columns are removed from users table
\d users

-- Verify credit_baseline table exists
SELECT * FROM credit_baseline;

-- Verify new columns in token_usage
\d token_usage

-- Test the get_credit_baseline function
SELECT get_credit_baseline();
-- Expected: 5000.00

-- Test calculate_actual_cost function
SELECT calculate_actual_cost(2000, 500, 0);
-- Expected: 0.002500 ($0.0025)
```

## New Database Objects

### credit_baseline Table
```sql
id                      SERIAL PRIMARY KEY
avg_tokens_per_attendee DECIMAL(10, 2) NOT NULL
sample_size             INTEGER NOT NULL
updated_at              TIMESTAMPTZ NOT NULL
created_at              TIMESTAMPTZ NOT NULL
```

### token_usage Table (new columns)
```sql
effective_tokens        DECIMAL(10, 2)  -- Weighted token count
actual_cost_usd         DECIMAL(10, 6)  -- Real API cost
```

### New Functions

**`get_credit_baseline()`**
Returns the current credit baseline (average effective tokens per attendee).

```sql
SELECT get_credit_baseline();
-- Returns: 5000.00 (initially)
```

**`update_credit_baseline(window_size INTEGER DEFAULT 1000)`**
Recalculates the baseline from recent person research operations.

```sql
SELECT update_credit_baseline(1000); -- Use last 1000 operations
```

**`calculate_actual_cost(input_tokens, output_tokens, cached_tokens)`**
Calculates the actual USD cost based on Gemini 3 Flash Preview pricing.

```sql
SELECT calculate_actual_cost(2000, 500, 0);
-- Returns: 0.002500 ($0.0025)
```

## Credit Calculation Formula

### Token Weights (Based on Gemini 3 Flash Preview Pricing)
- Input tokens: **1.0** (baseline, $0.50 per 1M tokens)
- Output tokens: **6.0** (6x more expensive, $3.00 per 1M tokens)
- Cached tokens: **0.25** (75% discount, $0.125 per 1M tokens)

### Effective Tokens
```
effective_tokens =
  (input_tokens × 1.0) +
  (output_tokens × 6.0) +
  (cached_tokens × 0.25)
```

### Credits Consumed
```
raw_credits = effective_tokens ÷ avg_tokens_per_attendee
rounded_credits = ceil(raw_credits / 0.25) × 0.25
credits_consumed = max(rounded_credits, 0.25)
```

**Billing granularity:** 0.25 credits (0.25, 0.5, 0.75, 1.0, 1.25, etc.)
**Minimum charge:** 0.25 credits per attendee

### Actual Cost (USD)
```
cost = (
  (input_tokens × $0.50) +
  (output_tokens × $3.00) +
  (cached_tokens × $0.125)
) / 1,000,000
```

## Example Calculations

### Example 1: Typical Attendee
- Input: 2,000 tokens
- Output: 500 tokens
- Cached: 0 tokens
- **Effective tokens**: 5,000
- **Credits consumed**: 1.0
- **Actual cost**: $0.0025

### Example 2: With Caching (Cheaper)
- Input: 1,500 tokens
- Output: 400 tokens
- Cached: 1,000 tokens
- **Effective tokens**: 4,150
- **Credits consumed**: 1.0
- **Actual cost**: $0.00213

### Example 3: Complex Research
- Input: 3,500 tokens
- Output: 1,200 tokens
- Cached: 0 tokens
- **Effective tokens**: 10,700
- **Credits consumed**: 2.25
- **Actual cost**: $0.00535

## Baseline Updates

The credit baseline should be updated periodically to reflect actual usage patterns:

```sql
-- Update baseline with last 1000 person research operations
SELECT update_credit_baseline(1000);

-- Check the new baseline
SELECT * FROM credit_baseline ORDER BY created_at DESC LIMIT 1;
```

**Recommended schedule:**
- **Weekly** during initial deployment (first month)
- **Monthly** after system stabilizes

## Monitoring Queries

### Recent Credit Consumption
```sql
SELECT
  created_at,
  agent_type,
  input_tokens,
  output_tokens,
  cached_tokens,
  effective_tokens,
  credits_consumed,
  actual_cost_usd,
  ROUND((actual_cost_usd / NULLIF(credits_consumed, 0))::NUMERIC, 6) as cost_per_credit
FROM token_usage
WHERE agent_type = 'person'
  AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 50;
```

### Credit Baseline History
```sql
SELECT
  created_at,
  avg_tokens_per_attendee,
  sample_size
FROM credit_baseline
ORDER BY created_at DESC;
```

### Average Credits Per Attendee Over Time
```sql
SELECT
  DATE_TRUNC('day', created_at) as day,
  AVG(credits_consumed) as avg_credits,
  AVG(actual_cost_usd) as avg_cost,
  COUNT(*) as research_count
FROM token_usage
WHERE agent_type = 'person'
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY day
ORDER BY day DESC;
```

### Cost Analysis
```sql
-- Total cost and credits by user
SELECT
  user_id,
  COUNT(*) as research_count,
  SUM(credits_consumed) as total_credits,
  SUM(actual_cost_usd) as total_cost_usd,
  AVG(credits_consumed) as avg_credits_per_research,
  AVG(actual_cost_usd) as avg_cost_per_research
FROM token_usage
WHERE agent_type = 'person'
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY user_id
ORDER BY total_cost_usd DESC;
```

## Rollback

If you need to rollback these migrations:

```sql
-- Rollback Migration 2
ALTER TABLE token_usage DROP COLUMN IF EXISTS effective_tokens;
ALTER TABLE token_usage DROP COLUMN IF EXISTS actual_cost_usd;
DROP FUNCTION IF EXISTS calculate_actual_cost(INTEGER, INTEGER, INTEGER);
DROP INDEX IF EXISTS idx_token_usage_cost;

-- Rollback Migration 1
DROP FUNCTION IF EXISTS update_credit_baseline(INTEGER);
DROP FUNCTION IF EXISTS get_credit_baseline();
DROP TABLE IF EXISTS credit_baseline;

-- Rollback Migration 0 (restore old columns - data will be lost)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS tokens_used_this_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_tokens_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_token_reset_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.token_usage
ADD COLUMN IF NOT EXISTS total_tokens INTEGER;
```

## Impact on Users

### Before (Hardcoded)
- 1 credit = 1 attendee (fixed)
- No visibility into token usage
- No cost tracking

### After (Token-Based)
- Credits vary based on actual token usage (0.25 - 2.5+ credits typical)
- Users see exact token usage per research
- Full cost transparency
- Caching reduces costs
- Average remains ~1 credit per attendee

## Code Changes

The following code files were updated to support the token-based credit system:

1. **`lib/research/credit-config.ts`** (NEW)
   - Credit calculation constants and functions
   - `calculateEffectiveTokens()` - Weighted token calculation
   - `calculateActualCost()` - USD cost calculation
   - `getCreditBaseline()` - Fetch baseline from database
   - `calculateCreditsForTokens()` - Main credit calculation

2. **`lib/research/token-tracker.ts`** (UPDATED)
   - Replaced hardcoded `creditCost = 1` with dynamic calculation
   - Added effective tokens and actual cost tracking
   - Removed deprecated `getUserTokenUsage()` method
   - Enhanced logging for credit calculations

3. **`lib/research/check-usage.ts`** (NO CHANGES)
   - Estimation remains at 1 credit per attendee
   - Actual credits calculated at runtime based on real usage

## References

- [Gemini 3 Flash API Pricing Guide](https://www.aifreeapi.com/en/posts/gemini-3-flash-api-price)
- [Google Gemini API Pricing 2026](https://www.metacto.com/blogs/the-true-cost-of-google-gemini-a-guide-to-api-pricing-and-integration)
- [Gemini Developer API pricing](https://ai.google.dev/gemini-api/docs/pricing)
