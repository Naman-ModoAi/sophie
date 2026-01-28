/**
 * Person research agent implementation
 * Ported from backend/src/research_agent/subagents/person/agent.py
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { PersonResearch, PersonResearchSchema } from '../types';
import { SYSTEM_PROMPT, buildResearchPrompt } from './prompts/person';
import { TokenTracker } from '../token-tracker';

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
   * Research a person using Gemini with built-in grounding
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
    if (!companyFromEmail && email && email.includes('@')) {
      const domain = email.split('@')[1];
      // Extract company name from domain (e.g., icecreamlabs.com -> Icecream Labs)
      companyFromEmail = domain
        .replace('.com', '')
        .replace(/\./g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    // Build prompt - Gemini grounding will handle web search automatically
    const prompt = buildResearchPrompt(name, email, companyFromEmail);

    // Add search context hint for better grounding
    let searchContext = `\n\nPlease research information about ${name}`;
    if (companyFromEmail) {
      searchContext += ` who works at ${companyFromEmail}`;
    }
    if (email && email.includes('@')) {
      searchContext += ` (email domain: ${email.split('@')[1]})`;
    }
    searchContext += '. Focus on their LinkedIn profile, professional background, and recent activities.';

    const fullPrompt = `${prompt}${searchContext}\n\nProvide your research in JSON format.`;

    console.log(`[PersonAgent] Using Gemini grounding for research`);

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
