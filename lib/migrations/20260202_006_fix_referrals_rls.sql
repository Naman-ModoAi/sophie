-- Migration: Fix RLS policies for referrals table
-- Date: 2026-02-02
-- Description: Add INSERT policy and fix service role policy

-- Drop existing service role policy
DROP POLICY IF EXISTS "Service can manage referrals" ON public.referrals;

-- Recreate service role policy with correct syntax
CREATE POLICY "Service role full access"
ON public.referrals
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated users to insert referrals
CREATE POLICY "Users can create referrals"
ON public.referrals
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;
