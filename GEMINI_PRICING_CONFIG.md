# Gemini Pricing Configuration Guide

This document explains how to configure the MeetReady credit system to support both Gemini 2.x and Gemini 3.x pricing models.

---

## Overview

MeetReady uses a flexible, database-driven credit system that can adapt to different Gemini API pricing models:

- **Gemini 3.x**: Uses **per-query search billing** ($14 per 1,000 queries)
- **Gemini 2.x**: Uses **per-prompt grounding billing** ($35 per 1,000 grounded prompts)

The system supports both models using a **zero-weight approach**: both cost types are included in the formula, but you set the unused pricing to 0 in the database.

---

## Credit System Formula

The total cost formula is:

```
Total Cost = Token Cost + Search Cost + Grounding Cost
```

Where:
- **Token Cost**: Based on input/output/cached/thinking tokens (same for both models)
- **Search Cost**: `(searchQueryCount / 1000) * gemini_search_price_per_1000`
- **Grounding Cost**: `(groundedPromptCount / 1000) * gemini_grounding_price_per_1000`

**Key Principle**: Set the unused pricing to 0, and the formula automatically adapts.

---

## Switching Between Models

### Current Default: Gemini 3.x (Per-Query Search)

By default, the system is configured for Gemini 3.x with per-query search billing:

```sql
-- Check current configuration
SELECT config_key, config_value
FROM credit_config
WHERE config_key IN ('gemini_search_price_per_1000', 'gemini_grounding_price_per_1000');
```

Expected result:
```
gemini_search_price_per_1000    | 14.0
gemini_grounding_price_per_1000 | 0.0
```

### Switch to Gemini 2.x (Per-Prompt Grounding)

To switch to Gemini 2.x with per-prompt grounding billing:

```sql
-- Disable search pricing (set to 0)
UPDATE credit_config
SET config_value = 0
WHERE config_key = 'gemini_search_price_per_1000';

-- Enable grounding pricing ($35 per 1000 prompts)
UPDATE credit_config
SET config_value = 35.0
WHERE config_key = 'gemini_grounding_price_per_1000';

-- Verify changes
SELECT config_key, config_value
FROM credit_config
WHERE config_key IN ('gemini_search_price_per_1000', 'gemini_grounding_price_per_1000');
```

Expected result after switch:
```
gemini_search_price_per_1000    | 0.0
gemini_grounding_price_per_1000 | 35.0
```

### Switch Back to Gemini 3.x

To switch back to Gemini 3.x:

```sql
-- Enable search pricing ($14 per 1000 queries)
UPDATE credit_config
SET config_value = 14.0
WHERE config_key = 'gemini_search_price_per_1000';

-- Disable grounding pricing (set to 0)
UPDATE credit_config
SET config_value = 0
WHERE config_key = 'gemini_grounding_price_per_1000';
```

---

## Configuration Cache

The credit system caches configuration values for 5 minutes to reduce database load. After making changes:

1. **Wait 5 minutes** for the cache to expire, OR
2. **Restart the application** to force cache refresh

---

## Pre-Research Cost Estimation

The system estimates credits needed **before** running research using the `credit_estimate_per_person` config:

```sql
-- View current estimation
SELECT config_value
FROM credit_config
WHERE config_key = 'credit_estimate_per_person';
```

Default: `0.015` (= 1.5 credits per person, or $0.015 per person)

### Adjusting the Estimate

If actual costs consistently differ from estimates, update this value:

```sql
-- Set to 2 credits per person ($0.02 per person)
UPDATE credit_config
SET config_value = 0.02
WHERE config_key = 'credit_estimate_per_person';
```

To calculate the right value:
1. Check actual costs in the `token_usage` table:
   ```sql
   SELECT AVG(actual_cost_usd) as avg_cost_per_person
   FROM token_usage
   WHERE agent_type = 'person'
     AND created_at > NOW() - INTERVAL '30 days';
   ```
2. Update `credit_estimate_per_person` to match the average

---

## Cost Calculation Details

### Token Costs (All Models)

Token costs are calculated the same way for both Gemini 2.x and 3.x:

```
Token Cost = (
  (inputTokens * gemini_input_price_per_1m) +
  (outputTokens * gemini_output_price_per_1m) +
  (cachedTokens * gemini_cached_price_per_1m) +
  (thinkingTokens * gemini_thinking_price_per_1m) +
  (toolUseTokens * gemini_tool_use_price_per_1m)
) / 1,000,000
```

Default pricing (from Gemini 3 Flash Preview):
```sql
SELECT config_key, config_value
FROM credit_config
WHERE config_key LIKE 'gemini_%_price_per_1m';
```

### Search Costs (Gemini 3.x Only)

For Gemini 3.x with per-query search:

```
Search Cost = (searchQueryCount / 1000) * 14.0
```

- `searchQueryCount` = number of web search queries detected in `groundingMetadata.webSearchQueries`
- Price: $14 per 1,000 queries

### Grounding Costs (Gemini 2.x Only)

For Gemini 2.x with per-prompt grounding:

```
Grounding Cost = (groundedPromptCount / 1000) * 35.0
```

- `groundedPromptCount` = 1 if `groundingMetadata` exists, 0 otherwise
- Price: $35 per 1,000 grounded prompts
- **Note**: Free tier tracking (1,500 free prompts/day) is not yet implemented

---

## Monitoring Usage

### View Recent Token Usage

```sql
SELECT
  agent_type,
  model_name,
  input_tokens,
  output_tokens,
  web_search_queries,
  grounded_prompt_count,
  credits_consumed,
  actual_cost_usd,
  created_at
FROM token_usage
ORDER BY created_at DESC
LIMIT 20;
```

### Check Cost Accuracy

Compare estimated vs. actual costs:

```sql
SELECT
  COUNT(*) as total_researches,
  AVG(actual_cost_usd) as avg_actual_cost,
  AVG(credits_consumed * 0.01) as avg_billed_cost,
  (AVG(credits_consumed * 0.01) - AVG(actual_cost_usd)) * 100 / AVG(actual_cost_usd) as percent_markup
FROM token_usage
WHERE agent_type = 'person'
  AND created_at > NOW() - INTERVAL '30 days';
```

This shows how much markup is applied due to rounding (should be small).

### Total Cost by Model

```sql
SELECT
  agent_type,
  COUNT(*) as call_count,
  SUM(input_tokens + output_tokens) as total_tokens,
  SUM(ARRAY_LENGTH(web_search_queries, 1)) as total_searches,
  SUM(grounded_prompt_count) as total_grounded_prompts,
  SUM(actual_cost_usd) as total_cost_usd,
  SUM(credits_consumed) as total_credits
FROM token_usage
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY agent_type;
```

---

## Credit Rounding

Credits are rounded to the nearest `credit_rounding_step` (default: 0.05 credits = $0.0005):

```sql
SELECT config_value
FROM credit_config
WHERE config_key = 'credit_rounding_step';
```

To change rounding:

```sql
-- Round to nearest 0.1 credits instead
UPDATE credit_config
SET config_value = 0.1
WHERE config_key = 'credit_rounding_step';
```

---

## Troubleshooting

### Issue: Pre-research estimates are too low

**Solution**: Increase `credit_estimate_per_person`:

```sql
UPDATE credit_config
SET config_value = 0.025  -- Increase from 0.015 to 0.025 (2.5 credits)
WHERE config_key = 'credit_estimate_per_person';
```

### Issue: Users running out of credits unexpectedly

**Check actual costs**:

```sql
SELECT
  user_id,
  COUNT(*) as research_count,
  SUM(credits_consumed) as total_credits_used,
  AVG(credits_consumed) as avg_credits_per_research
FROM token_usage
WHERE agent_type = 'person'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY user_id
ORDER BY total_credits_used DESC;
```

### Issue: Configuration changes not taking effect

**Cause**: 5-minute cache TTL

**Solutions**:
1. Wait 5 minutes
2. Restart the application
3. Force cache clear by restarting the server process

---

## Database Schema Reference

### `credit_config` Table

Key configuration rows:

| config_key | Default Value | Description |
|------------|---------------|-------------|
| `gemini_input_price_per_1m` | 0.50 | Input token price per 1M tokens |
| `gemini_output_price_per_1m` | 3.00 | Output token price per 1M tokens |
| `gemini_cached_price_per_1m` | 0.125 | Cached token price per 1M tokens |
| `gemini_thinking_price_per_1m` | 3.00 | Thinking token price per 1M tokens |
| `gemini_tool_use_price_per_1m` | 0.50 | Tool use token price per 1M tokens |
| `gemini_search_price_per_1000` | 14.0 | Gemini 3.x search price per 1000 queries |
| `gemini_grounding_price_per_1000` | 0.0 | Gemini 2.x grounding price per 1000 prompts |
| `credit_baseline_usd` | 0.01 | $0.01 = 1 credit |
| `credit_rounding_step` | 0.05 | Round to nearest 0.05 credits |
| `credit_estimate_per_person` | 0.015 | Average cost estimate per person |

### `token_usage` Table

Key columns for cost tracking:

| Column | Type | Description |
|--------|------|-------------|
| `input_tokens` | INTEGER | Input tokens used |
| `output_tokens` | INTEGER | Output tokens used |
| `web_search_queries` | TEXT[] | Array of search queries (Gemini 3.x) |
| `grounded_prompt_count` | INTEGER | Number of grounded prompts (Gemini 2.x) |
| `credits_consumed` | NUMERIC | Credits charged to user |
| `actual_cost_usd` | NUMERIC | Actual API cost in USD |
| `effective_tokens` | NUMERIC | Weighted token count (deprecated) |

---

## Future Enhancements

### Gemini 2.x Free Tier Tracking

The current system does NOT track the 1,500 free grounded prompts per day. To implement:

1. Add `daily_grounded_prompts_used` column to `users` table
2. Add daily reset logic (cron job at midnight)
3. Modify cost calculation to skip grounding cost for first 1,500 prompts/day
4. Update UI to show "X free prompts remaining today"

See the plan document for detailed implementation steps (currently out of scope).

---

## Questions?

For issues or questions about the credit system, see:
- `CLAUDE.md` - Full codebase documentation
- `CREDIT_SYSTEM_IMPLEMENTATION.md` - Detailed credit system docs
- `lib/research/credit-config.ts` - Cost calculation logic
- `lib/research/token-tracker.ts` - Usage tracking logic

---

**Last Updated**: 2026-02-04
