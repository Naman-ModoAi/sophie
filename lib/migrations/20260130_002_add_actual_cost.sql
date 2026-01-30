-- Migration 2: Add Actual Cost Tracking
-- Add effective_tokens and actual_cost_usd columns to token_usage

-- Add actual cost columns to token_usage
ALTER TABLE token_usage
ADD COLUMN IF NOT EXISTS effective_tokens DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS actual_cost_usd DECIMAL(10, 6);

-- Gemini 3 Flash Preview pricing (per 1M tokens)
CREATE OR REPLACE FUNCTION calculate_actual_cost(
  p_input_tokens INTEGER,
  p_output_tokens INTEGER,
  p_cached_tokens INTEGER
)
RETURNS DECIMAL AS $$
DECLARE
  v_input_cost DECIMAL(10, 6) := 0.50;    -- $0.50 per 1M
  v_output_cost DECIMAL(10, 6) := 3.00;   -- $3.00 per 1M
  v_cached_cost DECIMAL(10, 6) := 0.125;  -- $0.125 per 1M (75% discount)
BEGIN
  RETURN (
    (p_input_tokens * v_input_cost +
     p_output_tokens * v_output_cost +
     p_cached_tokens * v_cached_cost) / 1000000.0
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add index for cost analysis
CREATE INDEX IF NOT EXISTS idx_token_usage_cost
  ON token_usage(actual_cost_usd)
  WHERE actual_cost_usd IS NOT NULL;
