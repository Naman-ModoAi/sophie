# Referral System Architecture

## Database Design

### New Tables
1. **referrals** - Track referral relationships and status
2. **referral_credits** - Track credit awards from referrals

### Modified Tables
- **users** - Add `referral_code`, `total_referrals_completed`
- **meetings** - Add `is_first_prep_note` flag

## API Endpoints
- `GET /api/referrals/my-code` - User's referral info
- `GET /api/referrals/stats` - Dashboard data
- `POST /api/referrals/complete` - Internal trigger

## Credit Flow
1. User signs up via referral link → Cookie stores code
2. User generates first prep note → Detection trigger
3. System awards credits:
   - Referrer: +2 credits (Free) or +1 toward free month (Pro)
   - Referred: +3 bonus credits
4. Notifications sent to both users

## Key Patterns
- Reuse existing `consume_credits()` function pattern
- Follow RLS policies from subscriptions table
- Use `getAuthUser()` for API authentication
- Follow existing UI component patterns
