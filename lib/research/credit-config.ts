import { createServiceClient } from '@/lib/supabase/server';

// Credit calculation constants (DEPRECATED - kept for backwards compatibility)
// New system uses cost-based calculations with database config
export const CREDIT_CONFIG = {
  INPUT_WEIGHT: 1.0,       // Deprecated: use cost-based calculation
  OUTPUT_WEIGHT: 6.0,      // Deprecated: use cost-based calculation
  CACHE_WEIGHT: 0.25,      // Deprecated: use cost-based calculation
  THINKING_WEIGHT: 6.0,    // Deprecated: use cost-based calculation
  TOOL_USE_WEIGHT: 1.0,    // Deprecated: use cost-based calculation
  CREDIT_STEP: 0.05,       // Billing granularity (rounds to nearest 0.05 credits)
  COST_BASELINE: 0.01,     // $0.01 (1 cent) = 1 credit
} as const;

// Gemini 3 Flash Preview pricing (USD per 1M tokens)
// DEPRECATED: Use getCreditConfig() to fetch from database instead
export const GEMINI_PRICING = {
  INPUT_TOKENS: 0.50,
  OUTPUT_TOKENS: 3.00,
  CACHED_TOKENS: 0.125,
  THINKING_TOKENS: 3.00,   // Billed at output rate
  TOOL_USE_TOKENS: 0.50,   // Billed at input rate
  SEARCH_COST_PER_1000: 14.0, // Per-query billing for Gemini 3.x
} as const;

// ============================================================================
// DATABASE CONFIG MANAGEMENT
// ============================================================================

// Cache for credit config (to avoid DB calls on every calculation)
let configCache: Map<string, number> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 300000; // 5 minutes

/**
 * Get credit configuration from database with caching
 */
async function getCreditConfig(key: string): Promise<number> {
  const now = Date.now();

  // Refresh cache if expired or not set
  if (!configCache || now - cacheTimestamp > CACHE_TTL_MS) {
    const supabase = await createServiceClient();
    const { data, error } = await supabase
      .from('credit_config')
      .select('config_key, config_value');

    if (error || !data) {
      console.warn('[CreditConfig] Failed to load config from DB, using defaults:', error?.message);
      configCache = null;
    } else {
      configCache = new Map(data.map(row => [row.config_key, Number(row.config_value)]));
      cacheTimestamp = now;
    }
  }

  return configCache?.get(key) ?? getDefaultConfig(key);
}

/**
 * Fallback default configuration if DB unavailable
 */
function getDefaultConfig(key: string): number {
  const defaults: Record<string, number> = {
    'gemini_input_price_per_1m': 0.50,
    'gemini_output_price_per_1m': 3.00,
    'gemini_cached_price_per_1m': 0.125,
    'gemini_thinking_price_per_1m': 3.00,
    'gemini_tool_use_price_per_1m': 0.50,
    'gemini_search_price_per_1000': 14.0,
    'credit_baseline_usd': 0.01,
    'credit_rounding_step': 0.05,
  };
  return defaults[key] ?? 0;
}

// Calculate effective tokens (weighted by relative cost)
// DEPRECATED: Use calculateActualCost() instead for cost-based system
export function calculateEffectiveTokens(
  inputTokens: number,
  outputTokens: number,
  cachedTokens: number = 0,
  thinkingTokens: number = 0,
  toolUseTokens: number = 0
): number {
  return (
    inputTokens * CREDIT_CONFIG.INPUT_WEIGHT +
    outputTokens * CREDIT_CONFIG.OUTPUT_WEIGHT +
    cachedTokens * CREDIT_CONFIG.CACHE_WEIGHT +
    thinkingTokens * CREDIT_CONFIG.THINKING_WEIGHT +
    toolUseTokens * CREDIT_CONFIG.TOOL_USE_WEIGHT
  );
}

// Calculate actual API cost in USD (cost-based system)
export async function calculateActualCost(
  inputTokens: number,
  outputTokens: number,
  cachedTokens: number = 0,
  thinkingTokens: number = 0,
  toolUseTokens: number = 0,
  searchQueryCount: number = 0
): Promise<number> {
  // Load pricing from database
  const [inputPrice, outputPrice, cachedPrice, thinkingPrice, toolUsePrice, searchPrice] = await Promise.all([
    getCreditConfig('gemini_input_price_per_1m'),
    getCreditConfig('gemini_output_price_per_1m'),
    getCreditConfig('gemini_cached_price_per_1m'),
    getCreditConfig('gemini_thinking_price_per_1m'),
    getCreditConfig('gemini_tool_use_price_per_1m'),
    getCreditConfig('gemini_search_price_per_1000'),
  ]);

  // Calculate token costs (per 1M tokens)
  const tokenCost = (
    (inputTokens * inputPrice +
     outputTokens * outputPrice +
     cachedTokens * cachedPrice +
     thinkingTokens * thinkingPrice +
     toolUseTokens * toolUsePrice) /
    1_000_000
  );

  // Calculate search costs (per 1000 queries for Gemini 3.x)
  const searchCost = (searchQueryCount / 1000) * searchPrice;

  return tokenCost + searchCost;
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

// Calculate credits from tokens with cost-based rounding
export async function calculateCreditsForTokens(
  inputTokens: number,
  outputTokens: number,
  cachedTokens: number = 0,
  thinkingTokens: number = 0,
  toolUseTokens: number = 0,
  searchQueryCount: number = 0
): Promise<number> {
  // Calculate total effective cost (not tokens!)
  const effectiveCost = await calculateActualCost(
    inputTokens,
    outputTokens,
    cachedTokens,
    thinkingTokens,
    toolUseTokens,
    searchQueryCount
  );

  // Get baseline and rounding step from database
  const costBaseline = await getCreditConfig('credit_baseline_usd');
  const roundingStep = await getCreditConfig('credit_rounding_step');

  // Raw credits = cost / baseline ($0.01 = 1 credit)
  const rawCredits = effectiveCost / costBaseline;

  // Round up to nearest rounding step (0.05 by default)
  const roundedCredits = Math.ceil(rawCredits / roundingStep) * roundingStep;

  // No minimum - return actual cost (rounded)
  return roundedCredits;
}
