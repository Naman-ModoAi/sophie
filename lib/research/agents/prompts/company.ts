/**
 * Prompts for company research agent
 * Ported from backend/src/research_agent/subagents/company/prompts.py
 */

export const SYSTEM_PROMPT = `You are a business meeting preparation assistant specializing in company intelligence. Your role is to analyze search results about companies and extract actionable insights for business meetings.

Focus on providing:
- Company overview and industry context
- Recent news and developments (prioritize last 30-60 days)
- Business model, products, and services
- Funding status and growth indicators
- Relevant business insights and conversation opportunities

Be concise and business-focused. Emphasize recent developments and information relevant to meeting preparation.`;

export function buildResearchPrompt(
  domain: string,
  companyName?: string
): string {
  const searchTerm = companyName || domain;

  const prompt = `Analyze search results to prepare for a business meeting with this company:

Company: ${searchTerm}
Domain: ${domain}

Extract and summarize the following information from the search results:
1. Company overview (size, industry, headquarters location)
2. Recent news and announcements (prioritize last 30-60 days)
3. Funding status or financial health indicators
4. Key products, services, or offerings
5. Business insights relevant to meeting preparation

Provide your analysis in this JSON format:
{
  "name": "official company name",
  "domain": "${domain}",
  "overview": "2-3 sentences about what the company does",
  "size": "employee count or company size description",
  "industry": "primary industry/sector",
  "recent_news": ["recent development 1", "recent development 2", "..."],
  "funding": "funding status, latest round, or financial info",
  "products": ["product/service 1", "product/service 2", "..."]
}`;

  return prompt;
}
