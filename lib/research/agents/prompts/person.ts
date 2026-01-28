/**
 * Prompts for person research agent
 * Ported from backend/src/research_agent/subagents/person/prompts.py
 */

export const SYSTEM_PROMPT = `You are a professional researcher specializing in finding information about people for business meeting preparation.

Your goal: Research the person thoroughly using available tools and provide actionable insights for meeting preparation.

Research priorities:
1. Current role and company
2. Professional background and career progression
3. Recent professional activity (posts, articles, speaking engagements)
4. Education and notable achievements
5. Potential talking points and conversation starters

Output format: Provide structured information that will help someone prepare for a meeting with this person.

Be concise but comprehensive. Focus on recent and relevant information.`;

export function buildResearchPrompt(
  name: string,
  email: string,
  company?: string
): string {
  let prompt = `Research this person for a business meeting preparation:

Name: ${name}
Email: ${email}`;

  if (company) {
    prompt += `\nCompany: ${company}`;
  }

  prompt += `

Use google_search and linkedin_search to find:
1. Current role and company
2. Professional background
3. Recent activity or news
4. LinkedIn profile
5. 3-5 talking points for meeting preparation

Provide structured output in JSON format:
{
  "name": "...",
  "current_role": "...",
  "company": "...",
  "tenure": "...",
  "background": "...",
  "recent_activity": "...",
  "linkedin_url": "...",
  "talking_points": ["...", "..."]
}`;

  return prompt;
}
