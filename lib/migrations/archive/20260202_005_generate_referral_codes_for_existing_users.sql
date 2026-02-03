-- Migration: Generate referral codes for existing users
-- Date: 2026-02-02
-- Description: Backfill referral codes for all existing users

UPDATE public.users
SET referral_code = public.generate_referral_code()
WHERE referral_code IS NULL;

COMMENT ON COLUMN public.users.referral_code IS 'Unique referral code for this user (auto-generated)';
