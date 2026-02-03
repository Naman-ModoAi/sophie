-- ============================================================================
-- PrepFor.app - Token and API Usage Tracking
-- Migration: 04_token_tracking
-- Description: Track Gemini API token consumption and external API usage
-- ============================================================================

-- ============================================================================
-- TOKEN_USAGE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE SET NULL,

  -- Agent and model info
  agent_type TEXT NOT NULL CHECK (agent_type IN ('person', 'company', 'orchestrator')),
  model_name TEXT NOT NULL,

  -- Token counts
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  cached_tokens INTEGER DEFAULT 0,
  thoughts_tokens INTEGER DEFAULT 0,
  tool_use_prompt_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,

  -- Grounding metadata
  web_search_queries TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_token_usage_user_id ON public.token_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_meeting_id ON public.token_usage(meeting_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_created_at ON public.token_usage(created_at);

-- Comments
COMMENT ON TABLE public.token_usage IS 'Detailed Gemini API token usage tracking per user and meeting';
COMMENT ON COLUMN public.token_usage.input_tokens IS 'Input tokens consumed (excluding cached)';
COMMENT ON COLUMN public.token_usage.output_tokens IS 'Output tokens generated';
COMMENT ON COLUMN public.token_usage.cached_tokens IS 'Tokens served from cache (subset of input)';
COMMENT ON COLUMN public.token_usage.thoughts_tokens IS 'Extended thinking tokens consumed';
COMMENT ON COLUMN public.token_usage.tool_use_prompt_tokens IS 'Tokens consumed by the grounding tool internal prompt (charged at input rate)';
COMMENT ON COLUMN public.token_usage.web_search_queries IS 'Array of web search queries performed';

-- ============================================================================
-- API_USAGE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE SET NULL,

  -- API details
  api_name TEXT NOT NULL CHECK (api_name IN ('serper', 'resend', 'other')),
  operation_type TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,

  -- Additional data
  metadata JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON public.api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_meeting_id ON public.api_usage(meeting_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_api_name ON public.api_usage(api_name);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON public.api_usage(created_at);

-- Comments
COMMENT ON TABLE public.api_usage IS 'External API usage tracking (Serper, Resend, etc.)';
COMMENT ON COLUMN public.api_usage.operation_type IS 'Type of operation (search, email, etc.)';
COMMENT ON COLUMN public.api_usage.metadata IS 'Store query, num_results, etc.';
