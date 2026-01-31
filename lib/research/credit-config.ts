import { createServiceClient } from '@/lib/supabase/server';

// Credit calculation constants
export const CREDIT_CONFIG = {
  INPUT_WEIGHT: 1.0,       // Baseline weight
  OUTPUT_WEIGHT: 6.0,      // Output costs 6x more than input
  CACHE_WEIGHT: 0.25,      // Cached tokens cost 75% less
  MIN_CREDITS: 0.25,       // Minimum charge per attendee
  CREDIT_STEP: 0.25,       // Billing granularity (0.25, 0.5, 0.75, 1.0, etc.)
} as const;

// Gemini 3 Flash Preview pricing (USD per 1M tokens)
export const GEMINI_PRICING = {
  INPUT_TOKENS: 0.50,
  OUTPUT_TOKENS: 3.00,
  CACHED_TOKENS: 0.125,
} as const;

// Calculate effective tokens (weighted by relative cost)
export function calculateEffectiveTokens(
  inputTokens: number,
  outputTokens: number,
  cachedTokens: number = 0
): number {
  return (
    inputTokens * CREDIT_CONFIG.INPUT_WEIGHT +
    outputTokens * CREDIT_CONFIG.OUTPUT_WEIGHT +
    cachedTokens * CREDIT_CONFIG.CACHE_WEIGHT
  );
}

// Calculate actual API cost in USD
export function calculateActualCost(
  inputTokens: number,
  outputTokens: number,
  cachedTokens: number = 0
): number {
  return (
    (inputTokens * GEMINI_PRICING.INPUT_TOKENS +
     outputTokens * GEMINI_PRICING.OUTPUT_TOKENS +
     cachedTokens * GEMINI_PRICING.CACHED_TOKENS) / 1_000_000
  );
}

// Get current credit baseline from database
export async function getCreditBaseline(): Promise<number> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase.rpc('get_credit_baseline');

  if (error || !data) {
    console.warn('[CreditConfig] Using default baseline:', 5000);
    return 5000; // fallback: (2000 × 1.0) + (500 × 6.0) = 5000
  }

  return Number(data);
}

// Calculate credits from tokens with step-based rounding
export async function calculateCreditsForTokens(
  inputTokens: number,
  outputTokens: number,
  cachedTokens: number = 0
): Promise<number> {
  const effectiveTokens = calculateEffectiveTokens(inputTokens, outputTokens, cachedTokens);
  const baseline = await getCreditBaseline();

  // Raw credits = effective tokens / baseline
  const rawCredits = effectiveTokens / baseline;

  // Round up to nearest CREDIT_STEP
  const roundedCredits = Math.ceil(rawCredits / CREDIT_CONFIG.CREDIT_STEP) * CREDIT_CONFIG.CREDIT_STEP;

  // Enforce minimum
  return Math.max(roundedCredits, CREDIT_CONFIG.MIN_CREDITS);
}
