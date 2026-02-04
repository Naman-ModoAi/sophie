-- Add Gemini 2.x/3.x pricing configuration
-- Migration: 16_add_grounding_config.sql
-- Date: 2026-02-04
-- Description: Add grounding cost config and pre-research cost estimation config

-- Add Gemini 2.x per-prompt grounding pricing
-- Default to 0 (Gemini 3.x uses per-query search pricing instead)
-- Set to 35.0 when using Gemini 2.x
INSERT INTO public.credit_config (config_key, config_value, config_description) VALUES
  ('gemini_grounding_price_per_1000', 0, 'Gemini per-prompt grounding price per 1000 prompts (USD) - Gemini 2.x pricing, set to 0 for Gemini 3.x');

-- Add estimated average cost per person for pre-research credit checks
-- This replaces the old "1 credit = 1 attendee" hardcoded logic
-- Default: $0.015 per person (1.5 credits) based on typical token + search costs
INSERT INTO public.credit_config (config_key, config_value, config_description) VALUES
  ('credit_estimate_per_person', 0.015, 'Estimated average cost per person research (USD) - used for pre-research credit checks');

-- Verify insertions
SELECT config_key, config_value, config_description
FROM public.credit_config
WHERE config_key IN ('gemini_grounding_price_per_1000', 'credit_estimate_per_person');
