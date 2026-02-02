-- Fix OAuth callback issues
-- 1. Add INSERT policy for users table (service role bypass)
-- 2. Add unique constraint on oauth_tokens for upsert

-- Add INSERT policy for users table
-- Service role can insert new users during OAuth callback
CREATE POLICY "Service role can insert users"
  ON users FOR INSERT
  WITH CHECK (true);

-- Add unique constraint on oauth_tokens (user_id, provider)
-- This allows the upsert with onConflict to work
ALTER TABLE oauth_tokens
  DROP CONSTRAINT IF EXISTS oauth_tokens_user_id_provider_key;

ALTER TABLE oauth_tokens
  ADD CONSTRAINT oauth_tokens_user_id_provider_key
  UNIQUE (user_id, provider);

-- Add INSERT/UPDATE policies for oauth_tokens
CREATE POLICY "Service role can insert oauth tokens"
  ON oauth_tokens FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update oauth tokens"
  ON oauth_tokens FOR UPDATE
  USING (true)
  WITH CHECK (true);
