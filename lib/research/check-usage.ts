/**
 * Credit-based usage checking utilities
 * Replaces the old meeting-based limit system with credit-based checks
 */

import { createServiceClient } from "@/lib/supabase/server";

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
  const subscription = data.subscriptions?.[0];
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
 * Calculate credits needed for a meeting's research
 *
 * @param attendeeCount - Number of people to research
 * @param companyCount - Number of companies to research (included in attendee cost)
 * @returns Total credits needed
 */
export function calculateCreditsNeeded(
  attendeeCount: number,
  companyCount: number
): number {
  // Fixed cost: 1 credit per attendee (includes their company research)
  return attendeeCount;
}
