-- ============================================================================
-- SophiHQ - Update track_token_usage Function
-- Migration: 13_update_track_token_usage_function
-- Description: Clean up old function overloads (the canonical version is in 05_functions.sql)
-- ============================================================================

-- Drop old overloads that don't include grounded_prompt_count
-- The correct 11-parameter version is defined in 05_functions.sql
DROP FUNCTION IF EXISTS public.track_token_usage(UUID, UUID, TEXT, TEXT, INTEGER, INTEGER, INTEGER, INTEGER, TEXT[]);
DROP FUNCTION IF EXISTS public.track_token_usage(UUID, UUID, TEXT, TEXT, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, TEXT[]);

-- Note: The canonical function with signature:
-- (UUID, UUID, TEXT, TEXT, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, TEXT[], INTEGER)
-- is defined in 05_functions.sql and includes p_grounded_prompt_count
