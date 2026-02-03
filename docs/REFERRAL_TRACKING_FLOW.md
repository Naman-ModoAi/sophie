# Referral System Tracking Flow

## Complete User Journey

### 1. Referral Link Shared
User A (referrer) shares their link: `https://yourapp.com/ref/ABC12345`

### 2. New User Visits Link
- Route: `/ref/[code]` → `app/(public)/ref/[code]/page.tsx`
- Sets cookie: `referral_code=ABC12345` (30 days, httpOnly)
- Shows landing page with "You've been invited by a colleague"
- No database lookup needed (avoids RLS issues)

### 3. User Clicks "Sign in with Google"
- Navigates to `/api/auth/login`
- Supabase initiates OAuth flow
- Redirects to Google for authentication

### 4. OAuth Callback
- Route: `/api/auth/callback` → `app/api/auth/callback/route.ts`
- Exchanges code for session
- **Reads referral cookie**: `request.cookies.get('referral_code')`
- Syncs user to `users` table
- **If referral cookie exists:**
  - Looks up referrer by code
  - Creates referral record with `status='signed_up'`
  - Links `referrer_user_id` and `referred_user_id`
  - Sets `signed_up_at` timestamp

### 5. First Prep Note Generated
- User connects calendar and triggers research
- Route: Research orchestrator → `lib/research/agents/orchestrator.ts`
- After prep note saved, calls `checkFirstPrepNote(userId)`
- **If this is user's first prep note:**
  - Calls database function: `check_and_complete_referral(user_id)`
  - Function looks up referral with `status='signed_up'`
  - Calls `award_referral_credits(referral_id)`

### 6. Credits Awarded
Function `award_referral_credits()`:
- Updates referral `status='completed'`
- Sets `completed_at` timestamp
- **For Free tier referrer:** +2 meeting credits
- **For Pro tier referrer:** Progress toward free month (every 5 referrals)
- **For referred user:** +3 bonus meeting credits
- Updates `users.referral_credits_current_month`
- Updates `users.total_referrals_completed` for referrer

### 7. Dashboard Updates
- Referrer visits `/referrals`
- API: `GET /api/referrals/stats`
- Shows:
  - Pending referrals (signed up but no prep note yet)
  - Completed referrals (prep note generated)
  - Credits earned this month
  - Progress to next milestone (Pro users)

## Database State at Each Step

### After Step 2 (Link Visit)
```
Cookie: referral_code=ABC12345
Database: No changes
```

### After Step 4 (OAuth Callback)
```sql
-- referrals table
{
  id: uuid,
  referrer_user_id: user_a_id,
  referred_user_id: user_b_id,
  referral_code: 'ABC12345',
  status: 'signed_up',
  signed_up_at: now(),
  completed_at: null
}
```

### After Step 6 (First Prep Note)
```sql
-- referrals table
{
  status: 'completed',
  completed_at: now()
}

-- users table (referrer)
{
  total_referrals_completed: +1,
  referral_credits_current_month: +2  (or milestone progress)
}

-- users table (referred)
{
  referral_credits_current_month: +3
}

-- referral_credits table (2 records)
{
  user_id: user_a_id,
  referral_id: referral_id,
  credit_type: 'meeting_credit',
  amount: 2
}
{
  user_id: user_b_id,
  referral_id: referral_id,
  credit_type: 'meeting_credit',
  amount: 3
}
```

## API Endpoints

### GET /api/referrals/my-code
Returns user's referral code and basic stats:
```json
{
  "code": "ABC12345",
  "referral_link": "https://yourapp.com/ref/ABC12345",
  "total_completed": 5,
  "pending_count": 2,
  "credits_earned": 10
}
```

### GET /api/referrals/stats
Returns detailed dashboard data:
```json
{
  "pending_referrals": [
    { "id": "...", "referred_email": null, "status": "signed_up", "signed_up_at": "..." }
  ],
  "completed_referrals": [
    { "id": "...", "completed_at": "...", "users": { "email": "...", "name": "..." } }
  ],
  "credits_breakdown": [
    { "credit_type": "meeting_credit", "amount": 2, "earned_at": "..." }
  ],
  "next_milestone": {
    "target": 5,
    "current": 3,
    "reward": "1 free month"
  }
}
```

## Edge Cases Handled

### User Already Exists
- OAuth callback upserts user (no duplicate)
- Referral creation may fail if user already signed up
- This is expected - only first signup counts

### Invalid Referral Code
- Cookie is set regardless
- OAuth callback looks up referrer - if not found, no referral created
- User still signs up successfully

### User Never Generates Prep Note
- Referral stays in `status='signed_up'`
- Shows as "Pending" in referrer dashboard
- No credits awarded

### Multiple Referral Links Clicked
- Last referral cookie wins
- Only one referral can be tracked per signup

## Testing Checklist

- [ ] Cookie is set when visiting `/ref/[code]`
- [ ] Cookie persists through OAuth flow
- [ ] Referral record created with `status='signed_up'`
- [ ] First prep note triggers completion
- [ ] Credits awarded to both users
- [ ] Referrer dashboard shows correct stats
- [ ] Invalid codes handled gracefully
- [ ] Existing users don't create duplicate referrals
