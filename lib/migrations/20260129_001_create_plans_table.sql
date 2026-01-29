-- Migration: Create plans table
-- Date: 2026-01-29
-- Description: Create plans table for credit-based subscription system

CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,  -- 'free', 'pro', 'enterprise'
  display_name TEXT NOT NULL, -- 'Free Plan', 'Pro Plan'

  -- Credit allocation
  monthly_credits INTEGER NOT NULL,
  credits_rollover BOOLEAN DEFAULT FALSE,

  -- Credit costs (how many credits to research)
  person_credit_cost INTEGER NOT NULL DEFAULT 1,
  company_credit_cost INTEGER NOT NULL DEFAULT 1,

  -- Features
  research_retention_days INTEGER, -- NULL = unlimited
  priority_support BOOLEAN DEFAULT FALSE,

  -- Stripe
  stripe_price_id TEXT, -- NULL for free plan
  price_monthly_cents INTEGER, -- NULL for free plan

  -- Metadata
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for looking up plans by Stripe price ID
CREATE INDEX IF NOT EXISTS idx_plans_stripe_price_id ON public.plans(stripe_price_id);

-- Index for active plans
CREATE INDEX IF NOT EXISTS idx_plans_active ON public.plans(is_active) WHERE is_active = TRUE;

-- Enable RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Everyone can read active plans
CREATE POLICY "Anyone can view active plans"
  ON public.plans
  FOR SELECT
  USING (is_active = TRUE);

-- Only service role can modify plans
CREATE POLICY "Service can manage plans"
  ON public.plans
  FOR ALL
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.plans IS 'Subscription plans with credit allocation and features';
COMMENT ON COLUMN public.plans.monthly_credits IS 'Number of credits allocated per month';
COMMENT ON COLUMN public.plans.credits_rollover IS 'Whether unused credits roll over to next month';
COMMENT ON COLUMN public.plans.research_retention_days IS 'Days to retain research data (NULL = unlimited)';
