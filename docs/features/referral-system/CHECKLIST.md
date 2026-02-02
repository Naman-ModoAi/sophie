# Referral System Implementation Checklist

## Phase 1: Database Schema
- [ ] Create `referrals` table migration
- [ ] Create `referral_credits` table migration
- [ ] Add referral columns to `users` table
- [ ] Add RLS policies for new tables
- [ ] Create referral credit functions (award, track, validate)

## Phase 2: Backend Logic
- [ ] Generate referral codes for existing users (migration)
- [ ] API: GET /api/referrals/my-code
- [ ] API: GET /api/referrals/stats
- [ ] API: POST /api/referrals/complete (internal)
- [ ] Implement first prep note detection hook
- [ ] Add referral tracking to signup flow

## Phase 3: Frontend UI
- [ ] Referral dashboard page (/dashboard/referrals)
- [ ] Copy-to-clipboard functionality
- [ ] Share buttons (email, LinkedIn, Twitter)
- [ ] Dashboard widget/banner
- [ ] Referred user signup page variant

## Phase 4: Email Integration
- [ ] Set up Resend API
- [ ] Referral completion email (referrer)
- [ ] Welcome bonus email (referred user)
- [ ] Milestone achievement email (Pro users)

## Phase 5: Testing & Launch
- [ ] End-to-end referral flow test
- [ ] Credit distribution test (Free & Pro)
- [ ] Edge case testing
- [ ] Security review
