-- Migration: Add token usage tracking
-- Date: 2026-01-26
-- Description: Track Gemini API token consumption per user

-- Add token tracking columns to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS tokens_used_this_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_tokens_used BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_token_reset_at TIMESTAMP WITH TIME ZONE DEFAULT DATE_TRUNC('month', NOW());

-- Create token_usage table for detailed tracking
CREATE TABLE IF NOT EXISTS public.token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE SET NULL,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('person', 'company', 'orchestrator')),
  model_name TEXT NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  cached_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create api_usage table for external API tracking (Serper, etc.)
CREATE TABLE IF NOT EXISTS public.api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE SET NULL,
  api_name TEXT NOT NULL CHECK (api_name IN ('serper', 'resend', 'other')),
  operation_type TEXT NOT NULL, -- 'search', 'email', etc.
  request_count INTEGER NOT NULL DEFAULT 1,
  metadata JSONB, -- Store query, num_results, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for querying by user
CREATE INDEX IF NOT EXISTS idx_token_usage_user_id ON public.token_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_meeting_id ON public.token_usage(meeting_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_created_at ON public.token_usage(created_at);

CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON public.api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_meeting_id ON public.api_usage(meeting_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_api_name ON public.api_usage(api_name);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON public.api_usage(created_at);

-- RLS policies for token_usage
ALTER TABLE public.token_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own token usage"
  ON public.token_usage
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert token usage (backend service)
CREATE POLICY "Service can insert token usage"
  ON public.token_usage
  FOR INSERT
  WITH CHECK (true);

-- RLS policies for api_usage
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own API usage"
  ON public.api_usage
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert API usage"
  ON public.api_usage
  FOR INSERT
  WITH CHECK (true);

-- Drop old function if exists (to avoid signature conflicts)
DROP FUNCTION IF EXISTS public.track_token_usage(UUID, UUID, TEXT, TEXT, INTEGER, INTEGER);

-- Function to track token usage
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
  v_total_tokens INTEGER;
  v_usage_id UUID;
BEGIN
  v_total_tokens := p_input_tokens + p_output_tokens;

  -- Insert token usage record
  INSERT INTO public.token_usage (
    user_id,
    meeting_id,
    agent_type,
    model_name,
    input_tokens,
    output_tokens,
    cached_tokens,
    total_tokens
  ) VALUES (
    p_user_id,
    p_meeting_id,
    p_agent_type,
    p_model_name,
    p_input_tokens,
    p_output_tokens,
    p_cached_tokens,
    v_total_tokens
  ) RETURNING id INTO v_usage_id;

  -- Update user aggregate counts
  UPDATE public.users
  SET
    tokens_used_this_month = COALESCE(tokens_used_this_month, 0) + v_total_tokens,
    total_tokens_used = COALESCE(total_tokens_used, 0) + v_total_tokens
  WHERE id = p_user_id;

  RETURN v_usage_id;
END;
$$;

-- Update reset_monthly_usage to also reset token counter
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.users
  SET
    meetings_used = 0,
    tokens_used_this_month = 0,
    usage_reset_at = DATE_TRUNC('month', NOW() + INTERVAL '1 month'),
    last_token_reset_at = DATE_TRUNC('month', NOW())
  WHERE plan_type = 'free';

  RAISE NOTICE 'Reset usage for % free users', (SELECT COUNT(*) FROM users WHERE plan_type = 'free');
END;
$$;

-- Function to track external API usage
CREATE OR REPLACE FUNCTION public.track_api_usage(
  p_user_id UUID,
  p_meeting_id UUID,
  p_api_name TEXT,
  p_operation_type TEXT,
  p_request_count INTEGER DEFAULT 1,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_usage_id UUID;
BEGIN
  -- Insert API usage record
  INSERT INTO public.api_usage (
    user_id,
    meeting_id,
    api_name,
    operation_type,
    request_count,
    metadata
  ) VALUES (
    p_user_id,
    p_meeting_id,
    p_api_name,
    p_operation_type,
    p_request_count,
    p_metadata
  ) RETURNING id INTO v_usage_id;

  RETURN v_usage_id;
END;
$$;

COMMENT ON TABLE public.token_usage IS 'Detailed Gemini API token usage tracking per user and meeting';
COMMENT ON TABLE public.api_usage IS 'External API usage tracking (Serper, Resend, etc.)';
COMMENT ON FUNCTION public.track_token_usage IS 'Records token usage and updates user aggregate counts';
COMMENT ON FUNCTION public.track_api_usage IS 'Records external API usage for cost tracking';
