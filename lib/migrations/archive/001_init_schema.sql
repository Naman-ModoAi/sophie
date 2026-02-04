-- ============================================================================
-- MeetReady - Complete Database Schema
-- Phase 1: OAuth + Calendar Sync
-- ============================================================================

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_user_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  profile_photo_url TEXT,
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'pro')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW()
);

-- OAUTH_TOKENS TABLE
CREATE TABLE IF NOT EXISTS oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT DEFAULT 'google',
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user_id ON oauth_tokens(user_id);

-- MEETINGS TABLE
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  calendar_event_id TEXT NOT NULL,
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  description TEXT,
  location TEXT,
  is_external BOOLEAN DEFAULT FALSE,
  is_all_day BOOLEAN DEFAULT FALSE,
  is_cancelled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, calendar_event_id)
);

CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_start_time ON meetings(start_time);

-- ATTENDEES TABLE
CREATE TABLE IF NOT EXISTS attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  domain TEXT,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(meeting_id, email)
);

CREATE INDEX IF NOT EXISTS idx_attendees_meeting_id ON attendees(meeting_id);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- DROP EXISTING POLICIES (if any conflicts exist)
-- ============================================================================

DROP POLICY IF EXISTS "users_select_own" ON users;
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
-- CREATE RLS POLICIES
-- ============================================================================

-- USERS TABLE POLICIES
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "users_service_all"
  ON users FOR ALL
  USING (auth.role() = 'service_role');

-- OAUTH_TOKENS TABLE POLICIES
CREATE POLICY "oauth_tokens_select_own"
  ON oauth_tokens FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE auth.uid() = id));

CREATE POLICY "oauth_tokens_insert_own"
  ON oauth_tokens FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth.uid() = id));

CREATE POLICY "oauth_tokens_update_own"
  ON oauth_tokens FOR UPDATE
  USING (user_id IN (SELECT id FROM users WHERE auth.uid() = id));

CREATE POLICY "oauth_tokens_delete_own"
  ON oauth_tokens FOR DELETE
  USING (user_id IN (SELECT id FROM users WHERE auth.uid() = id));

CREATE POLICY "oauth_tokens_service_all"
  ON oauth_tokens FOR ALL
  USING (auth.role() = 'service_role');

-- MEETINGS TABLE POLICIES
CREATE POLICY "meetings_select_own"
  ON meetings FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE auth.uid() = id));

CREATE POLICY "meetings_insert_own"
  ON meetings FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth.uid() = id));

CREATE POLICY "meetings_update_own"
  ON meetings FOR UPDATE
  USING (user_id IN (SELECT id FROM users WHERE auth.uid() = id));

CREATE POLICY "meetings_delete_own"
  ON meetings FOR DELETE
  USING (user_id IN (SELECT id FROM users WHERE auth.uid() = id));

CREATE POLICY "meetings_service_all"
  ON meetings FOR ALL
  USING (auth.role() = 'service_role');

-- ATTENDEES TABLE POLICIES
CREATE POLICY "attendees_select_own"
  ON attendees FOR SELECT
  USING (
    meeting_id IN (
      SELECT id FROM meetings
      WHERE user_id IN (SELECT id FROM users WHERE auth.uid() = id)
    )
  );

CREATE POLICY "attendees_insert_own"
  ON attendees FOR INSERT
  WITH CHECK (
    meeting_id IN (
      SELECT id FROM meetings
      WHERE user_id IN (SELECT id FROM users WHERE auth.uid() = id)
    )
  );

CREATE POLICY "attendees_update_own"
  ON attendees FOR UPDATE
  USING (
    meeting_id IN (
      SELECT id FROM meetings
      WHERE user_id IN (SELECT id FROM users WHERE auth.uid() = id)
    )
  );

CREATE POLICY "attendees_delete_own"
  ON attendees FOR DELETE
  USING (
    meeting_id IN (
      SELECT id FROM meetings
      WHERE user_id IN (SELECT id FROM users WHERE auth.uid() = id)
    )
  );

CREATE POLICY "attendees_service_all"
  ON attendees FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- GRANT TABLE PERMISSIONS
-- ============================================================================

-- Grant ALL permissions on tables to authenticated users (RLS enforces ownership)
GRANT ALL ON TABLE users TO authenticated;
GRANT ALL ON TABLE oauth_tokens TO authenticated;
GRANT ALL ON TABLE meetings TO authenticated;
GRANT ALL ON TABLE attendees TO authenticated;

-- Grant ALL permissions to service_role (backend services, bypasses RLS)
GRANT ALL ON TABLE users TO service_role;
GRANT ALL ON TABLE oauth_tokens TO service_role;
GRANT ALL ON TABLE meetings TO service_role;
GRANT ALL ON TABLE attendees TO service_role;

-- Grant SELECT permissions to anon role (public access if needed)
GRANT SELECT ON TABLE users TO anon;
GRANT SELECT ON TABLE meetings TO anon;
GRANT SELECT ON TABLE attendees TO anon;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role, anon;
