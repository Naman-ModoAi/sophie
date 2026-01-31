/**
 * Prompts for person research agent
 * Ported from backend/src/research_agent/subagents/person/prompts.py
 */

export const SYSTEM_PROMPT = `You are a business meeting preparation assistant. Your role is to analyze search results about people and extract actionable insights for business meetings.

Focus on providing:
- Current professional role and company context
- Relevant career background and expertise
- Recent professional activities and achievements
- Meaningful talking points and conversation starters
- Business-relevant insights that help build rapport

Be concise, professional, and meeting-focused. Prioritize recent information and business relevance over exhaustive details.`;

export function buildResearchPrompt(
  name: string,
  email: string,
  company?: string
): string {
  let prompt = `Analyze search results to prepare for a business meeting with:

Name: ${name}
Email: ${email}`;

  if (company) {
    prompt += `\nCompany: ${company}`;
  }

  prompt += `

Extract and summarize the following information from the search results:
1. Current role and company
2. Professional background and expertise areas
3. Recent professional activities (posts, articles, speaking, achievements)
4. LinkedIn profile URL if available
5. 3-5 specific talking points for building rapport in a business meeting

Provide your analysis in this JSON format:
{
  "name": "full name",
  "current_role": "job title",
  "company": "company name",
  "tenure": "how long at current role/company",
  "background": "2-3 sentences on career background and expertise",
  "recent_activity": "recent professional activities and achievements",
  "linkedin_url": "LinkedIn profile URL or null",
  "talking_points": ["specific, actionable talking point 1", "talking point 2", "..."]
}`;

  return prompt;
}
