# Migration Consolidation Notes

**Date**: 2026-02-03
**Action**: Consolidated 30+ migration files into 7 logical, maintainable scripts

## Overview

Previously, the database schema was spread across 30+ incremental migration files in `lib/migrations/`, many of which were patches and fixes. This consolidation creates a clean, logical structure representing the final state of the database schema.

## New Structure

### 01_users_and_auth.sql
- **users** table with all columns (credits, tokens, referrals)
- **oauth_tokens** table
- Indexes and comments

### 02_meetings.sql
- **meetings** table
- **companies** table
- **attendees** table (with company_id FK)
- **prep_notes** table
- **email_queue** table
- Updated_at triggers
- Helper functions (get_pending_emails)

### 03_subscriptions.sql
- **plans** table
- **subscriptions** table
- **transactions** table
- **referrals** table
- **referral_credits** table
- Indexes and comments

### 04_token_tracking.sql
- **token_usage** table (with ALL token columns including tool_use_prompt_tokens)
- **api_usage** table
- Indexes and comments

### 05_functions.sql
- Credit management: check_credit_balance, consume_credits, allocate_monthly_credits, reset_monthly_credits
- Token tracking: track_token_usage, track_api_usage
- Referral system: generate_referral_code, award_referral_credits, check_and_complete_referral

### 06_rls_policies.sql
- Enable RLS on all tables
- Create policies for all tables
- Grant permissions (authenticated, service_role, anon)

### 07_seed_data.sql
- Insert Free and Pro plans
- Initialize existing users (credits and subscriptions)
- Generate referral codes for existing users

## Key Changes

1. **All tables include final schema** - No incremental ALTER statements
2. **Complete column definitions** - Including tool_use_prompt_tokens, thoughts_tokens, referral columns
3. **Consolidated RLS policies** - All in one file for easy review
4. **Combined functions** - Credit, token, and referral functions together
5. **Idempotent** - Uses IF NOT EXISTS, ON CONFLICT, DROP IF EXISTS patterns

## Migration History

Original migrations (archived in `lib/migrations/archive/`):
- 001_init_schema.sql
- 007_rollback_to_iron_session.sql
- 20260122_001_complete_phase2_schema.sql
- 20260123_002_add_email_timing.sql
- 20260123_003_add_usage_tracking.sql
- 20260123_004_add_stripe_fields.sql
- 20260126_001_add_token_tracking.sql
- 20260129_001-008 (plans, subscriptions, credits)
- 20260130_000-002 (token system cleanup, grounding metadata, costs)
- 20260131_001-002 (decimal fixes)
- 20260202_001-007 (referral system, tool use tokens, RLS fixes)

Total: 30 migration files consolidated into 7

## Verification

To verify the migrations work:

```bash
node scripts/migrate.js
```

This will:
1. Create all tables with final schema
2. Apply all RLS policies
3. Create all database functions
4. Seed initial plan data
5. Initialize existing users

## Benefits

1. **Clearer structure** - Easy to understand what each migration does
2. **Easier maintenance** - Fewer files to manage
3. **Logical grouping** - Related tables and features together
4. **Complete schema** - Each file shows final state, not incremental patches
5. **Better documentation** - Clear comments and organization

## Notes for Future Migrations

- Add new migrations as `08_feature_name.sql`, `09_feature_name.sql`, etc.
- Keep migrations focused on logical units (tables, features, systems)
- Use idempotent patterns (IF NOT EXISTS, ON CONFLICT DO UPDATE)
- Document schema changes in CLAUDE.md
