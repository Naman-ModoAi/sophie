-- Migration: Add Stripe fields to users
-- Date: 2026-01-23
-- Description: Add Stripe customer ID and subscription fields

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS stripe_subscription_status TEXT;

CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON public.users(stripe_customer_id);

COMMENT ON COLUMN public.users.stripe_customer_id IS 'Stripe customer ID for billing';
COMMENT ON COLUMN public.users.stripe_subscription_id IS 'Active Stripe subscription ID';
COMMENT ON COLUMN public.users.stripe_subscription_status IS 'Subscription status: active, canceled, past_due, etc.';
