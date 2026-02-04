-- ============================================================================
-- MeetReady - Add Missing Token Columns
-- Migration: 14_add_missing_token_columns
-- Description: Add tool_use_prompt_tokens and thoughts_tokens if they don't exist
-- ============================================================================

-- Add columns if they don't exist
ALTER TABLE public.token_usage
  ADD COLUMN IF NOT EXISTS tool_use_prompt_tokens INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS thoughts_tokens INTEGER DEFAULT 0;

-- Update comments
COMMENT ON COLUMN public.token_usage.thoughts_tokens IS 'Extended thinking tokens consumed (billed at output rate)';
COMMENT ON COLUMN public.token_usage.tool_use_prompt_tokens IS 'Tokens consumed by the grounding tool internal prompt (billed at input rate)';
