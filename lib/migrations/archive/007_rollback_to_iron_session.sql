-- Rollback to Iron Session (remove Supabase Auth migration)
-- Created: 2026-01-21

-- ============================================================================
-- DROP SUPABASE AUTH POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_service_all" ON users;

DROP POLICY IF EXISTS "oauth_tokens_select_own" ON oauth_tokens;
DROP POLICY IF EXISTS "oauth_tokens_insert_own" ON oauth_tokens;
DROP POLICY IF EXISTS "oauth_tokens_update_own" ON oauth_tokens;
DROP POLICY IF EXISTS "oauth_tokens_delete_own" ON oauth_tokens;
DROP POLICY IF EXISTS "oauth_tokens_service_all" ON oauth_tokens;

DROP POLICY IF EXISTS "meetings_select_own" ON meetings;
DROP POLICY IF EXISTS "meetings_insert_own" ON meetings;
DROP POLICY IF EXISTS "meetings_update_own" ON meetings;
DROP POLICY IF EXISTS "meetings_delete_own" ON meetings;
DROP POLICY IF EXISTS "meetings_service_all" ON meetings;

DROP POLICY IF EXISTS "attendees_select_own" ON attendees;
DROP POLICY IF EXISTS "attendees_insert_own" ON attendees;
DROP POLICY IF EXISTS "attendees_update_own" ON attendees;
DROP POLICY IF EXISTS "attendees_delete_own" ON attendees;
DROP POLICY IF EXISTS "attendees_service_all" ON attendees;

-- ============================================================================
-- DROP TRIGGER AND FUNCTION
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ============================================================================
-- DISABLE RLS (Since we're using Iron Session, not Supabase Auth)
-- ============================================================================

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendees DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- REMOVE auth_user_id COLUMN (not needed for Iron Session)
-- ============================================================================

ALTER TABLE users DROP COLUMN IF EXISTS auth_user_id;

-- ============================================================================
-- RESTORE google_user_id NOT NULL CONSTRAINT
-- ============================================================================

-- First, make sure all existing rows have google_user_id
UPDATE users SET google_user_id = 'unknown_' || id::text WHERE google_user_id IS NULL;

-- Then make it NOT NULL again
ALTER TABLE users ALTER COLUMN google_user_id SET NOT NULL;
