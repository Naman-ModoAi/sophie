# Claude Context - Sophie Frontend

This document provides context for AI assistants (like Claude) working on the Sophie frontend codebase.

---

## Project Overview

**Sophie** is a meeting preparation tool that automatically researches meeting attendees and generates prep notes using AI.

### Core Features
- Google Calendar integration with automatic meeting sync
- AI-powered research on external meeting attendees (people + companies)
- Automated prep note generation and email delivery
- Credit-based usage system (Free: 20 credits/month, Pro: 200 credits/month)
- Stripe subscription management

---

## Tech Stack

### Framework & Language
- **Next.js 14** (App Router)
- **TypeScript** (strict mode)
- **React 18** (Server Components + Client Components)

### Authentication & Database
- **Supabase Auth** (Google OAuth provider)
- **Supabase Database** (PostgreSQL with Row Level Security)
- **@supabase/ssr** for session management

### Styling & UI
- **Tailwind CSS** (utility-first)
- **Design Token System** (defined in `app/globals.css`)
- Custom UI component library (`components/ui/`)

### Key Dependencies
- `googleapis` - Google Calendar API access
- `stripe` - Payment processing
- `@google/generative-ai` - Gemini AI for research

---

## Architecture

### Route Structure

```
app/
├── (public)/              # Unauthenticated routes
│   ├── layout.tsx         # Minimal passthrough layout
│   └── page.tsx           # Landing page with Google Sign-in
│
├── (app)/                 # Authenticated routes (protected by middleware)
│   ├── layout.tsx         # AppShell with Sidebar + TopNav
│   ├── dashboard/
│   │   └── page.tsx       # Meeting list and details
│   └── settings/
│       └── page.tsx       # User settings, subscription, calendar
│
└── api/
    ├── auth/
    │   ├── login/         # Initiate Google OAuth
    │   ├── callback/      # OAuth callback + user sync
    │   └── logout/        # Sign out
    ├── calendar/
    │   └── resync/        # Manual calendar sync
    ├── settings/
    │   ├── email-timing/  # Update email preferences
    │   └── subscription-status/  # Get subscription info
    └── stripe/
        ├── checkout/      # Create checkout session
        ├── portal/        # Customer portal
        └── webhook/       # Stripe webhook handler
```

### Authentication Flow

1. User clicks "Sign in with Google" on landing page
2. `/api/auth/login` initiates Supabase OAuth flow
3. Google redirects to `/api/auth/callback` with authorization code
4. Callback exchanges code for session via `supabase.auth.exchangeCodeForSession()`
5. **User sync**: Upsert user data to custom `users` table (critical for RLS)
6. Store OAuth tokens in `oauth_tokens` table for Calendar API
7. Redirect to `/dashboard`

**Important**: The custom `users` table must be kept in sync with Supabase Auth's `auth.users` table. The `users.id` field MUST equal `auth.uid()` for RLS policies to work.

### Database Schema (Key Tables)

#### Core Tables
- **users** - User profiles (synced with Supabase Auth)
  - `id` (UUID) - Must match `auth.uid()`
  - `google_user_id`, `email`, `name`, `profile_photo_url`
  - `plan_type` ('free' | 'pro')
  - `credits_balance`, `credits_used_this_month`
  - RLS: Users can only access their own record

- **oauth_tokens** - Google OAuth tokens for Calendar API
  - `user_id`, `provider`, `access_token`, `refresh_token`, `expires_at`
  - RLS: Users can only access their own tokens

- **meetings** - Synced from Google Calendar
  - `user_id`, `google_event_id`, `title`, `start_time`, `end_time`
  - `is_internal`, `is_cancelled`, `status` (research workflow)
  - RLS: Users can only see their own meetings

- **attendees** - Meeting participants
  - `meeting_id`, `email`, `name`, `is_internal`
  - `company_id` (FK to companies), `research_data` (JSONB)
  - RLS: Users can only see attendees for their meetings

- **companies** - Cached company information
  - `domain`, `name`, `description`, `website`, `research_data` (JSONB)
  - RLS: Users can only see companies linked to their meetings

#### Subscription Tables
- **plans** - Available subscription plans
  - `name` ('free' | 'pro'), `credits_per_month`, `price_monthly`
  - `credit_rollover_enabled`

- **subscriptions** - User subscriptions
  - `user_id`, `plan_id`, `stripe_subscription_id`
  - `status`, `current_period_end`, `cancel_at_period_end`
  - RLS: Users can only see their own subscription

- **transactions** - Payment records
  - `user_id`, `stripe_payment_intent_id`, `amount`, `status`

### Row Level Security (RLS)

**All user-facing tables have RLS enabled.** Policies use `auth.uid()` to restrict access:

```sql
-- Example: meetings table policy
CREATE POLICY "Users can view own meetings"
ON meetings FOR SELECT
USING (auth.uid() = user_id);
```

**Service Role Usage**: The service role key (bypasses RLS) should ONLY be used for:
1. **Stripe webhooks** - Update subscriptions/transactions
2. **Calendar sync** - Create meetings/attendees/companies on behalf of user
3. **OAuth callback** - Initial user creation and token storage

**All other routes** use the anon key with `getAuthUser()` to respect RLS.

---

## Design System

### Design Tokens (CSS Variables)

Defined in `app/globals.css`:

```css
--color-text: #0A0A0FCC;       /* Text color */
--color-background: #F0F0F5;   /* App background */
--color-accent: #0D9488;       /* CTA/accent (teal) */
--color-surface: #FFFFFF;      /* Cards/surfaces */
```

### Tailwind Theme Extensions

```typescript
colors: {
  text: 'rgb(var(--color-text) / <alpha-value>)',
  background: 'rgb(var(--color-background) / <alpha-value>)',
  accent: 'rgb(var(--color-accent) / <alpha-value>)',
  surface: 'rgb(var(--color-surface) / <alpha-value>)',
}
```

### Usage Rules

**CRITICAL**: Never use hardcoded colors. Always use design tokens:

✅ **Correct**:
- `bg-background` - App background
- `bg-surface` - Card backgrounds
- `text-text` - Primary text
- `text-text/70` - Secondary text (70% opacity)
- `bg-accent` - Primary buttons, active states
- `border-text/10` - Subtle borders

❌ **Incorrect**:
- `bg-gray-100` - Use `bg-background`
- `text-gray-800` - Use `text-text`
- `bg-blue-500` - Use `bg-accent`
- `border-gray-200` - Use `border-text/10`

### Component Library (`components/ui/`)

Reusable components following design system:

- **Button** - `variant="primary" | "secondary"`
- **Card** - Container with surface background
- **Input/Textarea** - Form inputs with error states
- **Badge** - Status indicators (`variant="default" | "accent" | "success" | "warning"`)
- **Tabs** - Tabbed interface with state management
- **Modal** - Dialog with backdrop and ESC/click-outside handlers
- **Avatar** - User profile images with initials fallback

**Always use these components** instead of creating inline UI elements.

---

## Credit System

### Pricing Model

**Cost-based system: 1 credit = $0.01 (1 cent)**

Credits are calculated based on actual API costs (tokens + search/grounding queries):
- **Token costs**: Gemini input/output/cached/thinking tokens
- **Gemini 3.x**: Search costs ($14 per 1,000 queries)
- **Gemini 2.x**: Grounding costs ($35 per 1,000 grounded prompts)

**Typical cost per person**: ~1-2 credits (varies based on token usage and API features)

**Plans**:
- **Free**: 20 credits/month, no rollover (~10-20 people researched)
- **Pro**: 200 credits/month, with rollover (~100-200 people researched)

### Credit Flow

1. User triggers research for a meeting
2. **Pre-research**: Estimate credits needed using `estimateCreditsNeeded()` (database-driven average)
3. Check balance: `checkResearchAllowed(userId, estimatedCredits)`
4. Perform research (if sufficient credits)
5. **Post-research**: Consume actual credits based on real API costs via `TokenTracker.trackUsage()`
6. Pro users bypass credit consumption entirely

### Gemini Pricing Models

The system supports both Gemini 2.x and 3.x pricing models via database configuration:

**Gemini 3.x (Current Default)**:
- Per-query search billing: $14 per 1,000 queries
- Set `gemini_search_price_per_1000 = 14.0`, `gemini_grounding_price_per_1000 = 0`

**Gemini 2.x**:
- Per-prompt grounding billing: $35 per 1,000 grounded prompts
- Set `gemini_search_price_per_1000 = 0`, `gemini_grounding_price_per_1000 = 35.0`

See `GEMINI_PRICING_CONFIG.md` for detailed configuration instructions.

### Database Functions

- `check_credit_balance(user_id, credits_needed)` - Verify sufficient credits
- `consume_credits(user_id, credits)` - Atomically deduct credits
- `allocate_monthly_credits(user_id)` - Monthly reset (cron job)
- `track_token_usage(...)` - Records token usage with grounding metadata

### Key Files

- `lib/research/credit-config.ts` - Cost calculation and database config management
- `lib/research/token-tracker.ts` - Track usage and consume credits
- `lib/research/check-usage.ts` - Pre-research credit checks and estimation
- `GEMINI_PRICING_CONFIG.md` - Configuration guide for Gemini 2.x/3.x switching

---

## Common Tasks

### Adding a New Protected Route

1. Create page in `app/(app)/your-route/page.tsx`
2. Use `getAuthUser()` to get authenticated user:
   ```typescript
   import { getAuthUser } from '@/lib/supabase/server'

   export default async function YourPage() {
     const user = await getAuthUser()
     if (!user) redirect('/')

     // Your page content
   }
   ```
3. Middleware automatically protects all routes under `/(app)/`

### Querying User-Scoped Data

**Use anon key (respects RLS)**:

```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data: meetings } = await supabase
  .from('meetings')
  .select('*')
  .eq('user_id', user.id) // RLS will enforce this anyway
```

### Using Service Role (Bypass RLS)

**ONLY for webhooks, calendar sync, or OAuth callback**:

```typescript
import { createServiceClient } from '@/lib/supabase/server'

const serviceSupabase = await createServiceClient()
// Be very careful - this bypasses all RLS policies
```

### Creating a New UI Component

1. Create component in `components/ui/YourComponent.tsx`
2. Use ONLY design tokens for colors
3. Export from `components/ui/index.ts`
4. Add TypeScript types for all props
5. Use `forwardRef` for input-like components

### Handling Realtime Subscriptions

**Client-side only**:

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const channel = supabase
  .channel('table-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'your_table',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    // Handle change
  })
  .subscribe()

// Cleanup
return () => { supabase.removeChannel(channel) }
```

---

## Environment Variables

### Required Variables (.env.local)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...  # Must start with "eyJ" (JWT)
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Google OAuth (Configured in Supabase Dashboard)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Gemini AI
GOOGLE_GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-3-flash-preview

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Critical Environment Variable Issues

**Supabase Anon Key Format**: Must be a JWT token starting with `eyJ`. If you see errors like:
```
WebSocket connection to 'wss://xxx.supabase.co/realtime/v1/websocket' failed
```

This means your `NEXT_PUBLIC_SUPABASE_ANON_KEY` is invalid. Get the correct key from:
- Supabase Dashboard → Settings → API → anon/public key

---

## Migration History

### 2026-01-31: Supabase Auth Migration

**From**: Custom iron-session + googleapis OAuth
**To**: Supabase Auth with Google OAuth provider

**Key Changes**:
- Authentication now managed by Supabase Auth
- Session management via `@supabase/ssr`
- RLS enabled on all user-facing tables
- Service role restricted to specific use cases

**Critical Fix (2026-02-02)**: Added user sync logic in OAuth callback to maintain custom `users` table in sync with Supabase Auth's `auth.users` table.

See `MIGRATION_GUIDE.md` for complete details.

---

## Testing

### Manual Testing Checklist

After making changes, verify:

1. **Authentication**
   - [ ] Login via Google OAuth works
   - [ ] Protected routes redirect unauthenticated users
   - [ ] Logout clears session and redirects

2. **Dashboard**
   - [ ] Meetings load and display correctly
   - [ ] Calendar sync works
   - [ ] Realtime updates appear

3. **Settings**
   - [ ] User data loads
   - [ ] Email timing preferences save
   - [ ] Subscription status displays correctly

4. **Stripe Integration**
   - [ ] Checkout flow works
   - [ ] Customer portal opens
   - [ ] Webhooks update subscription status
   - [ ] Credits allocated on subscription activation

### Database Verification

Check RLS policies are working:

```sql
-- As authenticated user
SELECT * FROM meetings WHERE user_id != auth.uid();
-- Should return 0 rows (RLS blocks access)
```

---

## Common Pitfalls

### 1. Using Service Role Unnecessarily

**Problem**: Using `createServiceClient()` for regular queries bypasses RLS
**Solution**: Use `createClient()` and let RLS handle access control

### 2. Hardcoded Colors

**Problem**: Using `bg-gray-100` instead of design tokens
**Solution**: Always use `bg-background`, `bg-surface`, `text-text`, etc.

### 3. Missing User Sync

**Problem**: Creating users in `auth.users` but not custom `users` table
**Solution**: OAuth callback now handles this automatically (as of 2026-02-02)

### 4. Invalid Supabase Anon Key

**Problem**: WebSocket/Realtime connections fail with invalid anon key
**Solution**: Get correct JWT token from Supabase Dashboard → Settings → API

### 5. Forgetting RLS

**Problem**: Creating new tables without RLS policies
**Solution**: Always add RLS policies for user-scoped data:
```sql
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own records" ON your_table
FOR SELECT USING (auth.uid() = user_id);
```

---

## Documentation

### Key Documents

- **README.md** - Setup and installation
- **CHANGELOG.md** - Complete change history
- **MIGRATION_GUIDE.md** - Supabase Auth migration details
- **CLAUDE.md** - This file (AI assistant context)

### Code Comments

Follow these conventions:
- Document "why" not "what"
- Explain business logic and edge cases
- Mark TODOs with context
- Use JSDoc for exported functions

---

## Getting Help

### Common Issues

**Issue**: Dashboard not loading meetings
**Fix**: Check that custom `users` table has matching record with `auth.users`

**Issue**: "Insufficient credits" error for Pro users
**Fix**: Pro users should bypass credit check - verify `plan_type = 'pro'`

**Issue**: Realtime subscriptions not working
**Fix**: Verify Realtime is enabled in Supabase Dashboard and anon key is valid

### Debug Checklist

1. Check browser console for errors
2. Check server logs (`npm run dev` output)
3. Verify environment variables are loaded
4. Check Supabase Dashboard for RLS policy blocks
5. Verify user session is active (`getAuthUser()`)

---

## Development Workflow

### Running Locally

```bash
npm install
npm run dev
```

### Database Migrations

Migrations are in `supabase/migrations/`. To apply:

```bash
supabase db push
```

### Type Generation

Generate TypeScript types from Supabase schema:

```bash
supabase gen types typescript --local > types/supabase.ts
```

---

## Future Considerations

- **Email Service**: Currently using nodemailer, may need dedicated service
- **Background Jobs**: Consider dedicated queue system for research tasks
- **Rate Limiting**: Add rate limits to API endpoints
- **Analytics**: Track feature usage and errors
- **A/B Testing**: Framework for testing UX improvements

---

**Last Updated**: 2026-02-02
**Maintained By**: Development team and AI assistants
