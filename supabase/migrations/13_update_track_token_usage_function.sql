-- ============================================================================
-- PrepFor.app - Update track_token_usage Function
-- Migration: 13_update_track_token_usage_function
-- Description: Drop and recreate function to include p_tool_use_prompt_tokens parameter
-- ============================================================================

-- Drop the old function (all overloads)
DROP FUNCTION IF EXISTS public.track_token_usage(UUID, UUID, TEXT, TEXT, INTEGER, INTEGER, INTEGER, INTEGER, TEXT[]);
DROP FUNCTION IF EXISTS public.track_token_usage(UUID, UUID, TEXT, TEXT, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, TEXT[]);

-- Recreate with correct signature
CREATE OR REPLACE FUNCTION public.track_token_usage(
  p_user_id UUID,
  p_meeting_id UUID,
  p_agent_type TEXT,
  p_model_name TEXT,
  p_input_tokens INTEGER,
  p_output_tokens INTEGER,
  p_cached_tokens INTEGER DEFAULT 0,
  p_thoughts_tokens INTEGER DEFAULT 0,
  p_tool_use_prompt_tokens INTEGER DEFAULT 0,
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
  -- Total includes input + output + thoughts + tool_use (cached tokens are a subset of input)
  v_total_tokens := p_input_tokens + p_output_tokens + p_thoughts_tokens + p_tool_use_prompt_tokens;

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
    tool_use_prompt_tokens,
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
    p_tool_use_prompt_tokens,
    v_total_tokens,
    p_web_search_queries
  ) RETURNING id INTO v_usage_id;

  -- No user aggregate updates (credits are tracked separately)

  RETURN v_usage_id;
END;
$$;

COMMENT ON FUNCTION public.track_token_usage IS 'Records token usage with grounding metadata, thoughts tokens, tool use tokens, and search queries';
