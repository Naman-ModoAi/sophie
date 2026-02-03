-- Migration: Create transactions table
-- Date: 2026-01-29
-- Description: Create transactions table for payment tracking

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
  metadata JSONB, -- Store additional Stripe data
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_subscription_id ON public.transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_transactions_stripe_transaction_id ON public.transactions(stripe_transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view their own transactions"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage transactions
CREATE POLICY "Service can manage transactions"
  ON public.transactions
  FOR ALL
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.transactions IS 'Payment transaction records from Stripe';
COMMENT ON COLUMN public.transactions.amount_cents IS 'Transaction amount in cents';
COMMENT ON COLUMN public.transactions.status IS 'Transaction status: succeeded, pending, failed, refunded';
COMMENT ON COLUMN public.transactions.metadata IS 'Additional Stripe data (invoice number, period, etc.)';
