-- Migration: Fix RLS policies for referral_credits table
-- Date: 2026-02-02
-- Description: Add proper grants and service role policy

-- Drop existing service role policy
DROP POLICY IF EXISTS "Service can manage referral credits" ON public.referral_credits;

-- Recreate service role policy with correct syntax
CREATE POLICY "Service role full access"
ON public.referral_credits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Grant table permissions
GRANT SELECT ON public.referral_credits TO authenticated;
GRANT ALL ON public.referral_credits TO service_role;
