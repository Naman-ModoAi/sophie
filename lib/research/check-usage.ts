/**
 * Credit-based usage checking utilities
 * Replaces the old meeting-based limit system with credit-based checks
 */

import { createServiceClient } from "@/lib/supabase/server";

// Import credit config utilities for cost estimation
async function getCreditConfig(key: string): Promise<number> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from('credit_config')
    .select('config_value')
    .eq('config_key', key)
    .single();

  if (error || !data) {
    // Fallback defaults
    const defaults: Record<string, number> = {
      'credit_estimate_per_person': 0.015,
      'credit_baseline_usd': 0.01,
      'credit_rounding_step': 0.05,
    };
    return defaults[key] ?? 0;
  }

  return Number(data.config_value);
}

/**
 * Result of credit availability check
 */
export interface CreditCheckResult {
  allowed: boolean;
  reason?: string;
  creditsNeeded?: number;
  creditsAvailable?: number;
}

/**
 * Check if user has sufficient credits to perform research
 *
 * @param userId - User ID to check credits for
 * @param creditsNeeded - Number of credits required for the operation
 * @returns Object with allowed status and optional reason for denial
 */
export async function checkResearchAllowed(
  userId: string,
  creditsNeeded: number
): Promise<CreditCheckResult> {
  const supabase = await createServiceClient();

  // Call the database function to check credit balance
  const { data, error } = await supabase.rpc('check_credit_balance', {
    p_user_id: userId,
    p_credits_needed: creditsNeeded
  });

  if (error) {
    console.error('[Credit Check] Error checking credit balance:', {
      error,
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      userId,
      creditsNeeded
    });

    // TEMPORARY: If function doesn't exist (migrations not run), allow research
    // This happens when credit system hasn't been migrated yet
    if (error.code === '42883' || error.message?.includes('function') || error.message?.includes('does not exist')) {
      console.warn('[Credit Check] Credit system not yet migrated - allowing research');
      return {
        allowed: true,
        creditsNeeded,
        reason: 'Credit system not initialized'
      };
    }

    return {
      allowed: false,
      reason: 'Error checking credits',
      creditsNeeded
    };
  }

  console.log('[Credit Check] RPC call succeeded:', { data, userId, creditsNeeded });

  if (!data) {
    // Get user's current credit balance for better error messaging
    const { data: userData } = await supabase
      .from('users')
      .select('credits_balance')
      .eq('id', userId)
      .single();

    return {
      allowed: false,
      reason: 'Insufficient credits',
      creditsNeeded,
      creditsAvailable: userData?.credits_balance ?? 0
    };
  }

  return {
    allowed: true,
    creditsNeeded
  };
}

/**
 * Get user's current credit balance and usage stats
 *
 * @param userId - User ID to get credits for
 * @returns Object with credit balance and usage information
 */
export async function getUserCredits(userId: string): Promise<{
  balance: number;
  usedThisMonth: number;
  lastReset: string | null;
  planName: string | null;
  monthlyAllocation: number | null;
}> {
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from('users')
    .select(`
      credits_balance,
      credits_used_this_month,
      last_credit_reset_at,
      subscriptions!inner(
        plan:plans(
          name,
          monthly_credits
        )
      )
    `)
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error('Error fetching user credits:', error);
    return {
      balance: 0,
      usedThisMonth: 0,
      lastReset: null,
      planName: null,
      monthlyAllocation: null
    };
  }

  // Extract plan info from joined data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscriptions = (data as any).subscriptions as any[];
  const subscription = subscriptions?.[0];
  const plan = subscription?.plan;

  return {
    balance: data.credits_balance,
    usedThisMonth: data.credits_used_this_month,
    lastReset: data.last_credit_reset_at,
    planName: plan?.name ?? null,
    monthlyAllocation: plan?.monthly_credits ?? null
  };
}

/**
 * Estimate credits needed for research based on database-driven average cost
 * Replaces the old "1 credit = 1 attendee" hardcoded logic
 *
 * @param attendeeCount - Number of people to research
 * @param companyCount - Number of companies to research (included in attendee cost)
 * @returns Estimated credits needed (rounded to nearest rounding step)
 */
export async function estimateCreditsNeeded(
  attendeeCount: number,
  _companyCount: number
): Promise<number> {
  // Fetch average cost per person from database
  const avgCostPerPerson = await getCreditConfig('credit_estimate_per_person');
  const costBaseline = await getCreditConfig('credit_baseline_usd');

  // Calculate estimated credits
  const estimatedCredits = attendeeCount * (avgCostPerPerson / costBaseline);

  // Round up to nearest rounding step
  const roundingStep = await getCreditConfig('credit_rounding_step');
  return Math.ceil(estimatedCredits / roundingStep) * roundingStep;
}

/**
 * @deprecated Use estimateCreditsNeeded() instead for accurate cost-based estimation
 *
 * Calculate credits needed for a meeting's research (DEPRECATED)
 * Fixed cost model: 1 credit per attendee (includes company research)
 * This function uses hardcoded "1 credit = 1 attendee" logic which does not
 * reflect actual API costs. Kept for backwards compatibility only.
 *
 * @param attendeeCount - Number of people to research
 * @param companyCount - Number of companies to research (included in attendee cost)
 * @returns Total credits needed
 */
export function calculateCreditsNeeded(
  attendeeCount: number,
  _companyCount: number
): number {
  // Fixed cost: 1 credit per attendee (includes their company research)
  return attendeeCount;
}
