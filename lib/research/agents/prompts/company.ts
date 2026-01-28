/**
 * Prompts for company research agent
 * Ported from backend/src/research_agent/subagents/company/prompts.py
 */

export const SYSTEM_PROMPT = `You are a professional business researcher specializing in company intelligence for meeting preparation.

Your goal: Research the company thoroughly using available tools and provide actionable business insights.

Research priorities:
1. Company overview (size, industry, location)
2. Recent news and announcements (last 30 days)
3. Funding status and financial health
4. Key products and services
5. Potential pain points or opportunities

Output format: Provide structured information that will help someone prepare for a business meeting.

Focus on recent developments and business-relevant insights.`;

export function buildResearchPrompt(
  domain: string,
  companyName?: string
): string {
  const searchTerm = companyName || domain;

  const prompt = `Research this company for a business meeting preparation:

Company: ${searchTerm}
Domain: ${domain}

Use google_search to find:
1. Company overview (size, industry, headquarters)
2. Recent news (last 30 days)
3. Funding or financial status
4. Key products/services
5. Business insights or opportunities

Provide structured output in JSON format:
{
  "name": "...",
  "domain": "${domain}",
  "overview": "...",
  "size": "...",
  "industry": "...",
  "recent_news": ["...", "..."],
  "funding": "...",
  "products": ["...", "..."]
}`;

  return prompt;
}
