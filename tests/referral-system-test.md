# Referral System Test Plan

## Prerequisites
- Run migrations: lib/migrations/20260202_001 through 20260202_005
- Have at least one existing user account

## Test 1: Referral Code Generation

### Check existing user has code
```sql
SELECT id, email, referral_code, total_referrals_completed
FROM users
WHERE email = 'your-email@example.com';
```

**Expected:** All users should have a unique 8-character referral_code

### Check new signup gets code automatically
- Sign up new user via Google OAuth
- Check database:
```sql
SELECT id, email, referral_code
FROM users
ORDER BY created_at DESC
LIMIT 1;
```

**Expected:** New user has referral_code populated

---

## Test 2: API Endpoints

### Test GET /api/referrals/my-code
```bash
# In browser console (logged in)
fetch('/api/referrals/my-code').then(r => r.json()).then(console.log)
```

**Expected response:**
```json
{
  "code": "ABC12345",
  "referral_link": "http://localhost:3000/ref/ABC12345",
  "total_completed": 0,
  "pending_count": 0,
  "credits_earned": 0
}
```

### Test GET /api/referrals/stats
```bash
fetch('/api/referrals/stats').then(r => r.json()).then(console.log)
```

**Expected response:**
```json
{
  "pending_referrals": [],
  "completed_referrals": [],
  "credits_breakdown": [],
  "next_milestone": null (or milestone object for Pro users)
}
```

---

## Test 3: Referral Landing Page

### Test valid referral code
1. Get a user's referral code from database
2. Visit: `http://localhost:3000/ref/[CODE]`

**Expected:**
- Page loads showing "You've been invited by [Name]"
- Shows "3 bonus meeting credits" offer
- "Sign in with Google" button visible

### Check cookie is set
```bash
# In browser console
document.cookie
```

**Expected:** Should see `referral_code=[CODE]`

### Test invalid referral code
1. Visit: `http://localhost:3000/ref/INVALID123`

**Expected:** Redirects to home page (/)

---

## Test 4: Referral Dashboard UI

### Navigate to dashboard
1. Log in as existing user
2. Click "Referrals" in sidebar

**Expected:**
- Stats cards show: Total Completed (0), Pending (0), Credits Earned (0)
- Referral link displayed with copy button
- Share buttons (Email, LinkedIn, Twitter) visible
- "No referrals yet" message shown

### Test copy functionality
1. Click "Copy Link" button

**Expected:**
- Toast notification: "Referral link copied to clipboard!"
- Link copied to clipboard

### Test share buttons
1. Click "📧 Email"
**Expected:** Opens email client with pre-filled message

2. Click "💼 LinkedIn"
**Expected:** Opens LinkedIn share dialog

3. Click "🐦 Twitter"
**Expected:** Opens Twitter compose dialog

---

## Test 5: End-to-End Referral Flow

### Setup
- User A (Referrer): Existing user with referral code
- User B (Referred): New test account

### Step 1: Share link
1. Log in as User A
2. Go to /referrals
3. Copy referral link (e.g., http://localhost:3000/ref/ABC12345)

### Step 2: Referred user signs up
1. Open incognito/private window
2. Visit referral link
3. Click "Sign in with Google"
4. Complete Google OAuth signup

**Check database:**
```sql
SELECT * FROM referrals
WHERE referral_code = 'ABC12345';
```

**Expected:**
- referral record created
- status = 'signed_up'
- referred_user_id = User B's ID
- signed_up_at is populated

### Step 3: Generate first prep note
1. As User B, connect Google Calendar
2. Trigger research for a meeting
3. Wait for prep note generation

**Check database after prep note:**
```sql
-- Check referral status
SELECT status, completed_at FROM referrals
WHERE referred_user_id = '[USER_B_ID]';

-- Check credits awarded
SELECT * FROM referral_credits
WHERE referral_id IN (
  SELECT id FROM referrals WHERE referred_user_id = '[USER_B_ID]'
);

-- Check user credit balances
SELECT email, referral_credits_current_month, total_referrals_completed
FROM users
WHERE id IN ('[USER_A_ID]', '[USER_B_ID]');
```

**Expected:**
- Referral status = 'completed'
- completed_at timestamp populated
- 2 referral_credits records created:
  - User A: +2 credits (or progress toward free month if Pro)
  - User B: +3 credits
- User A: referral_credits_current_month = 2, total_referrals_completed = 1
- User B: referral_credits_current_month = 3

### Step 4: Verify UI updates
1. As User A, go to /referrals

**Expected:**
- Total Completed: 1
- Credits Earned: 2 (Free user) or milestone progress (Pro user)
- Referral history shows User B as "Completed"

---

## Test 6: Edge Cases

### Test duplicate referral
1. User B (already referred) tries to use another referral link

**Expected:** Should not create duplicate referral record (only first referral counts)

### Test self-referral prevention
1. User A tries to sign up with their own referral code

**Expected:** System should handle gracefully (user already exists, referral not created)

### Test Pro user milestone
1. Set User A to Pro plan
2. Complete 5 referrals

**Expected:**
- After 5th referral, subscription_extension_months increments by 1
- referral_credits record with credit_type = 'subscription_extension'

---

## Test 7: Database Function Testing

### Test generate_referral_code()
```sql
SELECT public.generate_referral_code();
```

**Expected:** Returns 8-character alphanumeric code

### Test check_and_complete_referral()
```sql
-- Create test referral
INSERT INTO referrals (referrer_user_id, referred_user_id, referral_code, status, signed_up_at)
VALUES ('[REFERRER_ID]', '[REFERRED_ID]', 'TEST1234', 'signed_up', NOW());

-- Simulate first prep note
SELECT public.check_and_complete_referral('[REFERRED_ID]');
```

**Expected:** Returns TRUE, referral completed, credits awarded

---

## Success Criteria

✅ All migrations run without errors
✅ Existing users have referral codes
✅ API endpoints return correct data
✅ Referral landing page works
✅ Dashboard UI displays correctly
✅ Copy and share buttons work
✅ End-to-end flow: Sign up → First prep note → Credits awarded
✅ Database functions execute properly
✅ RLS policies prevent unauthorized access
