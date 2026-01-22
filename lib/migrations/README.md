# Database Migrations

This directory contains all database schema and configuration migrations for PrepFor.app.

## Migrations Overview

| File | Purpose | Status |
|------|---------|--------|
| `001_init_schema.sql` | Complete schema: creates tables + RLS policies + permissions | Required (full setup) |
| `003_fix_rls_policies.sql` | Fix RLS policies if they break or become corrupted | Optional (fix only) |
| `004_fix_table_permissions.sql` | Fix table permissions if they break or become corrupted | Optional (fix only) |

## Running Migrations

### Option 1: Fresh Setup (Recommended)

For a fresh database setup, `001_init_schema.sql` contains everything you need:

```bash
npm run migrate
```

This will run all three migrations in sequence:
1. Create all tables + RLS policies + permissions (001)
2. Apply RLS policies fix (003)
3. Apply table permissions fix (004)

Result: Fully initialized database ready for use.

### Option 2: Fix Broken Permissions

If RLS policies or table permissions break, run the fix scripts separately:

**Fix RLS policies only:**
```bash
npm run migrate 003
```

**Fix table permissions only:**
```bash
npm run migrate 004
```

### Option 3: Manual via Supabase Dashboard

1. Go to https://app.supabase.com/
2. Select your project
3. Click **SQL Editor** → **New Query**
4. For fresh setup, paste: `001_init_schema.sql` (has everything)
5. For fixes, paste the specific script that needs to be fixed:
   - `003_fix_rls_policies.sql` - To fix RLS policies
   - `004_fix_table_permissions.sql` - To fix table permissions
6. Click **Run**

## What Each Migration Does

### 001_init_schema.sql

**Complete initial setup** - Creates everything needed for a fresh database:

**1. Creates four tables with proper indexes and constraints:**

- **users** - Google user accounts
  - Columns: id, google_user_id, email, name, profile_photo_url, plan_type, created_at, last_login_at

- **oauth_tokens** - Google OAuth tokens
  - Columns: id, user_id, provider, access_token, refresh_token, expires_at, created_at, updated_at
  - Index: oauth_tokens_user_id

- **meetings** - Calendar events synced from Google Calendar
  - Columns: id, user_id, calendar_event_id, title, start_time, end_time, description, location, is_external, is_all_day, is_cancelled, created_at, updated_at
  - Indexes: meetings_user_id, meetings_start_time
  - Constraint: Unique(user_id, calendar_event_id)

- **attendees** - People attending meetings
  - Columns: id, meeting_id, email, name, domain, is_internal, created_at
  - Index: attendees_meeting_id
  - Constraint: Unique(meeting_id, email)

**2. Enables RLS and creates policies** - Same as 003_fix_rls_policies.sql

**3. Grants table permissions** - Same as 004_fix_table_permissions.sql

This is a **complete, standalone migration**. After running this, your database is fully initialized with schema, RLS, and permissions.

### 003_fix_rls_policies.sql

**RLS policies fix script** - Use when RLS policies break or become corrupted.

Drops and recreates all RLS policies from scratch:

**Users Table:**
- SELECT: Own record only (auth.uid() = id)
- UPDATE: Own record only (auth.uid() = id)
- Service role: Full access

**OAuth Tokens Table:**
- SELECT/INSERT/UPDATE/DELETE: Own tokens only (user_id matches auth.uid())
- Service role: Full access

**Meetings Table:**
- SELECT/INSERT/UPDATE/DELETE: Own meetings only (user_id matches auth.uid())
- Service role: Full access

**Attendees Table:**
- SELECT/INSERT/UPDATE/DELETE: Attendees from own meetings only
- Service role: Full access

### 004_fix_table_permissions.sql

**Table permissions fix script** - Use when table permissions are denied or broken.

Grants table permissions to database roles:

**Authenticated Role:**
- ALL permissions on all tables (RLS policies enforce ownership)

**Service Role:**
- ALL permissions on all tables (bypasses RLS, for backend services)

**Anon Role:**
- SELECT permission on users, meetings, attendees (for public access if needed)

**All Roles:**
- USAGE, SELECT on all sequences

## Troubleshooting

### Migration Failed: "Permission Denied"

If you see "permission denied for table X", the 004 migration may have failed. Run it manually or run `npm run migrate` again.

### Migration Failed: "Duplicate Policy"

If you see "policy already exists", you may have run the migration twice. This is safe - the migration drops policies before creating new ones.

### Verify RLS Policies Are Active

Run this query in Supabase SQL Editor:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Should show multiple policies for each table.

### Verify Table Permissions

Run this query in Supabase SQL Editor:

```sql
SELECT grantee, privilege_type, table_name
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
AND grantee IN ('authenticated', 'service_role', 'anon')
ORDER BY table_name, grantee, privilege_type;
```

Should show appropriate grants for each role.

## Environment Setup

Make sure `.env.local` has these variables before running migrations:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Next Steps After Migrations

1. Start the development server: `npm run dev`
2. Visit http://localhost:3000
3. Sign in with Google (OAuth flow)
4. Click "Sync Calendar" to fetch your meetings
5. Verify data appears in Supabase dashboard

## Migration History

All migrations are sourced from `C:\sophie\backend\setup\migrations\` in the Python backend and have been incorporated into the Next.js frontend for ease of deployment.

**Created:** 2026-01-21
**Version:** 1.0
