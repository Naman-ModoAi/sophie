-- ============================================================================
-- Fix credit_config RLS policies
-- Migration: 15_fix_credit_config_policies
-- Description: Ensure service role has full access to credit_config table
-- ============================================================================

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Service role can manage credit config" ON public.credit_config;
DROP POLICY IF EXISTS "Authenticated users can read credit config" ON public.credit_config;

-- Service role has full access (bypasses RLS but we add explicit policy)
CREATE POLICY "Service role full access"
  ON public.credit_config
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can read (for transparency)
CREATE POLICY "Authenticated users read"
  ON public.credit_config
  FOR SELECT
  TO authenticated
  USING (true);

-- Anon users can also read (for unauthenticated access if needed)
CREATE POLICY "Public read access"
  ON public.credit_config
  FOR SELECT
  TO anon
  USING (true);

-- ============================================================================
-- Fix credit_cost_baseline RLS policies
-- ============================================================================

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Service role can manage baseline" ON public.credit_cost_baseline;
DROP POLICY IF EXISTS "Authenticated users can read baseline" ON public.credit_cost_baseline;

-- Service role has full access
CREATE POLICY "Service role full access baseline"
  ON public.credit_cost_baseline
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can read
CREATE POLICY "Authenticated users read baseline"
  ON public.credit_cost_baseline
  FOR SELECT
  TO authenticated
  USING (true);

-- Anon users can also read
CREATE POLICY "Public read access baseline"
  ON public.credit_cost_baseline
  FOR SELECT
  TO anon
  USING (true);
