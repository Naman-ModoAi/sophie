/**
 * Person research agent implementation
 * Ported from backend/src/research_agent/subagents/person/agent.py
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { PersonResearch, PersonResearchSchema } from '../types';
import { SYSTEM_PROMPT, buildResearchPrompt } from './prompts/person';
import { TokenTracker } from '../token-tracker';
import { webSearch, formatSearchResults } from '../serper';

export class PersonResearchAgent {
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
   * Research a person using Serper API for web search + Gemini for analysis
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

    // Step 1: Build search query with broader focus
    const searchParts = [name];
    if (companyFromEmail) {
      searchParts.push(companyFromEmail);
    }
    if (domain) {
      searchParts.push(`(${domain})`);
    }
    searchParts.push('professional profile background recent activity');

    const searchQuery = searchParts.filter(Boolean).join(' ');

    console.log(`[PersonAgent] Search query: "${searchQuery}"`);

    // Step 2: Perform web search via Serper
    const searchResults = await webSearch({
      query: searchQuery,
      numResults: 5,
      userId,
      meetingId,
    });

    // Step 3: Format search results for context
    const searchContext = formatSearchResults(searchResults);

    // Step 4: Build prompt with search context
    const prompt = buildResearchPrompt(name, email, companyFromEmail);
    const fullPrompt = [
      prompt,
      '\n## Web Search Results:\n',
      searchContext,
      '\n\nBased on the above information, provide your research in JSON format.',
    ].join('');

    console.log(`[PersonAgent] Using Serper search + Gemini analysis`);

    try {
      // Step 5: Generate content with Gemini (NO grounding - we already have search results)
      const model = this.client.getGenerativeModel({
        model: this.modelName,
        systemInstruction: this.systemInstruction,
        // No tools config - grounding removed, using Serper instead
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
            agentType: 'person',
            modelName: this.modelName,
            inputTokens: usage.promptTokenCount || 0,
            outputTokens: usage.candidatesTokenCount || 0,
            cachedTokens,
          });
        } catch (error) {
          console.warn('[PersonAgent] Failed to track token usage:', error);
        }
      }

      // Parse and return
      const text = response.text();
      return this.parseResponse(text, name, companyFromEmail);
    } catch (error) {
      console.error(`[PersonAgent] Error researching ${name}:`, error);
      throw error;
    }
  }

  /**
   * Parse model response into PersonResearch object
   */
  private parseResponse(
    responseText: string,
    name: string,
    company?: string
  ): PersonResearch {
    try {
      // Find JSON in response
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}') + 1;

      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonStr = responseText.substring(jsonStart, jsonEnd);
        const data = JSON.parse(jsonStr);

        // Validate with Zod
        return PersonResearchSchema.parse(data);
      }
    } catch (error) {
      console.error('[PersonAgent] JSON parse failed:', error);
    }

    // Fallback
    return {
      name,
      company: company || null,
      current_role: null,
      tenure: null,
      background: responseText.substring(0, 500) || null,
      recent_activity: null,
      linkedin_url: null,
      talking_points: [],
    };
  }
}
