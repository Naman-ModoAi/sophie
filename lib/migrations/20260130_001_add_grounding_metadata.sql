-- Migration: Add grounding metadata and thoughts token tracking
-- Date: 2026-01-30
-- Description: Add web_search_queries and thoughts_tokens columns to track Gemini grounding

-- Add new columns to token_usage table
ALTER TABLE public.token_usage
ADD COLUMN IF NOT EXISTS thoughts_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS web_search_queries TEXT[];

-- Update total_tokens calculation to include thoughts
-- Note: We'll handle this in the function below

-- Add comments
COMMENT ON COLUMN public.token_usage.thoughts_tokens IS 'Thinking/reasoning tokens used by the model';
COMMENT ON COLUMN public.token_usage.web_search_queries IS 'Google Search grounding queries used during this API call';

-- Drop and recreate track_token_usage function with new parameters
DROP FUNCTION IF EXISTS public.track_token_usage(UUID, UUID, TEXT, TEXT, INTEGER, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION public.track_token_usage(
  p_user_id UUID,
  p_meeting_id UUID,
  p_agent_type TEXT,
  p_model_name TEXT,
  p_input_tokens INTEGER,
  p_output_tokens INTEGER,
  p_cached_tokens INTEGER DEFAULT 0,
  p_thoughts_tokens INTEGER DEFAULT 0,
  p_web_search_queries TEXT[] DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_tokens INTEGER;
  v_usage_id UUID;
BEGIN
  -- Total includes input + output + thoughts (cached tokens are a subset of input)
  v_total_tokens := p_input_tokens + p_output_tokens + p_thoughts_tokens;

  -- Insert token usage record
  INSERT INTO public.token_usage (
    user_id,
    meeting_id,
    agent_type,
    model_name,
    input_tokens,
    output_tokens,
    cached_tokens,
    thoughts_tokens,
    total_tokens,
    web_search_queries
  ) VALUES (
    p_user_id,
    p_meeting_id,
    p_agent_type,
    p_model_name,
    p_input_tokens,
    p_output_tokens,
    p_cached_tokens,
    p_thoughts_tokens,
    v_total_tokens,
    p_web_search_queries
  ) RETURNING id INTO v_usage_id;

  -- No user aggregate updates (columns removed in migration 000)

  RETURN v_usage_id;
END;
$$;

COMMENT ON FUNCTION public.track_token_usage IS 'Records token usage with grounding metadata, thoughts tokens, and updates user aggregate counts';
