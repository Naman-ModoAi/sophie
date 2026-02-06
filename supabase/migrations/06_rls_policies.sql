-- ============================================================================
-- SophiHQ - Row Level Security Policies
-- Migration: 06_rls_policies
-- Description: RLS policies and grants for all tables
-- ============================================================================

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prep_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- DROP EXISTING POLICIES (for idempotency)
-- ============================================================================

DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_service_all" ON public.users;

DROP POLICY IF EXISTS "oauth_tokens_select_own" ON public.oauth_tokens;
DROP POLICY IF EXISTS "oauth_tokens_insert_own" ON public.oauth_tokens;
DROP POLICY IF EXISTS "oauth_tokens_update_own" ON public.oauth_tokens;
DROP POLICY IF EXISTS "oauth_tokens_delete_own" ON public.oauth_tokens;
DROP POLICY IF EXISTS "oauth_tokens_service_all" ON public.oauth_tokens;

DROP POLICY IF EXISTS "meetings_select_own" ON public.meetings;
DROP POLICY IF EXISTS "meetings_insert_own" ON public.meetings;
DROP POLICY IF EXISTS "meetings_update_own" ON public.meetings;
DROP POLICY IF EXISTS "meetings_delete_own" ON public.meetings;
DROP POLICY IF EXISTS "meetings_service_all" ON public.meetings;

DROP POLICY IF EXISTS "Users can read companies from their meetings" ON public.companies;
DROP POLICY IF EXISTS "Service role can manage companies" ON public.companies;

DROP POLICY IF EXISTS "attendees_select_own" ON public.attendees;
DROP POLICY IF EXISTS "attendees_insert_own" ON public.attendees;
DROP POLICY IF EXISTS "attendees_update_own" ON public.attendees;
DROP POLICY IF EXISTS "attendees_delete_own" ON public.attendees;
DROP POLICY IF EXISTS "attendees_service_all" ON public.attendees;

DROP POLICY IF EXISTS "Users can read their own prep notes" ON public.prep_notes;
DROP POLICY IF EXISTS "Service role can manage prep notes" ON public.prep_notes;

DROP POLICY IF EXISTS "Users can read their own email queue" ON public.email_queue;
DROP POLICY IF EXISTS "Service role can manage email queue" ON public.email_queue;

DROP POLICY IF EXISTS "Anyone can view active plans" ON public.plans;
DROP POLICY IF EXISTS "Service can manage plans" ON public.plans;

DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Service can manage subscriptions" ON public.subscriptions;

DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Service can manage transactions" ON public.transactions;

DROP POLICY IF EXISTS "Users can view their own referrals" ON public.referrals;
DROP POLICY IF EXISTS "Service can manage referrals" ON public.referrals;

DROP POLICY IF EXISTS "Users can view their own referral credits" ON public.referral_credits;
DROP POLICY IF EXISTS "Service can manage referral credits" ON public.referral_credits;

DROP POLICY IF EXISTS "Users can view their own token usage" ON public.token_usage;
DROP POLICY IF EXISTS "Service can insert token usage" ON public.token_usage;

DROP POLICY IF EXISTS "Users can view their own API usage" ON public.api_usage;
DROP POLICY IF EXISTS "Service can insert API usage" ON public.api_usage;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

CREATE POLICY "users_select_own"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "users_service_all"
  ON public.users FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- OAUTH_TOKENS TABLE POLICIES
-- ============================================================================

CREATE POLICY "oauth_tokens_select_own"
  ON public.oauth_tokens FOR SELECT
  USING (user_id IN (SELECT id FROM public.users WHERE auth.uid() = id));

CREATE POLICY "oauth_tokens_insert_own"
  ON public.oauth_tokens FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth.uid() = id));

CREATE POLICY "oauth_tokens_update_own"
  ON public.oauth_tokens FOR UPDATE
  USING (user_id IN (SELECT id FROM public.users WHERE auth.uid() = id));

CREATE POLICY "oauth_tokens_delete_own"
  ON public.oauth_tokens FOR DELETE
  USING (user_id IN (SELECT id FROM public.users WHERE auth.uid() = id));

CREATE POLICY "oauth_tokens_service_all"
  ON public.oauth_tokens FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- MEETINGS TABLE POLICIES
-- ============================================================================

CREATE POLICY "meetings_select_own"
  ON public.meetings FOR SELECT
  USING (user_id IN (SELECT id FROM public.users WHERE auth.uid() = id));

CREATE POLICY "meetings_insert_own"
  ON public.meetings FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth.uid() = id));

CREATE POLICY "meetings_update_own"
  ON public.meetings FOR UPDATE
  USING (user_id IN (SELECT id FROM public.users WHERE auth.uid() = id));

CREATE POLICY "meetings_delete_own"
  ON public.meetings FOR DELETE
  USING (user_id IN (SELECT id FROM public.users WHERE auth.uid() = id));

CREATE POLICY "meetings_service_all"
  ON public.meetings FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- COMPANIES TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can read companies from their meetings"
  ON public.companies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.attendees a
      INNER JOIN public.meetings m ON m.id = a.meeting_id
      WHERE a.company_id = companies.id
        AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage companies"
  ON public.companies FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- ATTENDEES TABLE POLICIES
-- ============================================================================

CREATE POLICY "attendees_select_own"
  ON public.attendees FOR SELECT
  USING (
    meeting_id IN (
      SELECT id FROM public.meetings
      WHERE user_id IN (SELECT id FROM public.users WHERE auth.uid() = id)
    )
  );

CREATE POLICY "attendees_insert_own"
  ON public.attendees FOR INSERT
  WITH CHECK (
    meeting_id IN (
      SELECT id FROM public.meetings
      WHERE user_id IN (SELECT id FROM public.users WHERE auth.uid() = id)
    )
  );

CREATE POLICY "attendees_update_own"
  ON public.attendees FOR UPDATE
  USING (
    meeting_id IN (
      SELECT id FROM public.meetings
      WHERE user_id IN (SELECT id FROM public.users WHERE auth.uid() = id)
    )
  );

CREATE POLICY "attendees_delete_own"
  ON public.attendees FOR DELETE
  USING (
    meeting_id IN (
      SELECT id FROM public.meetings
      WHERE user_id IN (SELECT id FROM public.users WHERE auth.uid() = id)
    )
  );

CREATE POLICY "attendees_service_all"
  ON public.attendees FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- PREP_NOTES TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can read their own prep notes"
  ON public.prep_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.meetings
      WHERE meetings.id = prep_notes.meeting_id
        AND meetings.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage prep notes"
  ON public.prep_notes FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- EMAIL_QUEUE TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can read their own email queue"
  ON public.email_queue FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage email queue"
  ON public.email_queue FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- PLANS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Anyone can view active plans"
  ON public.plans FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Service can manage plans"
  ON public.plans FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- SUBSCRIPTIONS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- TRANSACTIONS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can manage transactions"
  ON public.transactions FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- REFERRALS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can view their own referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_user_id);

CREATE POLICY "Service can manage referrals"
  ON public.referrals FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- REFERRAL_CREDITS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can view their own referral credits"
  ON public.referral_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can manage referral credits"
  ON public.referral_credits FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- TOKEN_USAGE TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can view their own token usage"
  ON public.token_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert token usage"
  ON public.token_usage FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- API_USAGE TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can view their own API usage"
  ON public.api_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert API usage"
  ON public.api_usage FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- GRANT TABLE PERMISSIONS
-- ============================================================================

-- Grant ALL permissions to authenticated users (RLS enforces ownership)
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.oauth_tokens TO authenticated;
GRANT ALL ON TABLE public.meetings TO authenticated;
GRANT ALL ON TABLE public.companies TO authenticated;
GRANT ALL ON TABLE public.attendees TO authenticated;
GRANT ALL ON TABLE public.prep_notes TO authenticated;
GRANT ALL ON TABLE public.email_queue TO authenticated;
GRANT ALL ON TABLE public.plans TO authenticated;
GRANT ALL ON TABLE public.subscriptions TO authenticated;
GRANT ALL ON TABLE public.transactions TO authenticated;
GRANT ALL ON TABLE public.referrals TO authenticated;
GRANT ALL ON TABLE public.referral_credits TO authenticated;
GRANT ALL ON TABLE public.token_usage TO authenticated;
GRANT ALL ON TABLE public.api_usage TO authenticated;

-- Grant ALL permissions to service_role (bypasses RLS)
GRANT ALL ON TABLE public.users TO service_role;
GRANT ALL ON TABLE public.oauth_tokens TO service_role;
GRANT ALL ON TABLE public.meetings TO service_role;
GRANT ALL ON TABLE public.companies TO service_role;
GRANT ALL ON TABLE public.attendees TO service_role;
GRANT ALL ON TABLE public.prep_notes TO service_role;
GRANT ALL ON TABLE public.email_queue TO service_role;
GRANT ALL ON TABLE public.plans TO service_role;
GRANT ALL ON TABLE public.subscriptions TO service_role;
GRANT ALL ON TABLE public.transactions TO service_role;
GRANT ALL ON TABLE public.referrals TO service_role;
GRANT ALL ON TABLE public.referral_credits TO service_role;
GRANT ALL ON TABLE public.token_usage TO service_role;
GRANT ALL ON TABLE public.api_usage TO service_role;

-- Grant SELECT permissions to anon role
GRANT SELECT ON TABLE public.users TO anon;
GRANT SELECT ON TABLE public.meetings TO anon;
GRANT SELECT ON TABLE public.attendees TO anon;
GRANT SELECT ON TABLE public.companies TO anon;
GRANT SELECT ON TABLE public.prep_notes TO anon;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role, anon;
