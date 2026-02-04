/**
 * Person research agent implementation
 * Ported from backend/src/research_agent/subagents/person/agent.py
 */

import { GoogleGenAI } from '@google/genai';
import { PersonResearch, PersonResearchSchema } from '../types';
import { SYSTEM_PROMPT, buildResearchPrompt } from './prompts/person';
import { TokenTracker } from '../token-tracker';

export class PersonResearchAgent {
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
   * Research a person using Gemini with Google Search grounding
   */
  async researchPerson(params: {
    name: string;
    email: string;
    company?: string;
    userId?: string;
    meetingId?: string;
  }): Promise<PersonResearch> {
    const { name, email, company, userId, meetingId } = params;

    console.log(`[PersonAgent] Researching ${name}`);

    // Extract company from email domain if not provided
    let companyFromEmail = company;
    const domain = email && email.includes('@') ? email.split('@')[1] : '';
    if (!companyFromEmail && domain) {
      // Extract company name from domain (e.g., icecreamlabs.com -> Icecream Labs)
      companyFromEmail = domain
        .replace('.com', '')
        .replace(/\./g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    // Step 1: Build search query
    const searchParts = [name];
    if (companyFromEmail) {
      searchParts.push(companyFromEmail);
    }
    if (domain) {
      searchParts.push(domain);
    }
    const searchQuery = searchParts.filter(Boolean).join(' ');

    console.log(`[PersonAgent] Search query: "${searchQuery}"`);

    // Step 2: Build full prompt: "Do the research about, {searchQuery} {prompt}"
    const promptTemplate = buildResearchPrompt();
    const fullPrompt = `Do the research about, ${searchQuery} professional profile background, recent activity. ${promptTemplate}`;

    console.log(`[PersonAgent] Using Gemini with Google Search grounding`);

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

          // Detect if grounding was used (for Gemini 2.x per-prompt billing)
          const groundedPromptCount = response.candidates?.[0]?.groundingMetadata ? 1 : 0;

          await this.tokenTracker.trackUsage({
            userId,
            meetingId,
            agentType: 'person',
            modelName: this.modelName,
            inputTokens: usage.promptTokenCount || 0,
            outputTokens: usage.candidatesTokenCount || 0,
            cachedTokens,
            thoughtsTokens,
            toolUsePromptTokens,
            webSearchQueries,
            groundedPromptCount,
          });
        } catch (error) {
          console.warn('[PersonAgent] Failed to track token usage:', error);
        }
      }

      // Get markdown content
      const markdownContent = response.text || '';
      if (!markdownContent) {
        throw new Error('No response text from Gemini');
      }

      return {
        name,
        email,
        markdown_content: markdownContent.trim(),
      };
    } catch (error) {
      console.error(`[PersonAgent] Error researching ${name}:`, error);
      // Return fallback markdown
      return {
        name,
        email,
        markdown_content: `# ${name}\n\n**Error:** Research failed - ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}
