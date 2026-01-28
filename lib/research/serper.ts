/**
 * Serper API integration for web search
 * Replaces Gemini grounding with explicit Serper API calls
 * Ported from backend/src/research_agent/web_search.py
 */

import { TokenTracker } from './token-tracker';

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

/**
 * Perform web search using Serper API
 *
 * @param params Search parameters
 * @returns Array of search results
 */
export async function webSearch(params: {
  query: string;
  numResults?: number;
  userId?: string;
  meetingId?: string;
}): Promise<SearchResult[]> {
  const { query, numResults = 5, userId, meetingId } = params;

  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    console.error('[Serper] SERPER_API_KEY environment variable is not set');
    return [];
  }

  console.log(`[Serper] Searching: "${query}" (max ${numResults} results)`);

  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        num: numResults,
      }),
    });

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Extract organic results
    const results: SearchResult[] = (data.organic || [])
      .slice(0, numResults)
      .map((item: any) => ({
        title: item.title || '',
        link: item.link || '',
        snippet: item.snippet || '',
      }));

    console.log(`[Serper] Found ${results.length} results`);

    // Track API usage
    if (userId && meetingId) {
      try {
        await TokenTracker.trackApiUsage({
          userId,
          meetingId,
          apiName: 'serper',
          operationType: 'search',
          requestCount: 1,
          metadata: {
            query,
            numResults,
            resultsCount: results.length,
          },
        });
      } catch (error) {
        console.warn('[Serper] Failed to track API usage:', error);
      }
    }

    return results;
  } catch (error) {
    console.error('[Serper] Search error:', error);
    return [];
  }
}

/**
 * Format search results into a readable context string
 *
 * @param results Search results to format
 * @returns Formatted string for LLM context
 */
export function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'No search results found.';
  }

  return results
    .map((result, index) => {
      return [
        `### Result ${index + 1}: ${result.title}`,
        result.snippet,
        `Source: ${result.link}`,
      ].join('\n');
    })
    .join('\n\n');
}
