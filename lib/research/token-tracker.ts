/**
 * Token and API usage tracking for Gemini
 * Ported from backend/src/shared/token_tracker.py
 */

import { createServiceClient } from '@/lib/supabase/server';
import {
  calculateCreditsForTokens,
  calculateEffectiveTokens,
  calculateActualCost
} from './credit-config';

export class TokenTracker {
  /**
   * Track token usage for a Gemini API call and consume credits
   */
  static async trackUsage(params: {
    userId: string;
    meetingId: string;
    agentType: 'person' | 'company' | 'orchestrator';
    modelName: string;
    inputTokens: number;
    outputTokens: number;
    cachedTokens?: number;
    thoughtsTokens?: number;
    toolUsePromptTokens?: number;
    webSearchQueries?: string[];
  }): Promise<string | null> {
    const {
      userId,
      meetingId,
      agentType,
      modelName,
      inputTokens,
      outputTokens,
      cachedTokens = 0,
      thoughtsTokens = 0,
      toolUsePromptTokens = 0,
      webSearchQueries = [],
    } = params;

    try {
      const supabase = await createServiceClient();

      // Track token usage
      const { data: tokenUsageId, error } = await supabase.rpc('track_token_usage', {
        p_user_id: userId,
        p_meeting_id: meetingId,
        p_agent_type: agentType,
        p_model_name: modelName,
        p_input_tokens: inputTokens,
        p_output_tokens: outputTokens,
        p_cached_tokens: cachedTokens,
        p_thoughts_tokens: thoughtsTokens,
        p_tool_use_prompt_tokens: toolUsePromptTokens,
        p_web_search_queries: webSearchQueries.length > 0 ? webSearchQueries : null,
      });

      if (error) {
        console.error('[TokenTracker] Error tracking usage:', error);
        return null;
      }

      if (tokenUsageId) {
        const total = inputTokens + outputTokens + thoughtsTokens + toolUsePromptTokens;
        const cacheInfo = cachedTokens > 0 ? ` (cached: ${cachedTokens})` : '';
        const thoughtsInfo = thoughtsTokens > 0 ? ` (thoughts: ${thoughtsTokens})` : '';
        const toolUseInfo = toolUsePromptTokens > 0 ? ` (tool-use: ${toolUsePromptTokens})` : '';
        const searchInfo = webSearchQueries.length > 0 ? ` (searches: ${webSearchQueries.length})` : '';
        console.log(
          `[TokenTracker] Tracked ${total} tokens${cacheInfo}${thoughtsInfo}${toolUseInfo}${searchInfo} for user ${userId}, ` +
          `meeting ${meetingId}, agent ${agentType}`
        );

        // Consume credits only for person research (company research is included in person cost)
        if (agentType === 'person') {
          // Calculate search query count from grounding metadata
          const searchQueryCount = webSearchQueries.length;

          const creditCost = await calculateCreditsForTokens(
            inputTokens,
            outputTokens,
            cachedTokens,
            thoughtsTokens,
            toolUsePromptTokens,
            searchQueryCount
          );

          const effectiveTokens = calculateEffectiveTokens(
            inputTokens,
            outputTokens,
            cachedTokens,
            thoughtsTokens,
            toolUsePromptTokens
          );
          const actualCost = await calculateActualCost(
            inputTokens,
            outputTokens,
            cachedTokens,
            thoughtsTokens,
            toolUsePromptTokens,
            searchQueryCount
          );

          console.log(
            `[TokenTracker] Credit calculation: ` +
            `input=${inputTokens}, output=${outputTokens}, cached=${cachedTokens}, ` +
            `thinking=${thoughtsTokens}, tool_use=${toolUsePromptTokens}, ` +
            `searches=${searchQueryCount}, ` +
            `effective_tokens=${effectiveTokens.toFixed(2)}, ` +
            `credits=${creditCost.toFixed(2)}, ` +
            `actual_cost=$${actualCost.toFixed(6)}`
          );

          console.log(`[TokenTracker] Attempting to consume ${creditCost} credit(s) for person research...`);

          const { data: consumeSuccess, error: consumeError } = await supabase.rpc('consume_credits', {
            p_user_id: userId,
            p_credits: creditCost,
            p_meeting_id: meetingId,
            p_research_type: agentType,
          });

          if (consumeError) {
            console.error('[TokenTracker] Error consuming credits:', {
              error: consumeError,
              code: consumeError.code,
              message: consumeError.message,
              details: consumeError.details
            });
          } else if (consumeSuccess) {
            console.log(`[TokenTracker] ✅ Successfully consumed ${creditCost} credit for person research`);

            // Update the token_usage record with credits consumed and cost data
            const { error: updateError } = await supabase
              .from('token_usage')
              .update({
                credits_consumed: creditCost,
                effective_tokens: effectiveTokens,
                actual_cost_usd: actualCost
              })
              .eq('id', tokenUsageId);

            if (updateError) {
              console.error('[TokenTracker] Error updating token_usage with credits:', updateError);
            } else {
              console.log(`[TokenTracker] ✅ Updated token_usage record with credits_consumed`);
            }
          } else {
            console.warn('[TokenTracker] ⚠️ Failed to consume credits - function returned false (insufficient balance?)');
          }
        } else {
          console.log(`[TokenTracker] Skipping credit consumption for ${agentType} agent (only person agents consume credits)`);
        }

        return tokenUsageId;
      }

      console.warn('[TokenTracker] Token tracking returned no data');
      return null;
    } catch (error) {
      console.error('[TokenTracker] Failed to track token usage:', error);
      return null;
    }
  }


  /**
   * Track external API usage (Resend, etc.)
   * Note: Serper API tracking removed - now using Gemini grounding instead
   */
  static async trackApiUsage(params: {
    userId: string;
    meetingId: string;
    apiName: 'resend' | 'other';
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
