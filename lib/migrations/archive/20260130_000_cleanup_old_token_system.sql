-- Migration 0: Cleanup Old Token System
-- Remove deprecated token tracking columns and update functions

-- Remove old token tracking from users table
ALTER TABLE public.users
DROP COLUMN IF EXISTS tokens_used_this_month,
DROP COLUMN IF EXISTS total_tokens_used,
DROP COLUMN IF EXISTS last_token_reset_at;

-- Remove redundant total_tokens from token_usage
ALTER TABLE public.token_usage
DROP COLUMN IF EXISTS total_tokens;

-- Update track_token_usage to NOT update user aggregates
CREATE OR REPLACE FUNCTION public.track_token_usage(
  p_user_id UUID,
  p_meeting_id UUID,
  p_agent_type TEXT,
  p_model_name TEXT,
  p_input_tokens INTEGER,
  p_output_tokens INTEGER,
  p_cached_tokens INTEGER DEFAULT 0
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_usage_id UUID;
BEGIN
  -- Just insert record, no aggregate updates
  INSERT INTO public.token_usage (
    user_id,
    meeting_id,
    agent_type,
    model_name,
    input_tokens,
    output_tokens,
    cached_tokens
  ) VALUES (
    p_user_id,
    p_meeting_id,
    p_agent_type,
    p_model_name,
    p_input_tokens,
    p_output_tokens,
    p_cached_tokens
  ) RETURNING id INTO v_usage_id;

  RETURN v_usage_id;
END;
$$;

-- Update reset function to only handle credits
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only reset credits (calls existing credit function)
  PERFORM reset_monthly_credits();
  RAISE NOTICE 'Reset monthly credits for all users';
END;
$$;
