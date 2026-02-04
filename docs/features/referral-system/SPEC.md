# **MeetReady.app**

Referral System Feature Specification

*Viral Growth Through User Incentives*

Version 1.0  |  February 2026

---

# **1. Executive Summary**

This document specifies a referral system for MeetReady.app that incentivizes users to invite others to the platform. The system rewards both the referrer and the referred user with meeting credit benefits, creating a win-win viral growth mechanism.

**Key Objectives:**
- Drive user acquisition through word-of-mouth
- Reduce customer acquisition cost (CAC)
- Increase user engagement and retention
- Create a self-sustaining growth loop

---

# **2. Feature Overview**

## **2.1 What is the Referral System?**

A credit-based referral program where:
- Users receive a **unique referral link/code**
- They share this with colleagues, friends, or on social media
- When someone signs up using their link and **generates their first prep note**, both parties receive meeting credits
- Credits can be used to exceed free tier limits or extend Pro benefits

## **2.2 Success Criteria**

A referral is considered **complete** when:
1. New user signs up via referral link
2. New user connects their Google Calendar
3. New user **generates at least 1 prep note** (system processes a meeting)

---

# **3. Reward Structure**

## **3.1 Proposed Credit Rewards**

| User Type | Reward | Conditions |
|-----------|--------|------------|
| **Referrer (Free Plan)** | +2 meeting credits | Per completed referral |
| **Referrer (Pro Plan)** | +1 month free (add to subscription) | Per 5 completed referrals |
| **New User (Referred)** | +3 bonus meeting credits | On first prep note generation |

## **3.2 Credit System Design**

### **For Free Users:**
- Start with 5 meetings/month baseline
- Referral credits stack on top: 5 + (2 × referrals completed)
- Example: User refers 3 people → 5 + 6 = 11 meetings this month
- Credits reset monthly (do not roll over)
- Maximum cap: 15 meetings/month via referrals (to prevent abuse)

### **For Pro Users:**
- Already have unlimited meetings
- Reward: Extend subscription by 1 month for every 5 completed referrals
- Example: 5 referrals = 1 free month added to end of subscription
- No maximum cap (encourages champions)
- Credits accumulate even if monthly billing (applied at renewal)

### **For Referred Users (New):**
- Start with standard 5 meetings/month
- Receive +3 bonus credits after first prep note
- Total first month: 8 meetings
- Bonus is one-time only, resets to 5 the following month

---

# **4. User Experience**

## **4.1 Referrer Flow**

### **Discovery**
Users discover the referral program through:
1. **Dashboard widget** - "Invite friends, earn credits" banner
2. **Settings page** - Dedicated "Referrals" tab
3. **After hitting free limit** - "Want more meetings? Invite friends!"
4. **Email prompts** - Occasional reminder emails

### **Sharing Process**
1. User clicks "Invite Friends" in dashboard
2. Sees referral page with:
   - Their unique referral link
   - Current referral count (pending & completed)
   - Credits earned so far
   - Copy link button
   - Share buttons (Email, LinkedIn, Twitter/X)
   - Personal message template they can customize
3. User shares link via preferred method
4. System tracks clicks on their link

### **Tracking Progress**
Referral dashboard shows:
- **Pending referrals:** Signed up but haven't generated first note
- **Completed referrals:** Generated first note (credited)
- **Total credits earned:** Running total
- **Next reward milestone:** Progress bar (e.g., "3/5 referrals to free month")

## **4.2 Referred User Flow**

### **Sign Up Experience**
1. New user clicks referral link: `prepfor.app/ref/[unique-code]`
2. Lands on special signup page showing:
   - "You've been invited by [Referrer Name]"
   - "Get 3 bonus meetings when you generate your first prep note!"
   - Standard sign-up CTA
3. Cookie/session stores referral code through signup
4. After Google OAuth, calendar sync proceeds normally

### **Activation**
1. System processes user's first meeting
2. Generates first prep note
3. **Trigger:** Referral completion event fires
4. Both users receive notification:
   - **Referrer:** Email + in-app notification: "John completed signup! +2 credits added"
   - **Referred:** Email + in-app notification: "Welcome bonus! +3 credits unlocked"
5. Credits immediately reflected in dashboard

---

# **5. Technical Implementation Requirements**

## **5.1 Database Schema Changes**

### **New Table: `referrals`**
```
- id (uuid, primary key)
- referrer_user_id (uuid, foreign key → users.id)
- referred_user_id (uuid, foreign key → users.id, nullable until signup)
- referral_code (text, unique, indexed)
- status (enum: 'pending', 'signed_up', 'completed')
- referred_email (text, optional, for tracking before signup)
- clicked_at (timestamp)
- signed_up_at (timestamp)
- completed_at (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

### **New Table: `referral_credits`**
```
- id (uuid, primary key)
- user_id (uuid, foreign key → users.id)
- referral_id (uuid, foreign key → referrals.id)
- credit_type (enum: 'meeting_credit', 'subscription_extension')
- amount (integer, e.g., 2 meetings or 1 month)
- earned_at (timestamp)
- expires_at (timestamp, for monthly credits)
- created_at (timestamp)
```

### **Update `users` table:**
```
Add columns:
- referral_code (text, unique, generated on user creation)
- total_referrals_completed (integer, default 0)
- referral_credits_current_month (integer, default 0)
- subscription_extension_months (integer, default 0, for Pro users)
```

### **Update `meetings` table:**
```
Add column:
- is_first_prep_note (boolean, default false)
  → Set to true for user's first completed meeting
```

## **5.2 Backend Logic Requirements**

### **Referral Code Generation**
- Generate unique 8-character alphanumeric code for each user on account creation
- Format: Random (e.g., `A8K2M9P1`) or Readable (e.g., `PREP-JOHN-42`)
- Store in `users.referral_code`
- Ensure uniqueness via database constraint

### **Referral Tracking**
1. **Link Click:** When user visits `/ref/[code]`, store code in cookie/session
2. **Sign Up:** Associate referral_code with new user account, create referral record
3. **First Prep Note Detection:**
   - After Calendar Sync → Research Agent → Prep Note generated
   - Check if `user.total_meetings_completed == 1`
   - If yes, trigger referral completion logic

### **Credit Distribution Logic**
```
When first prep note completes:
1. Look up referral record where referred_user_id = current_user
2. If found and status != 'completed':
   a. Update referral.status = 'completed'
   b. Award referrer credits based on their plan:
      - Free: +2 meeting credits (add to referral_credits_current_month)
      - Pro: Increment counter toward free month
   c. Award referred user +3 meeting credits
   d. Send notifications to both users
   e. Update users.total_referrals_completed for referrer
```

### **Credit Expiration & Reset**
- **Monthly credits** (Free users): Reset on 1st of each month via cron job
- **Subscription extensions** (Pro users): Apply at next renewal date
- Implement scheduled job to:
  - Reset all `users.referral_credits_current_month` to 0
  - Archive expired credits to history table for analytics

### **Usage Enforcement**
- Modify existing meeting limit check to include referral credits
- Formula: `available_meetings = base_limit + referral_credits_current_month`
- Cap at 15 meetings/month for Free users (even with referrals)

## **5.3 API Endpoints Needed**

### **GET /api/referrals/my-code**
- Returns current user's referral code and stats
- Response: `{ code, referral_link, total_completed, pending_count, credits_earned }`

### **GET /api/referrals/stats**
- Returns detailed referral dashboard data
- Response: `{ pending_referrals[], completed_referrals[], credits_breakdown, next_milestone }`

### **POST /api/referrals/track-click**
- Records referral link click (optional, for analytics)
- Payload: `{ referral_code, utm_source }`

### **GET /api/referrals/validate-code**
- Validates referral code during signup flow
- Response: `{ valid: boolean, referrer_name: string }`

### **POST /api/referrals/complete**
- Internal endpoint called after first prep note generation
- Payload: `{ user_id }`
- Triggers credit distribution

## **5.4 Frontend Components Needed**

### **Referral Dashboard Page** (`/dashboard/referrals`)
Components:
- Referral link display with copy button
- Share buttons (Email, LinkedIn, Twitter)
- Stats cards: Pending, Completed, Credits Earned
- Referral history table
- Progress bar to next milestone
- FAQ accordion

### **Dashboard Widget** (Sidebar or Banner)
- Compact CTA: "Invite friends → Earn credits"
- Shows current credit balance
- Links to full referral page

### **Settings Tab** (Existing Settings Page)
- Add "Referrals" section
- Allow users to customize referral message template (optional)

### **Referred User Signup Page** (`/signup?ref=[code]`)
- Hero message: "You've been invited!"
- Referrer name display (if available)
- Bonus credit callout
- Standard signup flow

### **In-App Notifications**
- Toast notification when credits earned
- Badge on referral icon when new completion

## **5.5 Email Templates Needed**

### **Referrer Invitation Email** (User-initiated)
Subject: "I thought you'd love MeetReady – get 3 bonus meetings!"
Body:
- Personal message from referrer
- What MeetReady does (1-2 sentences)
- Benefit callout: "Sign up and generate your first prep note to unlock 3 bonus meetings"
- CTA button with referral link
- Footer: Unsubscribe option

### **Referral Completed - Referrer** (Auto-sent)
Subject: "🎉 [Name] joined MeetReady – you earned 2 credits!"
Body:
- Congratulations message
- Credits added confirmation
- Current balance
- CTA: Invite more friends

### **Referral Completed - Referred User** (Auto-sent)
Subject: "Welcome to MeetReady! Here are your 3 bonus meetings 🚀"
Body:
- Welcome message
- Bonus credits unlocked
- Next steps: Check your first prep note
- CTA: View dashboard

### **Milestone Achieved - Pro Users** (Auto-sent)
Subject: "You earned a free month of MeetReady Pro! 🎁"
Body:
- Celebration message
- Free month added to subscription
- Encourage more referrals
- CTA: View referral stats

---

# **6. Business Rules & Constraints**

## **6.1 Anti-Abuse Measures**

### **Fraud Prevention**
- **One account per email:** Cannot refer yourself or create multiple accounts
- **Real activity required:** Referred user must generate actual prep note, not just sign up
- **IP tracking:** Flag suspicious patterns (multiple signups from same IP)
- **Credit cap:** Free users max out at 15 meetings/month via referrals
- **Audit trail:** Log all referral events for manual review if needed

### **Disqualification Rules**
Referral does NOT count if:
- Referred user never generates a prep note (stays pending)
- Referred user account is flagged as spam/abuse
- Referred user signs up but never connects calendar
- Same email domain as referrer AND same IP (corporate abuse prevention)

## **6.2 Edge Cases**

### **User Upgrades to Pro After Earning Credits**
- Accumulated meeting credits are forfeited (no longer needed)
- Future referrals count toward subscription extensions instead
- Clear communication: "You'll now earn free months instead of meeting credits"

### **Pro User Downgrades to Free**
- Lose subscription extension benefits (can't apply if not subscribed)
- Future referrals earn meeting credits again
- Clear communication in downgrade flow

### **Referred User Already Had an Account**
- If referred email matches existing account → referral is void
- Show error: "This email is already registered. Log in instead."

### **Referral Link Expires**
- Referral links do NOT expire (evergreen)
- Tracked clicks expire after 30 days (cookie TTL)

---

# **7. Analytics & Metrics**

## **7.1 Key Metrics to Track**

| Metric | Description | Goal |
|--------|-------------|------|
| **Referral Link Clicks** | Unique clicks on referral links | Track virality |
| **Click → Signup Rate** | % of clicks that convert to signups | >20% |
| **Signup → Completion Rate** | % of signups that generate first prep note | >60% |
| **Avg Referrals per User** | Mean completed referrals per active user | >1.5 |
| **Viral Coefficient** | New users / existing users who referred | >0.3 |
| **Credit Redemption Rate** | % of earned credits actually used | >80% |
| **Referral-driven CAC** | Cost per referred user (should be $0) | $0 |

## **7.2 Dashboard for Internal Team**

Admin panel should show:
- Total referrals: Pending vs Completed
- Top referrers (leaderboard)
- Referral funnel: Clicks → Signups → Completions
- Credits distributed by type
- Referral source breakdown (email, LinkedIn, Twitter)
- Fraud detection alerts

---

# **8. Launch Plan**

## **8.1 Phased Rollout**

### **Phase 1: Soft Launch (2 weeks)**
- Enable for Pro users only (trusted, engaged users)
- Test credit distribution logic
- Gather feedback on UX
- Monitor for bugs/abuse

### **Phase 2: Free User Launch**
- Open to all Free users
- Send announcement email to all users
- Add dashboard widget and prompts
- Monitor referral metrics daily

### **Phase 3: Optimization**
- Adjust rewards based on data (increase/decrease credits)
- A/B test referral messaging
- Add social proof (show referral count on landing page)
- Implement leaderboard (optional: gamification)

## **8.2 Marketing Approach**

### **Internal Promotion**
- Email announcement to all existing users
- In-app banner for 2 weeks post-launch
- Blog post explaining program
- Update FAQ/Help Center

### **Referral Message Templates**
Provide users with pre-written messages they can customize:

**LinkedIn:**
"I've been using MeetReady to automatically prep for every meeting – saves me hours each week. If you take a lot of external meetings, you'll love it. Sign up with my link and get 3 bonus meetings: [link]"

**Email:**
Subject: Check out MeetReady – you'll love this

Body: "Hey [Name], I thought you'd find this useful. MeetReady automatically researches everyone on my calendar before meetings and sends me prep notes. It's been a game-changer for client calls. Try it out: [link] (you'll get 3 bonus meetings on me!)"

---

# **9. Implementation Checklist**

## **9.1 Database**
- [ ] Create `referrals` table with proper indexes
- [ ] Create `referral_credits` table
- [ ] Add columns to `users` table
- [ ] Add column to `meetings` table
- [ ] Set up RLS policies for new tables
- [ ] Create database migration script

## **9.2 Backend**
- [ ] Generate referral codes for all existing users (migration)
- [ ] Implement referral code validation logic
- [ ] Build referral tracking on signup
- [ ] Implement first prep note detection
- [ ] Build credit distribution logic
- [ ] Create monthly credit reset cron job
- [ ] Add anti-abuse detection logic
- [ ] Build API endpoints (4 total)
- [ ] Write unit tests for credit logic

## **9.3 Frontend**
- [ ] Design referral dashboard page UI
- [ ] Build referral dashboard components
- [ ] Add dashboard widget/banner
- [ ] Create share buttons (Email, LinkedIn, Twitter)
- [ ] Build referred user signup page variant
- [ ] Add in-app notification system
- [ ] Update settings page with referral tab
- [ ] Implement copy-to-clipboard functionality
- [ ] Add loading states and error handling

## **9.4 Email**
- [ ] Design 4 email templates (referrer invite, 2 completion, milestone)
- [ ] Set up email triggers in Resend
- [ ] Test email deliverability
- [ ] Add unsubscribe handling

## **9.5 Analytics**
- [ ] Implement event tracking (link clicks, signups, completions)
- [ ] Create internal admin dashboard
- [ ] Set up alerts for suspicious activity
- [ ] Build referral funnel report

## **9.6 Testing**
- [ ] End-to-end test: Complete referral flow
- [ ] Test credit distribution for Free users
- [ ] Test subscription extension for Pro users
- [ ] Test edge cases (already registered, etc.)
- [ ] Load test with high referral volume
- [ ] Security review (XSS, CSRF on referral codes)

## **9.7 Documentation**
- [ ] Add referral section to Help Center
- [ ] Update FAQ with common questions
- [ ] Create referral program terms & conditions
- [ ] Write internal runbook for fraud handling

## **9.8 Launch**
- [ ] Soft launch with Pro users
- [ ] Monitor for 1 week, fix issues
- [ ] Full launch announcement
- [ ] Send email to all users
- [ ] Update landing page with social proof

---

# **10. Future Enhancements**

## **10.1 V2 Features (Post-MVP)**

### **Referral Leaderboard**
- Public or private leaderboard showing top referrers
- Monthly competitions with prizes
- Gamification: Badges for milestones (5, 10, 25, 50 referrals)

### **Team Referrals**
- Allow companies to have shared referral pools
- Team credit bonuses (entire team gets +5 meetings if 10 people join)

### **Advanced Tracking**
- UTM parameter support for tracking referral sources
- Integration with PostHog/Mixpanel for cohort analysis
- Referral attribution window (credit referrer even if signup delayed)

### **Dynamic Rewards**
- Experiment with different reward structures
- Tiered rewards (more referrals = bigger bonuses)
- Limited-time double rewards promotions

### **Social Proof**
- Show "X people joined via referrals this week" on landing page
- Testimonials from users who joined via referral

---

# **11. Success Criteria**

The referral system is considered successful if, within 3 months:

| Metric | Target |
|--------|--------|
| % of users who share link | >30% |
| Referral-driven signups | >20% of new users |
| Referral completion rate | >50% |
| Viral coefficient | >0.25 |
| CAC reduction | -40% |

---

# **12. Open Questions**

- [ ] Should referral credits be transferable (gift to others)?
- [ ] Should we allow custom referral codes (vanity codes)?
- [ ] What happens if referred user churns immediately after activation?
- [ ] Should we have a maximum lifetime referral cap per user?
- [ ] Do we want to test cash rewards instead of credits for power users?

---

# **Appendix A: User Stories**

## **Story 1: Free User Refers a Friend**
**As a** Free plan user  
**I want to** share MeetReady with my colleague  
**So that** I can earn extra meeting credits

**Acceptance Criteria:**
- I can access my unique referral link from the dashboard
- I can copy the link with one click
- When my friend signs up and generates their first prep note, I receive +2 credits
- I can see my referral count and credits in real-time

## **Story 2: Pro User Earns Free Month**
**As a** Pro plan subscriber  
**I want to** refer multiple people  
**So that** I can extend my subscription for free

**Acceptance Criteria:**
- After 5 completed referrals, I receive 1 free month
- The free month is added to the end of my subscription
- I can track my progress toward the next free month (e.g., 3/5 completed)
- I receive an email notification when I earn a free month

## **Story 3: New User Gets Welcome Bonus**
**As a** new user who signed up via referral  
**I want to** receive bonus credits  
**So that** I can try more meetings in my first month

**Acceptance Criteria:**
- I see a welcome message showing I was referred by [Name]
- After generating my first prep note, I receive +3 bonus credits
- My dashboard shows 8 total meetings available (5 base + 3 bonus)
- I receive a welcome email confirming the bonus

---

*— End of Document —*
