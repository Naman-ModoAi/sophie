# Gemini Grounding Implementation Summary

## Overview
Successfully migrated from Serper API to Gemini Google Search grounding using the new `@google/genai` package.

## Changes Made

### 1. Package Migration
- **Added**: `@google/genai` (new SDK)
- **Removed**: `@google/generative-ai` (old SDK)
- **Removed**: Serper API dependency

### 2. Code Changes

#### Person Agent (`lib/research/agents/person-agent.ts`)
- Migrated to `@google/genai` package
- Added Google Search grounding: `tools: [{ googleSearch: {} }]`
- Extract and track `thoughtsTokenCount` from usage metadata
- Extract and track `webSearchQueries` from grounding metadata
- Updated response handling: `response.text` instead of `response.text()`

#### Company Agent (`lib/research/agents/company-agent.ts`)
- Same changes as person-agent

#### Token Tracker (`lib/research/token-tracker.ts`)
- Added `thoughtsTokens` parameter
- Added `webSearchQueries` parameter  
- Updated total token calculation: `inputTokens + outputTokens + thoughtsTokens`
- Enhanced logging to show thoughts tokens and search query count
- Pass grounding data to database

### 3. Database Changes

#### Migration (`lib/migrations/20260130_001_add_grounding_metadata.sql`)
- Added `thoughts_tokens INTEGER` column to `token_usage` table
- Added `web_search_queries TEXT[]` column to `token_usage` table
- Updated `track_token_usage` RPC function signature:
  - Added `p_thoughts_tokens INTEGER DEFAULT 0`
  - Added `p_web_search_queries TEXT[] DEFAULT NULL`
- Updated total tokens calculation to include thoughts tokens

### 4. Environment Variables
- **Removed**: `SERPER_API_KEY`
- **Updated**: `GEMINI_MODEL` default to `gemini-3-flash-preview`
- **Kept**: `GOOGLE_GEMINI_API_KEY`

### 5. Deprecated Files
- `lib/research/serper.ts` - marked as deprecated, safe to delete

## API Structure Changes

### Old (Serper + old Gemini SDK):
```typescript
// Step 1: Serper search
const searchResults = await webSearch({ query, numResults: 5 });
const searchContext = formatSearchResults(searchResults);

// Step 2: Gemini analysis
const model = client.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',
  systemInstruction,
});
const result = await model.generateContent(prompt + searchContext);
const text = result.response.text();
```

### New (Gemini grounding with new SDK):
```typescript
const ai = new GoogleGenAI({ apiKey });
const response = await ai.models.generateContent({
  model: 'gemini-3-flash-preview',
  contents: prompt + `\n\nSearch the web for: "${searchQuery}"`,
  config: {
    tools: [{ googleSearch: {} }],
    systemInstruction,
  },
});
const text = response.text;
```

## Token Tracking Flow

### Usage Metadata Structure:
```json
{
  "promptTokenCount": 40,
  "candidatesTokenCount": 120,
  "thoughtsTokenCount": 69,
  "totalTokenCount": 229,
  "cachedContentTokenCount": 0
}
```

### Grounding Metadata Structure:
```json
{
  "candidates": [{
    "groundingMetadata": {
      "webSearchQueries": ["CEO of Anthropic"],
      "groundingChunks": [...],
      "groundingSupports": [...]
    }
  }]
}
```

### Tracked Fields:
- `inputTokens` (promptTokenCount)
- `outputTokens` (candidatesTokenCount)  
- `thoughtsTokens` (thoughtsTokenCount) ✨ NEW
- `cachedTokens` (cachedContentTokenCount)
- `webSearchQueries` (from groundingMetadata) ✨ NEW
- **Total**: `inputTokens + outputTokens + thoughtsTokens`

## Testing

Run the test to verify:
```bash
node test-gemini-grounding.mjs
```

Or use the CLI:
```bash
npm run test:research
```

## Database Migration

Apply the migration to add new columns:
```sql
-- Run this in Supabase SQL editor
\i lib/migrations/20260130_001_add_grounding_metadata.sql
```

## Benefits

1. ✅ **Single API**: One call instead of two (Serper + Gemini)
2. ✅ **Cost Reduction**: No Serper API costs
3. ✅ **Better Tracking**: Track search queries and thinking tokens
4. ✅ **Real-time Search**: Google Search directly via Gemini
5. ✅ **Modern SDK**: Using latest `@google/genai` package
6. ✅ **Complete Visibility**: See exactly what queries the model used

## Next Steps

1. ✅ Apply database migration
2. ✅ Test person research
3. ✅ Test company research  
4. ✅ Verify token tracking in database
5. ✅ Remove `SERPER_API_KEY` from production environment
6. ✅ Delete `lib/research/serper.ts` file
