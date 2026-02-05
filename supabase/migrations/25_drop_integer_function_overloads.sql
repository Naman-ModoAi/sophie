-- ============================================================================
-- Drop old INTEGER overloads of credit functions
-- Migration: 25_drop_integer_function_overloads
-- Description:
--   Migration 21 changed consume_credits and check_credit_balance from INTEGER
--   to NUMERIC parameters. But CREATE OR REPLACE with a different signature
--   creates a NEW overload instead of replacing the old one. PostgREST cannot
--   resolve the ambiguity, causing PGRST203 errors.
--   This migration drops the old INTEGER versions.
-- ============================================================================

-- Drop old INTEGER overload of consume_credits
DROP FUNCTION IF EXISTS public.consume_credits(UUID, INTEGER, UUID, TEXT);

-- Drop old INTEGER overload of check_credit_balance
DROP FUNCTION IF EXISTS public.check_credit_balance(UUID, INTEGER);
