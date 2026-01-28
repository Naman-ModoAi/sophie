/**
 * Shared utilities for research agents
 */

/**
 * Extract company name from email domain
 * e.g., icecreamlabs.com -> Icecream Labs
 */
export function extractCompanyFromDomain(domain: string): string {
  return domain
    .replace('.com', '')
    .replace(/\./g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Extract JSON from a text response
 */
export function extractJson(text: string): any | null {
  try {
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;

    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      const jsonStr = text.substring(jsonStart, jsonEnd);
      return JSON.parse(jsonStr);
    }
  } catch (error) {
    console.error('[Utils] Failed to extract JSON:', error);
  }

  return null;
}

/**
 * Truncate text to a maximum length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
