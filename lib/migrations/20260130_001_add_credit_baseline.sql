-- Migration 1: Add Credit Baseline System
-- Store rolling average baseline for credit calculations

-- Create credit_baseline table
CREATE TABLE IF NOT EXISTS credit_baseline (
  id SERIAL PRIMARY KEY,
  avg_tokens_per_attendee DECIMAL(10, 2) NOT NULL,
  sample_size INTEGER NOT NULL, -- number of attendees in calculation
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert initial baseline (from current avg: 2K input + 500 output with 6x output weight)
-- effective_tokens = (2000 × 1.0) + (500 × 6.0) = 5,000
INSERT INTO credit_baseline (avg_tokens_per_attendee, sample_size)
VALUES (5000, 0);

-- Function to get current baseline
CREATE OR REPLACE FUNCTION get_credit_baseline()
RETURNS DECIMAL AS $$
  SELECT avg_tokens_per_attendee
  FROM credit_baseline
  ORDER BY id DESC
  LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Function to update baseline (run periodically)
CREATE OR REPLACE FUNCTION update_credit_baseline(p_window_size INTEGER DEFAULT 1000)
RETURNS VOID AS $$
DECLARE
  v_avg_effective_tokens DECIMAL(10, 2);
  v_count INTEGER;
BEGIN
  -- Calculate rolling average from recent attendee research
  -- Using weighted formula: input×1.0 + output×6.0 + cached×0.25
  SELECT
    AVG((input_tokens * 1.0) + (output_tokens * 6.0) + (cached_tokens * 0.25)),
    COUNT(*)
  INTO v_avg_effective_tokens, v_count
  FROM token_usage
  WHERE agent_type = 'person'
    AND created_at > NOW() - INTERVAL '30 days'
  ORDER BY created_at DESC
  LIMIT p_window_size;

  -- Insert new baseline if we have data
  IF v_avg_effective_tokens IS NOT NULL AND v_count > 0 THEN
    INSERT INTO credit_baseline (avg_tokens_per_attendee, sample_size)
    VALUES (v_avg_effective_tokens, v_count);
  END IF;
END;
$$ LANGUAGE plpgsql;
