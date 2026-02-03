-- Migration: Fix token_usage columns to support decimal values
-- Date: 2026-01-31
-- Description: Change credits_consumed to DECIMAL and add effective_tokens column

-- Change credits_consumed from INTEGER to DECIMAL
ALTER TABLE public.token_usage
ALTER COLUMN credits_consumed TYPE DECIMAL(10, 2);

-- Add effective_tokens column
ALTER TABLE public.token_usage
ADD COLUMN IF NOT EXISTS effective_tokens DECIMAL(10, 2) DEFAULT 0;

-- Update comments
COMMENT ON COLUMN public.token_usage.credits_consumed IS 'Number of credits consumed for this research operation (supports 0.25 increments)';
COMMENT ON COLUMN public.token_usage.effective_tokens IS 'Weighted token count: input×1.0 + output×6.0 + cached×0.25';

-- Add index for effective_tokens analysis
CREATE INDEX IF NOT EXISTS idx_token_usage_effective_tokens
  ON public.token_usage(effective_tokens)
  WHERE effective_tokens > 0;
