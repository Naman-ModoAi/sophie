# Cost-Based Credit System Implementation

**Date**: 2026-02-03
**Status**: ✅ Implementation Complete - Ready for Testing

---

## Executive Summary

Successfully implemented a **cost-based credit calculation system** that replaces the old token-weighted formula. The new system calculates credits directly from API costs using the formula:

```
1 credit = $0.01 (1 cent)
```

### Key Improvements

✅ **All token types tracked**: Input, Output, Cached, Thinking, Tool Use
✅ **Search costs included**: Per-query billing for Gemini 3.x grounding
✅ **Database-driven pricing**: Update prices without code changes
✅ **Cost-based baseline**: $0.01 = 1 credit (not token-based)
✅ **Finer granularity**: 0.05 credit rounding (was 0.25)

---

## Files Created/Modified

### 🆕 New Database Migrations

#### 1. `supabase/migrations/10_credit_config.sql`
**Purpose**: Store all pricing parameters in database

**Key Tables**:
- `credit_config` - Stores pricing parameters

**Initial Configuration**:
```sql
gemini_input_price_per_1m = 0.50      -- $0.50 per 1M input tokens
gemini_output_price_per_1m = 3.00     -- $3.00 per 1M output tokens
gemini_cached_price_per_1m = 0.125    -- $0.125 per 1M cached tokens
gemini_thinking_price_per_1m = 3.00   -- $3.00 per 1M thinking tokens (billed at output rate)
gemini_tool_use_price_per_1m = 0.50   -- $0.50 per 1M tool use tokens (billed at input rate)
gemini_search_price_per_1000 = 14.0   -- $14 per 1000 search queries
credit_baseline_usd = 0.01            -- $0.01 = 1 credit
credit_rounding_step = 0.05           -- Round to nearest 0.05 credits
```

**Helper Functions**:
- `get_credit_config(key)` - Fetch a single config value
- `update_credit_config(key, value)` - Update pricing (admin only)

---

#### 2. `supabase/migrations/11_token_usage_credit_columns.sql`
**Purpose**: Add credit calculation columns to `token_usage` table

**New Columns**:
- `effective_tokens` (DECIMAL) - Weighted token count (deprecated in cost-based)
- `actual_cost_usd` (DECIMAL) - Actual API cost in USD
- `credits_consumed` (DECIMAL) - Credits charged for this API call

---

#### 3. `supabase/migrations/12_credit_cost_baseline.sql`
**Purpose**: Cost-based baseline system

**Key Tables**:
- `credit_cost_baseline` - Stores cost baseline history

**Functions**:
- `get_credit_baseline()` - Get current baseline (default: $0.01)
- `update_credit_baseline(window_size)` - Calculate baseline from actual usage data

**How Baseline Works**:
1. Analyzes last N person research API calls
2. Calculates average cost per person (including all tokens + search costs)
3. Updates baseline to reflect actual costs
4. Run weekly via cron job

---

#### 4. `supabase/migrations/13_update_track_token_usage_function.sql`
**Purpose**: Update RPC function to accept `p_tool_use_prompt_tokens` parameter

**Changes**:
- Drops old function signature
- Recreates with correct parameter list

---

#### 5. `supabase/migrations/14_add_missing_token_columns.sql`
**Purpose**: Ensure `tool_use_prompt_tokens` and `thoughts_tokens` columns exist

**Changes**:
- Adds columns if missing (idempotent)

---

### 📝 Modified Code Files

#### 1. `lib/research/credit-config.ts`
**Major Changes**:

**Added Database Config Fetching**:
```typescript
async function getCreditConfig(key: string): Promise<number>
```
- 5-minute cache to avoid DB calls on every calculation
- Falls back to hardcoded defaults if DB unavailable

**Updated `calculateActualCost()`**:
```typescript
export async function calculateActualCost(
  inputTokens: number,
  outputTokens: number,
  cachedTokens: number = 0,
  thinkingTokens: number = 0,        // NEW
  toolUseTokens: number = 0,         // NEW
  searchQueryCount: number = 0       // NEW
): Promise<number>
```

**Formula**:
```typescript
const tokenCost = (
  (inputTokens * inputPrice +
   outputTokens * outputPrice +
   cachedTokens * cachedPrice +
   thinkingTokens * thinkingPrice +    // Billed at output rate ($3.00/1M)
   toolUseTokens * toolUsePrice) /     // Billed at input rate ($0.50/1M)
  1_000_000
);

const searchCost = (searchQueryCount / 1000) * searchPrice;  // $14/1000 queries

return tokenCost + searchCost;
```

**Updated `calculateCreditsForTokens()`**:
```typescript
export async function calculateCreditsForTokens(
  inputTokens: number,
  outputTokens: number,
  cachedTokens: number = 0,
  thinkingTokens: number = 0,
  toolUseTokens: number = 0,
  searchQueryCount: number = 0
): Promise<number>
```

**New Logic**:
1. Calculate total effective **cost** (not tokens)
2. Get baseline from database ($0.01)
3. Raw credits = cost / baseline
4. Round up to nearest 0.05 credits
5. **No minimum** - charge actual cost

---

#### 2. `lib/research/token-tracker.ts`
**Changes in `trackUsage()` method**:

**Extract all token types**:
```typescript
const thinkingTokens = usage.usageMetadata?.thoughtsTokenCount || 0;
const toolUseTokens = usage.usageMetadata?.toolUsePromptTokenCount || 0;
const searchQueryCount = webSearchQueries.length;
```

**Pass to credit calculation**:
```typescript
const creditCost = await calculateCreditsForTokens(
  inputTokens,
  outputTokens,
  cachedTokens,
  thinkingTokens,      // NEW
  toolUseTokens,       // NEW
  searchQueryCount     // NEW
);
```

**Enhanced logging**:
```typescript
console.log(
  `[TokenTracker] Credit calculation: ` +
  `input=${inputTokens}, output=${outputTokens}, cached=${cachedTokens}, ` +
  `thinking=${thinkingTokens}, tool_use=${toolUseTokens}, ` +
  `searches=${searchQueryCount}, ` +
  `effective_tokens=${effectiveTokens.toFixed(2)}, ` +
  `credits=${creditCost.toFixed(2)}, ` +
  `actual_cost=$${actualCost.toFixed(6)}`
);
```

---

## How the System Works

### 1. Person Research Flow

```
User triggers research
    ↓
PersonResearchAgent.researchPerson()
    ↓
Gemini API call with grounding
    ↓
Extract metadata:
  - usageMetadata.promptTokenCount (input)
  - usageMetadata.candidatesTokenCount (output)
  - usageMetadata.cachedContentTokenCount (cached)
  - usageMetadata.thoughtsTokenCount (thinking)      ← NEW
  - usageMetadata.toolUsePromptTokenCount (tool use) ← NEW
  - groundingMetadata.webSearchQueries (searches)    ← NEW
    ↓
TokenTracker.trackUsage()
    ↓
calculateCreditsForTokens() - Calculates cost-based credits
    ↓
Database RPC: track_token_usage() - Stores in token_usage table
    ↓
Update token_usage record with:
  - actual_cost_usd
  - credits_consumed
    ↓
consume_credits() - Deducts credits from user balance
```

---

### 2. Credit Calculation Formula

**Step 1: Calculate Token Costs**
```
Input Cost    = (inputTokens / 1M) × $0.50
Output Cost   = (outputTokens / 1M) × $3.00
Cached Cost   = (cachedTokens / 1M) × $0.125
Thinking Cost = (thinkingTokens / 1M) × $3.00
Tool Use Cost = (toolUseTokens / 1M) × $0.50

Token Cost = Sum of above
```

**Step 2: Calculate Search Costs**
```
Search Cost = (searchQueryCount / 1000) × $14.00
```

**Step 3: Total Cost**
```
Total Cost = Token Cost + Search Cost
```

**Step 4: Convert to Credits**
```
Raw Credits = Total Cost / $0.01
Rounded Credits = ceil(Raw Credits / 0.05) × 0.05
```

---

### 3. Example Calculations

#### Example 1: Simple Research (No Grounding)
```
Input: 2000 tokens
Output: 500 tokens
Cached: 0
Thinking: 0
Tool Use: 0
Searches: 0

Token Cost = (2000/1M × $0.50) + (500/1M × $3.00) = $0.0025
Search Cost = 0
Total Cost = $0.0025

Credits = $0.0025 / $0.01 = 0.25 credits
Rounded = 0.25 credits (no rounding needed)
```

#### Example 2: Research with Grounding
```
Input: 2000 tokens
Output: 500 tokens
Cached: 0
Thinking: 100 tokens
Tool Use: 500 tokens
Searches: 5 queries

Token Cost:
  Input: (2000/1M × $0.50) = $0.001000
  Output: (500/1M × $3.00) = $0.001500
  Thinking: (100/1M × $3.00) = $0.000300
  Tool Use: (500/1M × $0.50) = $0.000250
  Subtotal = $0.003050

Search Cost: (5/1000 × $14.00) = $0.070000

Total Cost = $0.073050

Credits = $0.073050 / $0.01 = 7.305
Rounded = ceil(7.305 / 0.05) × 0.05 = 7.35 credits
```

#### Example 3: High Search Usage
```
Input: 2000 tokens
Output: 500 tokens
Searches: 10 queries

Token Cost = $0.0025
Search Cost = (10/1000 × $14.00) = $0.140000
Total Cost = $0.1425

Credits = 14.25 credits
```

**Observation**: Search costs dominate at high query counts!

---

## Database Schema Reference

### `credit_config` Table
```sql
CREATE TABLE public.credit_config (
  id SERIAL PRIMARY KEY,
  config_key TEXT UNIQUE NOT NULL,
  config_value DECIMAL(10, 6) NOT NULL,
  config_description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `token_usage` Table (Updated)
```sql
CREATE TABLE public.token_usage (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  meeting_id UUID,
  agent_type TEXT NOT NULL,
  model_name TEXT NOT NULL,

  -- Token counts
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cached_tokens INTEGER DEFAULT 0,
  thoughts_tokens INTEGER DEFAULT 0,        -- NEW
  tool_use_prompt_tokens INTEGER DEFAULT 0, -- NEW
  total_tokens INTEGER NOT NULL,

  -- Grounding metadata
  web_search_queries TEXT[],                -- NEW

  -- Credit calculations
  effective_tokens DECIMAL(12, 2),          -- NEW (deprecated)
  actual_cost_usd DECIMAL(10, 6),           -- NEW
  credits_consumed DECIMAL(10, 2),          -- NEW

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `credit_cost_baseline` Table
```sql
CREATE TABLE public.credit_cost_baseline (
  id SERIAL PRIMARY KEY,
  avg_cost_per_attendee DECIMAL(10, 6) NOT NULL,
  sample_size INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## How to Update Pricing

All pricing is stored in the database, so you can update it without code changes!

### View Current Pricing
```sql
SELECT config_key, config_value, config_description
FROM credit_config
ORDER BY config_key;
```

### Update a Single Price
```sql
-- If Gemini raises input price to $0.60/1M
UPDATE credit_config
SET config_value = 0.60, updated_at = NOW()
WHERE config_key = 'gemini_input_price_per_1m';

-- If search price drops to $10/1000 queries
UPDATE credit_config
SET config_value = 10.0, updated_at = NOW()
WHERE config_key = 'gemini_search_price_per_1000';
```

### Update Credit Baseline
```sql
-- Change from $0.01 to $0.008 (1 credit = 0.8 cents)
UPDATE credit_config
SET config_value = 0.008, updated_at = NOW()
WHERE config_key = 'credit_baseline_usd';
```

### Update Rounding Step
```sql
-- Change from 0.05 to 0.01 (1-cent precision)
UPDATE credit_config
SET config_value = 0.01, updated_at = NOW()
WHERE config_key = 'credit_rounding_step';
```

### Bulk Update
```sql
BEGIN;
  UPDATE credit_config SET config_value = 0.60 WHERE config_key = 'gemini_input_price_per_1m';
  UPDATE credit_config SET config_value = 3.50 WHERE config_key = 'gemini_output_price_per_1m';
  UPDATE credit_config SET config_value = 12.0 WHERE config_key = 'gemini_search_price_per_1000';
COMMIT;
```

**Note**: Changes take effect within 5 minutes due to caching. For immediate effect, restart the application.

---

## How to Update Baseline from Usage Data

Run this periodically (weekly recommended) to adjust baseline based on actual costs:

```sql
-- Calculate baseline from last 1000 person research calls
SELECT update_credit_baseline(1000);

-- View baseline history
SELECT * FROM credit_cost_baseline ORDER BY created_at DESC LIMIT 10;
```

**Set up a weekly cron job**:
```sql
-- Create a cron job extension (if not already installed)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule weekly baseline update (every Monday at 2 AM)
SELECT cron.schedule(
  'update-credit-baseline',
  '0 2 * * 1',  -- Every Monday at 2 AM
  $$SELECT update_credit_baseline(1000)$$
);
```

---

## Testing the System

### Manual Test with Real API Call

1. **Trigger a person research** from the dashboard
2. **Check the logs** for credit calculation:
   ```
   [TokenTracker] Credit calculation:
     input=2000, output=500, cached=0,
     thinking=100, tool_use=500, searches=5,
     effective_tokens=5250.00,
     credits=7.35,
     actual_cost=$0.073050
   ```

3. **Verify database entry**:
   ```sql
   SELECT
     input_tokens,
     output_tokens,
     cached_tokens,
     thoughts_tokens,
     tool_use_prompt_tokens,
     web_search_queries,
     actual_cost_usd,
     credits_consumed
   FROM token_usage
   WHERE agent_type = 'person'
   ORDER BY created_at DESC
   LIMIT 5;
   ```

4. **Check user credits**:
   ```sql
   SELECT
     email,
     credits_balance,
     credits_used_this_month
   FROM users
   WHERE email = 'your-email@example.com';
   ```

### Expected Results

For a typical person research with grounding:
- **Input tokens**: 2000-3000
- **Output tokens**: 500-1000
- **Thinking tokens**: 0-2000 (if extended thinking is enabled)
- **Tool use tokens**: 500-6000 (grounding overhead)
- **Search queries**: 5-15
- **Total cost**: $0.05 - $0.25 (5-25 cents)
- **Credits**: 5-25 credits

**Search costs dominate**: With 10 searches, that's $0.14 already, even before token costs!

---

## Migration Checklist

To deploy this system:

- [x] ✅ Create `credit_config` table (migration 10)
- [x] ✅ Add credit columns to `token_usage` (migration 11)
- [x] ✅ Create `credit_cost_baseline` table (migration 12)
- [x] ✅ Update `track_token_usage` function (migration 13)
- [x] ✅ Add missing token columns (migration 14)
- [x] ✅ Update `credit-config.ts` with cost-based logic
- [x] ✅ Update `token-tracker.ts` to track all token types
- [ ] 🔄 Run migrations: `npx supabase db push`
- [ ] 🧪 Test with real person research
- [ ] 📊 Monitor credit consumption for 1 week
- [ ] 🔧 Run `update_credit_baseline()` after 1 week
- [ ] ⏰ Set up weekly cron job for baseline updates

---

## Key Benefits

### 1. **Accurate Cost Tracking**
- Every token type is tracked
- Search costs included
- Direct cost-to-credit mapping

### 2. **Transparent Pricing**
- Users can query `credit_config` to see current prices
- Baseline updates based on actual usage
- No hidden costs

### 3. **Easy Maintenance**
- Update prices in database (no code changes)
- Baseline auto-adjusts from real data
- 5-minute cache for performance

### 4. **Fair Billing**
- No minimum credits (charge actual cost)
- Finer granularity (0.05 vs 0.25)
- Rounds up to protect against undercharging

---

## Troubleshooting

### Issue: Credits seem too high
**Check**:
1. Search query count - high queries = high costs
2. Thinking tokens - extended thinking is expensive
3. Tool use overhead - grounding adds tokens

**Solution**: Review `token_usage` table to see cost breakdown

### Issue: Config cache not updating
**Solution**: Cache TTL is 5 minutes. Restart app for immediate effect.

### Issue: Baseline seems wrong
**Solution**: Run `update_credit_baseline(1000)` to recalculate from recent data

### Issue: Credits not being consumed
**Check**:
1. Is user Pro? Pro users bypass credit checks
2. Check `consume_credits()` logs
3. Verify `credits_consumed` column is being updated

---

## Future Enhancements

### Potential Improvements
1. **Model-specific pricing**: Different prices for different Gemini models
2. **Dynamic search pricing**: Track actual search costs per query
3. **Credit consumption analytics**: Dashboard showing cost breakdown
4. **Budget alerts**: Notify users when approaching credit limit
5. **Cost optimization**: Reduce search queries when possible

### Advanced Features
1. **Credit pooling**: Share credits across team members
2. **Reserved capacity**: Pre-purchase credits at discount
3. **Usage forecasting**: Predict monthly credit needs
4. **Cost attribution**: Track credits per meeting/department

---

## Summary

The new cost-based credit system provides:
- ✅ Complete token tracking (all 5 types)
- ✅ Search cost inclusion (per-query billing)
- ✅ Database-driven pricing (no code changes)
- ✅ Fair and transparent billing
- ✅ Automatic baseline adjustment

**Old System**: 5000 tokens = 1 credit (oversimplified)
**New System**: $0.01 actual cost = 1 credit (accurate)

**Result**: Users pay for exactly what they use, and search costs are properly accounted for.

---

## Update: Gemini 2.x/3.x Flexible Pricing (2026-02-04)

### New Features Added

✅ **Gemini 2.x per-prompt grounding support**: $35 per 1,000 grounded prompts
✅ **Flexible zero-weight model**: Support both Gemini 2.x and 3.x via database config
✅ **Database-driven cost estimation**: Replace hardcoded "1 credit = 1 attendee" logic
✅ **Grounded prompt count tracking**: New column in `token_usage` table

### New Configuration

Added to `credit_config` table:
```sql
gemini_grounding_price_per_1000 = 0     -- $35 per 1000 prompts for Gemini 2.x
credit_estimate_per_person = 0.015      -- Average cost for pre-research estimation
```

### Cost Formula Update

The total cost formula now includes grounding:

```
Total Cost = Token Cost + Search Cost + Grounding Cost
```

Where:
- **Search Cost**: `(searchQueryCount / 1000) * gemini_search_price_per_1000`
- **Grounding Cost**: `(groundedPromptCount / 1000) * gemini_grounding_price_per_1000`

**Switching models**: Set unused pricing to 0
- Gemini 3.x: `gemini_grounding_price_per_1000 = 0`
- Gemini 2.x: `gemini_search_price_per_1000 = 0`

### Pre-Research Estimation

Replaced hardcoded `calculateCreditsNeeded()` with database-driven `estimateCreditsNeeded()`:

**Old Logic** (deprecated):
```typescript
// Fixed: 1 credit per attendee
return attendeeCount;
```

**New Logic**:
```typescript
// Database-driven: Uses actual average cost
const avgCostPerPerson = await getCreditConfig('credit_estimate_per_person');
const costBaseline = await getCreditConfig('credit_baseline_usd');
const estimatedCredits = attendeeCount * (avgCostPerPerson / costBaseline);
return Math.ceil(estimatedCredits / roundingStep) * roundingStep;
```

### Files Modified

1. **Database Migrations**:
   - `16_add_grounding_config.sql` - Add grounding and estimation config
   - `17_add_grounding_prompt_count.sql` - Add `grounded_prompt_count` column
   - `05_functions.sql` - Update `track_token_usage` RPC

2. **Code Updates**:
   - `lib/research/credit-config.ts` - Add grounding cost calculation
   - `lib/research/token-tracker.ts` - Track grounded prompt count
   - `lib/research/check-usage.ts` - Replace hardcoded logic with estimation
   - `app/api/research/route.ts` - Use new estimation function
   - `lib/research/agents/person-agent.ts` - Detect grounding usage
   - `lib/research/agents/company-agent.ts` - Detect grounding usage

3. **Documentation**:
   - `GEMINI_PRICING_CONFIG.md` - NEW: Configuration guide
   - `CLAUDE.md` - Updated credit system section

### Configuration Guide

See `GEMINI_PRICING_CONFIG.md` for detailed instructions on:
- Switching between Gemini 2.x and 3.x pricing
- Adjusting pre-research cost estimates
- Monitoring actual vs. estimated costs
- Troubleshooting configuration issues

---

**Questions or Issues?**
Check the database logs, review `token_usage` records, verify pricing configuration, or see `GEMINI_PRICING_CONFIG.md`.
