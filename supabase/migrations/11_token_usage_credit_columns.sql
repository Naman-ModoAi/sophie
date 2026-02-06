-- ============================================================================
-- SophiHQ - Add Credit Calculation Columns to Token Usage
-- Migration: 11_token_usage_credit_columns
-- Description: Add columns to store calculated credit costs
-- ============================================================================

-- Add credit calculation columns to token_usage table
ALTER TABLE public.token_usage
  ADD COLUMN IF NOT EXISTS effective_tokens DECIMAL(12, 2),
  ADD COLUMN IF NOT EXISTS actual_cost_usd DECIMAL(10, 6),
  ADD COLUMN IF NOT EXISTS credits_consumed DECIMAL(10, 2);

-- Add index for credit queries
CREATE INDEX IF NOT EXISTS idx_token_usage_credits_consumed ON public.token_usage(credits_consumed)
  WHERE credits_consumed IS NOT NULL;

-- Comments
COMMENT ON COLUMN public.token_usage.effective_tokens IS 'Weighted token count used for credit calculation (deprecated in cost-based system)';
COMMENT ON COLUMN public.token_usage.actual_cost_usd IS 'Actual API cost in USD (includes all token types + search costs)';
COMMENT ON COLUMN public.token_usage.credits_consumed IS 'Credits consumed for this API call (calculated from actual cost)';
