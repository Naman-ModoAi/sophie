-- Enable Row Level Security on all user-facing tables
-- This migration ensures users can only access their own data

-- Enable RLS on meetings table
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Meetings policies: Users can only see/modify their own meetings
CREATE POLICY "Users can view their own meetings"
  ON meetings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meetings"
  ON meetings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meetings"
  ON meetings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meetings"
  ON meetings FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on attendees table
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;

-- Attendees policies: Users can only see attendees for their own meetings
CREATE POLICY "Users can view attendees for their meetings"
  ON attendees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = attendees.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert attendees for their meetings"
  ON attendees FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = attendees.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update attendees for their meetings"
  ON attendees FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = attendees.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete attendees for their meetings"
  ON attendees FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = attendees.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

-- Enable RLS on subscriptions table
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies: Users can only view their own subscription
CREATE POLICY "Users can view their own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Note: INSERT/UPDATE handled by service role (Stripe webhooks)

-- Enable RLS on oauth_tokens table
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;

-- OAuth tokens policies: Users can only view their own tokens
CREATE POLICY "Users can view their own oauth tokens"
  ON oauth_tokens FOR SELECT
  USING (auth.uid() = user_id);

-- Note: INSERT/UPDATE handled by service role (OAuth callback)

-- Enable RLS on users table (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users policies: Users can view and update their own profile
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Note: INSERT handled by service role (OAuth callback)

-- Enable RLS on companies table (read-only for users)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Companies policies: Users can view companies associated with their meetings
CREATE POLICY "Users can view companies"
  ON companies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM attendees
      JOIN meetings ON meetings.id = attendees.meeting_id
      WHERE attendees.company_id = companies.id
      AND meetings.user_id = auth.uid()
    )
  );

-- Note: INSERT/UPDATE handled by service role (calendar sync)

-- Comments about service role usage:
-- The following operations MUST use service role (bypass RLS):
-- 1. Stripe webhooks: Update subscriptions table
-- 2. OAuth callback: Insert/update users and oauth_tokens
-- 3. Calendar sync: Insert/update meetings, attendees, companies (on behalf of user)
