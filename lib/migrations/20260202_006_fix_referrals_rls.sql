-- Migration: Fix RLS policies for referrals table
-- Date: 2026-02-02
-- Description: Add INSERT policy and fix service role policy

-- Drop existing policies
DROP POLICY IF EXISTS "Service can manage referrals" ON public.referrals;

-- Service role can do everything
CREATE POLICY "Service role full access"
  ON public.referrals
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can insert their own referrals (for webhook/signup flow)
CREATE POLICY "Users can create referrals"
  ON public.referrals
  FOR INSERT
  WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;
