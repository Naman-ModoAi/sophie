-- ============================================================================
-- Fix users table id column to accept Supabase Auth UUID
-- Migration: 19_fix_users_id_constraint
-- Description: Remove DEFAULT gen_random_uuid() from users.id to allow
--              manual setting of UUID from Supabase Auth (auth.uid())
-- ============================================================================

-- Remove the default value from the id column
-- This allows us to explicitly set id = auth.uid() during upsert
ALTER TABLE public.users
  ALTER COLUMN id DROP DEFAULT;

-- Comment explaining the constraint
COMMENT ON COLUMN public.users.id IS 'Must match Supabase Auth UUID (auth.uid()) for RLS policies to work';
