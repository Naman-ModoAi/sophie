-- ============================================================================
-- SophiHQ - Credit Cost Baseline System
-- Migration: 12_credit_cost_baseline
-- Description: Cost-based baseline for credit calculation (replaces token-based baseline)
-- ============================================================================

-- ============================================================================
-- CREDIT_COST_BASELINE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.credit_cost_baseline (
  id SERIAL PRIMARY KEY,
  avg_cost_per_attendee DECIMAL(10, 6) NOT NULL,
  sample_size INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial baseline ($0.01 = 1 credit) - only if table is empty
INSERT INTO public.credit_cost_baseline (avg_cost_per_attendee, sample_size)
SELECT 0.01, 0
WHERE NOT EXISTS (SELECT 1 FROM public.credit_cost_baseline);

-- Add index for latest baseline lookup
CREATE INDEX IF NOT EXISTS idx_credit_cost_baseline_created_at
  ON public.credit_cost_baseline(created_at DESC);

-- ============================================================================
-- BASELINE MANAGEMENT FUNCTIONS
-- ============================================================================

-- Get current cost baseline
CREATE OR REPLACE FUNCTION get_credit_baseline()
RETURNS DECIMAL AS $$
  SELECT avg_cost_per_attendee
  FROM credit_cost_baseline
  ORDER BY created_at DESC
  LIMIT 1;
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION get_credit_baseline IS 'Returns current cost baseline ($0.01 = 1 credit by default)';

-- Update cost baseline from actual usage
CREATE OR REPLACE FUNCTION update_credit_baseline(p_window_size INTEGER DEFAULT 1000)
RETURNS VOID AS $$
DECLARE
  v_avg_cost DECIMAL(10, 6);
  v_count INTEGER;
  v_input_price DECIMAL(10, 6);
  v_output_price DECIMAL(10, 6);
  v_cached_price DECIMAL(10, 6);
  v_thinking_price DECIMAL(10, 6);
  v_tool_use_price DECIMAL(10, 6);
  v_search_price DECIMAL(10, 6);
BEGIN
  -- Get current pricing configuration
  SELECT
    get_credit_config('gemini_input_price_per_1m'),
    get_credit_config('gemini_output_price_per_1m'),
    get_credit_config('gemini_cached_price_per_1m'),
    get_credit_config('gemini_thinking_price_per_1m'),
    get_credit_config('gemini_tool_use_price_per_1m'),
    get_credit_config('gemini_search_price_per_1000')
  INTO
    v_input_price,
    v_output_price,
    v_cached_price,
    v_thinking_price,
    v_tool_use_price,
    v_search_price;

  -- Calculate average COST (not tokens!) from recent person research
  SELECT
    AVG(
      -- Token costs
      (input_tokens / 1000000.0) * v_input_price +
      (output_tokens / 1000000.0) * v_output_price +
      (COALESCE(cached_tokens, 0) / 1000000.0) * v_cached_price +
      (COALESCE(thoughts_tokens, 0) / 1000000.0) * v_thinking_price +
      (COALESCE(tool_use_prompt_tokens, 0) / 1000000.0) * v_tool_use_price +
      -- Search costs
      (CASE
        WHEN web_search_queries IS NOT NULL
        THEN (array_length(web_search_queries, 1) / 1000.0) * v_search_price
        ELSE 0
      END)
    ),
    COUNT(*)
  INTO v_avg_cost, v_count
  FROM token_usage
  WHERE agent_type = 'person'
    AND created_at > NOW() - INTERVAL '30 days'
  ORDER BY created_at DESC
  LIMIT p_window_size;

  -- Insert new baseline if we have data
  IF v_avg_cost IS NOT NULL AND v_count > 0 THEN
    INSERT INTO credit_cost_baseline (avg_cost_per_attendee, sample_size)
    VALUES (v_avg_cost, v_count);

    RAISE NOTICE 'Updated cost baseline to $% from % samples', v_avg_cost, v_count;
  ELSE
    RAISE NOTICE 'No data available to update baseline';
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_credit_baseline IS 'Update cost baseline from actual usage (calculates average cost per person research)';

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.credit_cost_baseline ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for idempotency
DROP POLICY IF EXISTS "Service role can manage baseline" ON public.credit_cost_baseline;
DROP POLICY IF EXISTS "Authenticated users can read baseline" ON public.credit_cost_baseline;

-- Service role can manage baseline
CREATE POLICY "Service role can manage baseline"
  ON public.credit_cost_baseline
  FOR ALL
  TO service_role
  USING (true);

-- Authenticated users can read baseline (for transparency)
CREATE POLICY "Authenticated users can read baseline"
  ON public.credit_cost_baseline
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.credit_cost_baseline IS 'Cost-based baseline for credit calculation (1 credit = $0.01 by default)';
COMMENT ON COLUMN public.credit_cost_baseline.avg_cost_per_attendee IS 'Average cost in USD per person research (updated from actual usage)';
COMMENT ON COLUMN public.credit_cost_baseline.sample_size IS 'Number of samples used to calculate this baseline';
