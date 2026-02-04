-- ============================================================================
-- MeetReady - Credit Configuration System
-- Migration: 10_credit_config
-- Description: Store credit pricing parameters in database for easy updates
-- ============================================================================

-- ============================================================================
-- CREDIT_CONFIG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.credit_config (
  id SERIAL PRIMARY KEY,
  config_key TEXT UNIQUE NOT NULL,
  config_value DECIMAL(10, 6) NOT NULL,
  config_description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial pricing configuration (use ON CONFLICT for idempotency)
INSERT INTO public.credit_config (config_key, config_value, config_description) VALUES
  -- Gemini API Pricing (per 1M tokens) - Gemini 3 Flash Preview
  ('gemini_input_price_per_1m', 0.50, 'Gemini input token price per 1M tokens (USD)'),
  ('gemini_output_price_per_1m', 3.00, 'Gemini output token price per 1M tokens (USD)'),
  ('gemini_cached_price_per_1m', 0.125, 'Gemini cached token price per 1M tokens (USD)'),
  ('gemini_thinking_price_per_1m', 3.00, 'Gemini thinking token price per 1M tokens (USD) - billed at output rate'),
  ('gemini_tool_use_price_per_1m', 0.50, 'Gemini tool use token price per 1M tokens (USD) - billed at input rate'),
  ('gemini_search_price_per_1000', 14.0, 'Gemini grounding search price per 1000 queries (USD) - Gemini 3.x per-query billing'),

  -- Credit Calculation Parameters
  ('credit_baseline_usd', 0.01, 'Cost baseline for credit calculation ($0.01 = 1 credit)'),
  ('credit_rounding_step', 0.05, 'Credit rounding granularity (round to nearest 0.05)')
ON CONFLICT (config_key) DO NOTHING;

-- Add index for fast lookups
CREATE INDEX IF NOT EXISTS idx_credit_config_key ON public.credit_config(config_key);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get credit config value
CREATE OR REPLACE FUNCTION get_credit_config(p_key TEXT)
RETURNS DECIMAL AS $$
  SELECT config_value
  FROM public.credit_config
  WHERE config_key = p_key;
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION get_credit_config IS 'Get a single credit config value by key';

-- Function to update credit config value
CREATE OR REPLACE FUNCTION update_credit_config(p_key TEXT, p_value DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE public.credit_config
  SET config_value = p_value, updated_at = NOW()
  WHERE config_key = p_key;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Config key % not found', p_key;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_credit_config IS 'Update a credit config value (requires exact key match)';

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.credit_config ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for idempotency
DROP POLICY IF EXISTS "Service role can manage credit config" ON public.credit_config;
DROP POLICY IF EXISTS "Authenticated users can read credit config" ON public.credit_config;

-- Service role can manage config
CREATE POLICY "Service role can manage credit config"
  ON public.credit_config
  FOR ALL
  TO service_role
  USING (true);

-- Authenticated users can read config (for transparency)
CREATE POLICY "Authenticated users can read credit config"
  ON public.credit_config
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.credit_config IS 'Credit pricing configuration - easily update prices without code changes';
COMMENT ON COLUMN public.credit_config.config_key IS 'Unique configuration key (e.g., gemini_input_price_per_1m)';
COMMENT ON COLUMN public.credit_config.config_value IS 'Numeric configuration value (supports up to 6 decimal places)';
COMMENT ON COLUMN public.credit_config.config_description IS 'Human-readable description of what this config controls';
