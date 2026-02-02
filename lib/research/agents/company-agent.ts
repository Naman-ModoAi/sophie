/**
 * Company research agent implementation
 * Ported from backend/src/research_agent/subagents/company/agent.py
 */

import { GoogleGenAI } from '@google/genai';
import { CompanyResearch, CompanyResearchSchema } from '../types';
import { SYSTEM_PROMPT, buildResearchPrompt } from './prompts/company';
import { TokenTracker } from '../token-tracker';

export class CompanyResearchAgent {
  private client: GoogleGenAI;
  private modelName: string;
  private systemInstruction: string;
  private tokenTracker: typeof TokenTracker;

  constructor() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY environment variable is required');
    }

    this.client = new GoogleGenAI({ apiKey });
    this.modelName = process.env.GEMINI_MODEL || 'gemini-3-flash-preview'; // Use grounding-compatible model
    this.systemInstruction = SYSTEM_PROMPT;
    this.tokenTracker = TokenTracker;
  }

  /**
   * Research a company using Gemini with Google Search grounding
   */
  async researchCompany(params: {
    domain: string;
    companyName?: string;
    userId?: string;
    meetingId?: string;
  }): Promise<CompanyResearch> {
    const { domain, companyName, userId, meetingId } = params;

    console.log(`[CompanyAgent] Researching ${domain}`);

    // Step 1: Build comprehensive search query
    const searchParts = [companyName || domain];
    if (domain && companyName) {
      searchParts.push(`(${domain})`);
    }
    searchParts.push('company overview products services news funding');

    const searchQuery = searchParts.filter(Boolean).join(' ');

    console.log(`[CompanyAgent] Search query: "${searchQuery}"`);

    // Step 2: Build full prompt
    const promptTemplate = buildResearchPrompt();
    const fullPrompt = `Do the research about, ${searchQuery} ${promptTemplate}`;

    console.log(`[CompanyAgent] Using Gemini with Google Search grounding`);

    try {
      // Step 3: Generate content with Gemini using Google Search grounding
      const groundingTool = {
        googleSearch: {},
      };

      const config = {
        tools: [groundingTool],
        systemInstruction: this.systemInstruction,
      };

      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: fullPrompt,
        config,
      });

      // Track token usage
      if (userId && meetingId && response.usageMetadata) {
        try {
          const usage = response.usageMetadata;
          const cachedTokens = usage.cachedContentTokenCount || 0;
          const thoughtsTokens = usage.thoughtsTokenCount || 0;
          const toolUsePromptTokens = usage.toolUsePromptTokenCount || 0;

          // Extract web search queries from grounding metadata
          const webSearchQueries: string[] = [];
          if (response.candidates?.[0]?.groundingMetadata?.webSearchQueries) {
            webSearchQueries.push(...response.candidates[0].groundingMetadata.webSearchQueries);
          }

          await this.tokenTracker.trackUsage({
            userId,
            meetingId,
            agentType: 'company',
            modelName: this.modelName,
            inputTokens: usage.promptTokenCount || 0,
            outputTokens: usage.candidatesTokenCount || 0,
            cachedTokens,
            thoughtsTokens,
            toolUsePromptTokens,
            webSearchQueries,
          });
        } catch (error) {
          console.warn('[CompanyAgent] Failed to track token usage:', error);
        }
      }

      // Get markdown content
      const markdownContent = response.text || '';
      if (!markdownContent) {
        throw new Error('No response text from Gemini');
      }

      return {
        name: companyName || domain,
        domain,
        markdown_content: markdownContent.trim(),
      };
    } catch (error) {
      console.error(`[CompanyAgent] Error researching ${domain}:`, error);
      // Return fallback markdown
      return {
        name: companyName || domain,
        domain,
        markdown_content: `# ${companyName || domain}\n\n**Error:** Research failed - ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}
