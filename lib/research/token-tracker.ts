/**
 * Token and API usage tracking for Gemini
 * Ported from backend/src/shared/token_tracker.py
 */

import { createServiceClient } from '@/lib/supabase/server';

export class TokenTracker {
  /**
   * Track token usage for a Gemini API call
   */
  static async trackUsage(params: {
    userId: string;
    meetingId: string;
    agentType: 'person' | 'company' | 'orchestrator';
    modelName: string;
    inputTokens: number;
    outputTokens: number;
    cachedTokens?: number;
  }): Promise<string | null> {
    const {
      userId,
      meetingId,
      agentType,
      modelName,
      inputTokens,
      outputTokens,
      cachedTokens = 0,
    } = params;

    try {
      const supabase = await createServiceClient();

      const { data, error } = await supabase.rpc('track_token_usage', {
        p_user_id: userId,
        p_meeting_id: meetingId,
        p_agent_type: agentType,
        p_model_name: modelName,
        p_input_tokens: inputTokens,
        p_output_tokens: outputTokens,
        p_cached_tokens: cachedTokens,
      });

      if (error) {
        console.error('[TokenTracker] Error tracking usage:', error);
        return null;
      }

      if (data) {
        const total = inputTokens + outputTokens;
        const cacheInfo = cachedTokens > 0 ? ` (cached: ${cachedTokens})` : '';
        console.log(
          `[TokenTracker] Tracked ${total} tokens${cacheInfo} for user ${userId}, ` +
          `meeting ${meetingId}, agent ${agentType}`
        );
        return data;
      }

      console.warn('[TokenTracker] Token tracking returned no data');
      return null;
    } catch (error) {
      console.error('[TokenTracker] Failed to track token usage:', error);
      return null;
    }
  }

  /**
   * Get token usage summary for a user
   */
  static async getUserTokenUsage(userId: string): Promise<{
    tokensUsedThisMonth: number;
    totalTokensUsed: number;
  }> {
    try {
      const supabase = await createServiceClient();

      const { data, error } = await supabase
        .from('users')
        .select('tokens_used_this_month, total_tokens_used')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return { tokensUsedThisMonth: 0, totalTokensUsed: 0 };
      }

      return {
        tokensUsedThisMonth: data.tokens_used_this_month || 0,
        totalTokensUsed: data.total_tokens_used || 0,
      };
    } catch (error) {
      console.error('[TokenTracker] Failed to get user token usage:', error);
      return { tokensUsedThisMonth: 0, totalTokensUsed: 0 };
    }
  }

  /**
   * Track external API usage (Serper, Resend, etc.)
   */
  static async trackApiUsage(params: {
    userId: string;
    meetingId: string;
    apiName: 'serper' | 'resend' | 'other';
    operationType: string;
    requestCount?: number;
    metadata?: Record<string, any>;
  }): Promise<string | null> {
    const {
      userId,
      meetingId,
      apiName,
      operationType,
      requestCount = 1,
      metadata,
    } = params;

    try {
      const supabase = await createServiceClient();

      const { data, error } = await supabase.rpc('track_api_usage', {
        p_user_id: userId,
        p_meeting_id: meetingId,
        p_api_name: apiName,
        p_operation_type: operationType,
        p_request_count: requestCount,
        p_metadata: metadata || null,
      });

      if (error) {
        console.error('[TokenTracker] Error tracking API usage:', error);
        return null;
      }

      if (data) {
        console.log(
          `[TokenTracker] Tracked ${apiName} API usage for user ${userId}, ` +
          `meeting ${meetingId}, operation ${operationType}`
        );
        return data;
      }

      console.warn('[TokenTracker] API usage tracking returned no data');
      return null;
    } catch (error) {
      console.error('[TokenTracker] Failed to track API usage:', error);
      return null;
    }
  }
}
