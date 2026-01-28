/**
 * Company research agent implementation
 * Ported from backend/src/research_agent/subagents/company/agent.py
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { CompanyResearch, CompanyResearchSchema } from '../types';
import { SYSTEM_PROMPT, buildResearchPrompt } from './prompts/company';
import { TokenTracker } from '../token-tracker';

export class CompanyResearchAgent {
  private client: GoogleGenerativeAI;
  private modelName: string;
  private systemInstruction: string;
  private tokenTracker: typeof TokenTracker;

  constructor() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY environment variable is required');
    }

    this.client = new GoogleGenerativeAI(apiKey);
    this.modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';
    this.systemInstruction = SYSTEM_PROMPT;
    this.tokenTracker = TokenTracker;
  }

  /**
   * Research a company using Gemini with built-in grounding
   */
  async researchCompany(params: {
    domain: string;
    companyName?: string;
    userId?: string;
    meetingId?: string;
  }): Promise<CompanyResearch> {
    const { domain, companyName, userId, meetingId } = params;

    console.log(`[CompanyAgent] Researching ${domain}`);

    // Build prompt - Gemini grounding will handle web search automatically
    const prompt = buildResearchPrompt(domain, companyName);

    // Add search context hint for better grounding
    let searchHint = `\n\nPlease research information about `;
    searchHint += companyName || domain;
    searchHint += ` (domain: ${domain}). Focus on recent news, products, company overview, and key developments.`;

    const fullPrompt = `${prompt}${searchHint}\n\nProvide your research in JSON format.`;

    console.log(`[CompanyAgent] Using Gemini grounding for research`);

    try {
      // Generate content with Gemini grounding enabled
      const model = this.client.getGenerativeModel({
        model: this.modelName,
        systemInstruction: this.systemInstruction,
        tools: [{ googleSearchRetrieval: {} }], // Enable grounding
      });

      const result = await model.generateContent(fullPrompt);

      const response = result.response;

      // Track token usage
      if (userId && meetingId && response.usageMetadata) {
        try {
          const usage = response.usageMetadata;
          const cachedTokens = usage.cachedContentTokenCount || 0;
          await this.tokenTracker.trackUsage({
            userId,
            meetingId,
            agentType: 'company',
            modelName: this.modelName,
            inputTokens: usage.promptTokenCount || 0,
            outputTokens: usage.candidatesTokenCount || 0,
            cachedTokens,
          });
        } catch (error) {
          console.warn('[CompanyAgent] Failed to track token usage:', error);
        }
      }

      // Parse and return
      const text = response.text();
      return this.parseResponse(text, domain, companyName);
    } catch (error) {
      console.error(`[CompanyAgent] Error researching ${domain}:`, error);
      throw error;
    }
  }

  /**
   * Parse model response into CompanyResearch object
   */
  private parseResponse(
    responseText: string,
    domain: string,
    companyName?: string
  ): CompanyResearch {
    try {
      // Find JSON in response
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}') + 1;

      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonStr = responseText.substring(jsonStart, jsonEnd);
        const data = JSON.parse(jsonStr);

        // Validate with Zod
        return CompanyResearchSchema.parse(data);
      }
    } catch (error) {
      console.error('[CompanyAgent] JSON parse failed:', error);
    }

    // Fallback
    return {
      name: companyName || domain,
      domain,
      overview: responseText.substring(0, 500) || null,
      size: null,
      industry: null,
      recent_news: [],
      funding: null,
      products: [],
    };
  }
}
