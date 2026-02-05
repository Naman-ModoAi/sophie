-- ============================================================================
-- Fix oauth_tokens unique constraint and users RLS policy
-- Migration: 20_fix_oauth_tokens_constraint_and_users_rls
-- Description:
--   1. Add unique constraint on oauth_tokens(user_id, provider) for upsert
--   2. Fix users RLS policy to allow service role inserts
-- ============================================================================

-- ============================================================================
-- FIX 1: Add unique constraint on oauth_tokens for upsert to work
-- ============================================================================

-- Add unique constraint on (user_id, provider) if it doesn't exist
-- This is needed for the ON CONFLICT clause in the OAuth callback
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'oauth_tokens_user_provider_unique'
  ) THEN
    ALTER TABLE public.oauth_tokens
      ADD CONSTRAINT oauth_tokens_user_provider_unique
      UNIQUE (user_id, provider);
  END IF;
END $$;

-- ============================================================================
-- FIX 2: Fix users table RLS to allow service role operations
-- ============================================================================

-- The service_role key should bypass RLS entirely, but just in case,
-- let's ensure there's a proper policy. First drop and recreate.

-- Drop existing service policy
DROP POLICY IF EXISTS "users_service_all" ON public.users;

-- Create a proper policy for service role that covers all operations
-- Note: service_role should bypass RLS automatically, but this is a fallback
CREATE POLICY "users_service_all"
  ON public.users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Also ensure the anon role can't insert (only service role should insert new users)
-- The authenticated role needs INSERT for the first user creation scenario
DROP POLICY IF EXISTS "users_insert_service" ON public.users;

CREATE POLICY "users_insert_service"
  ON public.users FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Comment explaining the fix
COMMENT ON CONSTRAINT oauth_tokens_user_provider_unique ON public.oauth_tokens
  IS 'Required for upsert ON CONFLICT in OAuth callback';
