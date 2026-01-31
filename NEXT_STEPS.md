# Next Steps: Token-Based Credit System Deployment

## ✅ Implementation Complete

The token-based credit formula has been fully implemented. Here's what to do next:

## 1. Run Database Migrations

### Option A: Using Supabase CLI (Recommended)

```bash
# Navigate to project directory
cd C:\sophie\frontend

# Run migrations in order
supabase db execute --file lib/migrations/20260130_000_cleanup_old_token_system.sql
supabase db execute --file lib/migrations/20260130_001_add_credit_baseline.sql
supabase db execute --file lib/migrations/20260130_002_add_actual_cost.sql
```

### Option B: Using Supabase Dashboard

1. Go to https://app.supabase.com/
2. Select your project
3. Navigate to **SQL Editor** → **New Query**
4. Copy and paste each migration file **in order**:
   - `lib/migrations/20260130_000_cleanup_old_token_system.sql`
   - `lib/migrations/20260130_001_add_credit_baseline.sql`
   - `lib/migrations/20260130_002_add_actual_cost.sql`
5. Click **Run** for each one

## 2. Verify Migrations

After running migrations, verify in Supabase SQL Editor:

```sql
-- 1. Check that old token columns are removed from users table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
  AND table_schema = 'public';
-- Should NOT show: tokens_used_this_month, total_tokens_used, last_token_reset_at

-- 2. Verify credit_baseline table exists and has initial data
SELECT * FROM credit_baseline;
-- Should show: id=1, avg_tokens_per_attendee=5000, sample_size=0

-- 3. Verify new columns in token_usage
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'token_usage'
  AND table_schema = 'public'
  AND column_name IN ('effective_tokens', 'actual_cost_usd');
-- Should show: effective_tokens (numeric), actual_cost_usd (numeric)

-- 4. Test get_credit_baseline function
SELECT get_credit_baseline();
-- Should return: 5000.00

-- 5. Test calculate_actual_cost function
SELECT calculate_actual_cost(2000, 500, 0);
-- Should return: 0.002500 ($0.0025)
```

## 3. Deploy Code Changes

The code is already updated in your repository. Deploy to your hosting platform:

```bash
# Build the application
npm run build

# Test locally first
npm run dev
# Visit http://localhost:3000 and test meeting research

# Deploy to production (adjust based on your hosting)
# Vercel example:
vercel deploy --prod

# Or push to your main branch if using auto-deployment
git add .
git commit -m "feat: implement token-based credit calculation system"
git push origin main
```

## 4. Test the System

### Test with a Real Meeting

1. Create or sync a meeting with attendees
2. Run research on the meeting
3. Check the logs for credit calculation details:

```
[TokenTracker] Credit calculation:
  effective_tokens=5000.00,
  credits=1.0,
  actual_cost=$0.002500
```

### Verify Database Records

```sql
-- Check recent token usage with new columns
SELECT
  created_at,
  agent_type,
  input_tokens,
  output_tokens,
  cached_tokens,
  effective_tokens,
  credits_consumed,
  actual_cost_usd
FROM token_usage
WHERE agent_type = 'person'
ORDER BY created_at DESC
LIMIT 10;
```

Expected output for typical research:
- `input_tokens`: ~2000
- `output_tokens`: ~500
- `cached_tokens`: 0 (initially)
- `effective_tokens`: ~5000
- `credits_consumed`: ~1.0
- `actual_cost_usd`: ~0.0025

## 5. Monitor Initial Usage

After deploying, monitor usage for the first week:

```sql
-- Daily average credits and costs
SELECT
  DATE_TRUNC('day', created_at) as day,
  COUNT(*) as research_count,
  AVG(credits_consumed) as avg_credits,
  AVG(actual_cost_usd) as avg_cost,
  MIN(credits_consumed) as min_credits,
  MAX(credits_consumed) as max_credits
FROM token_usage
WHERE agent_type = 'person'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY day
ORDER BY day DESC;
```

## 6. Update Baseline (After 1 Week)

Once you have real usage data, update the baseline:

```sql
-- Update baseline from last 1000 person research operations
SELECT update_credit_baseline(1000);

-- Check the new baseline
SELECT * FROM credit_baseline ORDER BY created_at DESC LIMIT 5;
```

The baseline will adjust automatically based on actual usage patterns.

## 7. Set Up Periodic Baseline Updates

### Option A: Database Cron Job (Supabase)

If using Supabase, you can set up a cron job:

1. Go to Supabase Dashboard → Database → Cron Jobs
2. Create new cron job:
   - **Name**: Update Credit Baseline
   - **Schedule**: `0 2 * * 1` (Every Monday at 2 AM)
   - **Command**: `SELECT update_credit_baseline(1000);`

### Option B: Manual Schedule

Add a reminder to run this query weekly/monthly:

```sql
SELECT update_credit_baseline(1000);
```

## 8. Optional: Add Cost Dashboard

Consider adding a user-facing dashboard to show:
- Token usage per research
- Credit consumption history
- Actual costs
- Savings from caching

Example query for user dashboard:

```sql
-- User's research history with costs
SELECT
  m.title as meeting_title,
  t.created_at,
  t.input_tokens,
  t.output_tokens,
  t.cached_tokens,
  t.effective_tokens,
  t.credits_consumed,
  t.actual_cost_usd
FROM token_usage t
JOIN meetings m ON t.meeting_id = m.id
WHERE t.user_id = $1  -- User's ID
  AND t.agent_type = 'person'
ORDER BY t.created_at DESC
LIMIT 50;
```

## Troubleshooting

### Migration Failed: "Permission Denied"

If you see permission errors:
1. Ensure you're running migrations as a database admin
2. Check your Supabase service role key is configured
3. Try running via Supabase Dashboard SQL Editor instead

### Credits Not Being Calculated

Check the logs for errors:
```typescript
// Should see this in application logs:
[TokenTracker] Credit calculation:
  effective_tokens=X,
  credits=Y,
  actual_cost=$Z
```

If not appearing:
1. Check that `credit-config.ts` is being imported correctly
2. Verify `get_credit_baseline()` function exists in database
3. Check for any TypeScript compilation errors

### Baseline Returns Default Value

If logs show:
```
[CreditConfig] Using default baseline: 5000
```

This means the database function failed. Verify:
```sql
SELECT get_credit_baseline();
```

If it returns an error, re-run migration 001.

## Success Criteria

✅ Migrations completed without errors
✅ `credit_baseline` table exists with initial data
✅ `token_usage` has `effective_tokens` and `actual_cost_usd` columns
✅ Research operations log credit calculations
✅ Credits consumed matches formula expectations (~1.0 for typical usage)
✅ Database records show all three values (effective_tokens, credits_consumed, actual_cost_usd)

## Documentation

- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`
- **Migration Guide**: See `lib/migrations/README.md`
- **Code Documentation**: See inline comments in `lib/research/credit-config.ts`

## Support

If you encounter issues:
1. Check application logs for error messages
2. Verify migrations ran successfully
3. Test database functions manually
4. Review `IMPLEMENTATION_SUMMARY.md` for formula details

## Timeline

- **Week 1**: Run migrations, deploy code, monitor initial usage
- **Week 2**: Update baseline with real data
- **Week 3-4**: Continue monitoring, adjust if needed
- **Month 2+**: Set up automated baseline updates (weekly/monthly)
