-- Migration: Referral System RLS Policies
-- Description: Row Level Security policies and grants for referral system

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS on referrals table
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can view their own referrals (as referrer)
CREATE POLICY "Users can view their own referrals"
ON public.referrals
FOR SELECT
USING (auth.uid() = referrer_user_id);

-- Service role has full access
CREATE POLICY "Service role full access on referrals"
ON public.referrals
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Authenticated users can create referrals (for signup flow)
CREATE POLICY "Users can create referrals"
ON public.referrals
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Enable RLS on referral_credits table
ALTER TABLE public.referral_credits ENABLE ROW LEVEL SECURITY;

-- Users can view their own referral credits
CREATE POLICY "Users can view their own referral credits"
ON public.referral_credits
FOR SELECT
USING (auth.uid() = user_id);

-- Service role has full access
CREATE POLICY "Service role full access on referral_credits"
ON public.referral_credits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow anonymous users to validate referral codes (for landing page)
CREATE POLICY "Anyone can validate referral codes"
ON public.users
FOR SELECT
TO anon
USING (referral_code IS NOT NULL);

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;
GRANT SELECT ON public.referral_credits TO authenticated;
GRANT ALL ON public.referral_credits TO service_role;
