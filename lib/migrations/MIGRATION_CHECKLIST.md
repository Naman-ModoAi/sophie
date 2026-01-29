# Credit System Migration Checklist

## Pre-Migration
- [ ] Backup database
- [ ] Verify environment variables set (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
- [ ] Review migration files (8 total in frontend/lib/migrations/)
- [ ] Schedule maintenance window if needed

## Migration Execution
- [ ] Run migration 001: Create plans table
- [ ] Run migration 002: Create subscriptions table
- [ ] Run migration 003: Create transactions table
- [ ] Run migration 004: Add user credit columns
- [ ] Run migration 005: Create credit functions
- [ ] Run migration 006: Seed plans and initialize data
- [ ] Run migration 007: Add credits to token_usage
- [ ] Run migration 008: Cleanup old system

## Verification
- [ ] Verify 3 new tables exist (plans, subscriptions, transactions)
- [ ] Verify 2 plans seeded (free, pro)
- [ ] Verify user credits initialized (free=10, pro=1000)
- [ ] Verify subscriptions created for all users
- [ ] Test check_credit_balance() function
- [ ] Test consume_credits() function
- [ ] Test allocate_monthly_credits() function

## Application Testing
- [ ] Test research with sufficient credits (should succeed)
- [ ] Test research with insufficient credits (should fail with 403)
- [ ] Test pro user unlimited credits (should always succeed)
- [ ] Verify credit consumption tracked in token_usage.credits_consumed
- [ ] Check application logs for credit tracking messages

## Stripe Integration (if applicable)
- [ ] Test subscription webhook (customer.subscription.created)
- [ ] Test payment webhook (invoice.payment_succeeded)
- [ ] Test cancellation webhook (customer.subscription.deleted)
- [ ] Verify transactions recorded
- [ ] Verify credits allocated on subscription activation

## Post-Migration Monitoring
- [ ] Monitor credit consumption metrics
- [ ] Check for users with negative credits (bug indicator)
- [ ] Verify monthly reset cron job scheduled
- [ ] Monitor Stripe webhook delivery
- [ ] Review application error logs

## Optional: Cleanup (After 1-2 weeks)
- [ ] Drop old meetings_used column
- [ ] Drop old usage_reset_at column
- [ ] Update any remaining references to old system

## Rollback Ready
- [ ] Database backup location: _______________
- [ ] Rollback SQL commands prepared (see CREDIT_SYSTEM_MIGRATION.md)
- [ ] Previous git commit hash: _______________

## Sign-off
- [ ] Database migration completed
- [ ] Application deployed
- [ ] Verification tests passed
- [ ] Monitoring in place
- [ ] Team notified

---

**Migration Date**: _______________
**Performed By**: _______________
**Database Backup**: _______________
**Issues Encountered**: _______________
