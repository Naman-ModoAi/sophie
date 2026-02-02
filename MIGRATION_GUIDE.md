# Migration Guide: iron-session to Supabase Auth

This guide documents the migration from iron-session to Supabase Auth that was completed on 2026-01-31.

## Summary

The application has been migrated from a custom iron-session + googleapis OAuth implementation to Supabase Auth with Google OAuth provider. This improves security, reduces maintenance burden, and leverages Supabase's built-in authentication features.

## What Changed

### 1. Authentication Flow

**Before:**
- Custom Google OAuth flow using `googleapis` package
- Manual token exchange and user creation
- iron-session for session management
- Custom session cookies

**After:**
- Supabase Auth with Google OAuth provider
- Supabase manages authentication state
- Session cookies managed by @supabase/ssr
- Built-in token refresh and session management

### 2. Session Management

**Before:**
```typescript
// lib/session.ts
const session = await getSession()
if (!session.isLoggedIn) {
  redirect('/')
}
```

**After:**
```typescript
// Using Supabase Auth
import { getAuthUser } from '@/lib/supabase/server'

const user = await getAuthUser()
if (!user) {
  redirect('/')
}
```

### 3. Database Access

**Before:**
- Service role client used for ALL database queries
- No Row Level Security (RLS)
- Manual authorization checks in application code

**After:**
- Anon key client for user-scoped queries
- Service role ONLY for:
  - Stripe webhooks
  - Calendar sync (writes on behalf of user)
  - OAuth callback (initial user creation)
- RLS policies enforce data isolation at database level

## Setup Instructions

### 1. Configure Supabase Auth

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google OAuth provider
3. Add your Google Client ID and Client Secret
4. Set redirect URL to: `https://your-app.com/api/auth/callback`

### 2. Update Environment Variables

Remove from `.env`:
```bash
SESSION_SECRET=...  # No longer needed
```

Ensure you have:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google OAuth (still needed for Calendar API)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

### 3. Run RLS Migration

Apply the Row Level Security policies:

```bash
# Using Supabase CLI
supabase db push

# Or manually run the migration
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/20260131_enable_rls.sql
```

### 4. Update Google OAuth Consent Screen

Ensure your Google OAuth consent screen includes these scopes:
- `openid`
- `email`
- `profile`
- `https://www.googleapis.com/auth/calendar.readonly`

### 5. Remove Unused Dependencies (Optional)

```bash
npm uninstall iron-session
```

Note: We still use `googleapis` for Calendar API access.

## Migration Impact

### What Works Differently

1. **User ID Source**: User IDs now come from Supabase Auth (`auth.uid()`) instead of custom users table
2. **Session Duration**: Managed by Supabase (configurable in dashboard)
3. **Token Refresh**: Automatic via Supabase Auth
4. **Login Redirect**: Users are redirected through Supabase OAuth flow

### What Stays the Same

1. **Google Calendar Integration**: Still uses oauth_tokens table for Calendar API
2. **Stripe Integration**: No changes to webhook handling
3. **User Interface**: No visible changes to end users
4. **Database Schema**: All existing tables remain unchanged

## Security Improvements

### Row Level Security (RLS)

All user-facing tables now have RLS policies:

- **meetings**: Users can only access their own meetings
- **attendees**: Users can only access attendees for their meetings
- **subscriptions**: Users can only view their own subscription
- **oauth_tokens**: Users can only view their own tokens
- **users**: Users can only view/update their own profile
- **companies**: Users can only view companies linked to their meetings

### Service Role Usage

The service role key (which bypasses RLS) is now restricted to:

1. **Stripe Webhooks** (`app/api/stripe/webhook/route.ts`)
   - Updates subscriptions table

2. **Calendar Sync** (`app/(app)/dashboard/actions.ts`)
   - Creates meetings/attendees/companies on behalf of user

3. **OAuth Callback** (`app/api/auth/callback/route.ts`)
   - Initial user creation and token storage

All other routes use the anon key, which respects RLS policies.

## Testing Checklist

After migration, verify:

- [ ] Login flow works (Google OAuth → Dashboard)
- [ ] Protected routes redirect unauthenticated users
- [ ] Dashboard shows only user's own meetings
- [ ] Calendar sync creates meetings correctly
- [ ] Stripe checkout flow works
- [ ] Stripe webhooks update subscription status
- [ ] Settings page loads user preferences
- [ ] Logout clears session and redirects
- [ ] Users cannot access other users' data (RLS test)

## Rollback Plan

If you need to rollback:

1. Restore `lib/session.ts` from git history
2. Restore previous versions of:
   - `middleware.ts`
   - `app/api/auth/**/*.ts`
   - All route handlers
   - Server components
3. Disable RLS: `ALTER TABLE tablename DISABLE ROW LEVEL SECURITY;`
4. Redeploy

## Files Modified

### Deleted
- `lib/session.ts` - iron-session implementation

### Created
- `supabase/migrations/20260131_enable_rls.sql` - RLS policies

### Modified
- `lib/supabase/server.ts` - Added `getAuthUser()` helper
- `middleware.ts` - Supabase Auth session check
- `app/api/auth/login/route.ts` - Supabase OAuth initiation
- `app/api/auth/callback/route.ts` - Supabase code exchange
- `app/api/auth/logout/route.ts` - Supabase signOut
- `app/api/settings/**/*.ts` - Use `getAuthUser()`
- `app/api/stripe/**/*.ts` - Use `getAuthUser()`
- `app/api/calendar/resync/route.ts` - Use `getAuthUser()`
- `app/(app)/dashboard/page.tsx` - Use `getAuthUser()`
- `app/(app)/settings/page.tsx` - Use `getAuthUser()`
- `app/(app)/layout.tsx` - Use `getAuthUser()`
- `.env.example` - Removed SESSION_SECRET

## Support

For issues or questions about this migration, check:
- Supabase Auth docs: https://supabase.com/docs/guides/auth
- RLS docs: https://supabase.com/docs/guides/auth/row-level-security
