-- Add grounded prompt count tracking
-- Migration: 17_add_grounding_prompt_count.sql
-- Date: 2026-02-04
-- Description: Add column to track Gemini 2.x per-prompt grounding usage

-- Add grounded_prompt_count column to token_usage table
ALTER TABLE public.token_usage
ADD COLUMN IF NOT EXISTS grounded_prompt_count INTEGER DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN public.token_usage.grounded_prompt_count IS 'Number of grounded prompts (Gemini 2.x per-prompt billing)';

-- Verify column addition
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'token_usage'
  AND column_name = 'grounded_prompt_count';
