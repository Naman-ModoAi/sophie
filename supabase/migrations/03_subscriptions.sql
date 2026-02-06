-- ============================================================================
-- Sophie - Subscription System
-- Migration: 03_subscriptions
-- Description: Plans, subscriptions, transactions, and referral system
-- ============================================================================

-- ============================================================================
-- PLANS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,

  -- Credit allocation (NUMERIC for decimal precision)
  monthly_credits NUMERIC(10,2) NOT NULL,
  credits_rollover BOOLEAN DEFAULT FALSE,

  -- Credit costs (NUMERIC for 0.05 step deductions)
  person_credit_cost NUMERIC(10,2) NOT NULL DEFAULT 1,
  company_credit_cost NUMERIC(10,2) NOT NULL DEFAULT 1,

  -- Features
  research_retention_days INTEGER,
  priority_support BOOLEAN DEFAULT FALSE,

  -- Stripe
  stripe_price_id TEXT,
  price_monthly_cents INTEGER,

  -- Metadata
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_plans_stripe_price_id ON public.plans(stripe_price_id);
CREATE INDEX IF NOT EXISTS idx_plans_active ON public.plans(is_active) WHERE is_active = TRUE;

-- Comments
COMMENT ON TABLE public.plans IS 'Subscription plans with credit allocation and features';
COMMENT ON COLUMN public.plans.monthly_credits IS 'Number of credits allocated per month';
COMMENT ON COLUMN public.plans.credits_rollover IS 'Whether unused credits roll over to next month';
COMMENT ON COLUMN public.plans.research_retention_days IS 'Days to retain research data (NULL = unlimited)';

-- ============================================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id),

  -- Stripe data
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'paused')),

  -- Billing period
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, plan_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON public.subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON public.subscriptions(user_id, status) WHERE status = 'active';

-- Comments
COMMENT ON TABLE public.subscriptions IS 'User subscriptions linked to plans and Stripe';
COMMENT ON COLUMN public.subscriptions.status IS 'Stripe subscription status: active, canceled, past_due, trialing, paused';
COMMENT ON COLUMN public.subscriptions.cancel_at_period_end IS 'Whether subscription will cancel at end of current period';

-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,

  -- Stripe data
  stripe_transaction_id TEXT UNIQUE NOT NULL,
  stripe_invoice_id TEXT,
  stripe_payment_intent_id TEXT,

  -- Transaction details
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('succeeded', 'pending', 'failed', 'refunded')),

  -- Metadata
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_subscription_id ON public.transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_transactions_stripe_transaction_id ON public.transactions(stripe_transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- Comments
COMMENT ON TABLE public.transactions IS 'Payment transaction records from Stripe';
COMMENT ON COLUMN public.transactions.amount_cents IS 'Transaction amount in cents';
COMMENT ON COLUMN public.transactions.status IS 'Transaction status: succeeded, pending, failed, refunded';
COMMENT ON COLUMN public.transactions.metadata IS 'Additional Stripe data (invoice number, period, etc.)';

-- ============================================================================
-- REFERRALS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,

  -- Referral tracking
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'completed')),
  referred_email TEXT,

  -- Timestamps
  clicked_at TIMESTAMPTZ,
  signed_up_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_user_id ON public.referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON public.referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referral_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_pending ON public.referrals(referred_user_id, status)
  WHERE status = 'pending' OR status = 'signed_up';

-- Comments
COMMENT ON TABLE public.referrals IS 'Track referral relationships and completion status';
COMMENT ON COLUMN public.referrals.status IS 'Referral status: pending (link clicked), signed_up (account created), completed (first prep note generated)';
COMMENT ON COLUMN public.referrals.referral_code IS 'The referral code used for this referral';

-- ============================================================================
-- REFERRAL_CREDITS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.referral_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,

  -- Credit details
  credit_type TEXT NOT NULL CHECK (credit_type IN ('meeting_credit', 'subscription_extension')),
  amount INTEGER NOT NULL CHECK (amount > 0),

  -- Timestamps
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referral_credits_user_id ON public.referral_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_credits_referral_id ON public.referral_credits(referral_id);
CREATE INDEX IF NOT EXISTS idx_referral_credits_expires_at ON public.referral_credits(user_id, expires_at);

-- Comments
COMMENT ON TABLE public.referral_credits IS 'Track credits awarded from completed referrals';
COMMENT ON COLUMN public.referral_credits.credit_type IS 'Type of credit: meeting_credit (for Free users) or subscription_extension (for Pro users)';
COMMENT ON COLUMN public.referral_credits.amount IS 'Number of credits or months awarded';
COMMENT ON COLUMN public.referral_credits.expires_at IS 'When credits expire (NULL for subscription extensions)';
