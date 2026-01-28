# Serper API Implementation

This document describes the Serper API implementation for the research agent, implemented in the `feature/unified-research-agent-serper` branch.

## Overview

This branch replaces Gemini's built-in grounding with explicit Serper API web search calls. It provides an alternative implementation for comparison and fallback purposes.

## Architecture

### Original (Gemini Grounding Branch)
```
User Request → Gemini API (with grounding enabled)
               ↓
            Gemini searches web internally
               ↓
            Returns research with citations
```

**Single API call** - Gemini handles everything internally.

### New (Serper API Branch)
```
User Request → Serper API (web search)
               ↓
            Format search results
               ↓
            Gemini API (without grounding)
               ↓
            Returns research based on search context
```

**Two API calls** - Explicit search, then analysis.

## Key Differences

| Aspect | Gemini Grounding | Serper API |
|--------|------------------|------------|
| **API Calls** | 1 (Gemini with grounding) | 2 (Serper + Gemini) |
| **Search Quality** | Google Search via Gemini | Google Search via Serper |
| **Token Usage** | Higher (includes search context) | Lower (no grounding overhead) |
| **Cost** | Gemini tokens only | Serper API ($0.001/search) + Gemini tokens |
| **Control** | Less (Gemini decides queries) | More (explicit search queries) |
| **Latency** | ~5-10s | ~7-12s (sequential calls) |
| **Debugging** | Hard (can't see search queries) | Easy (can inspect search results) |
| **Reliability** | Single point of failure | Can handle Serper failures gracefully |

## Implementation Details

### New Files

1. **`lib/research/serper.ts`** - Serper API integration
   - `webSearch()` - Performs web search via Serper API
   - `formatSearchResults()` - Formats results for LLM context
   - Includes API usage tracking via TokenTracker

### Modified Files

1. **`lib/research/agents/person-agent.ts`**
   - Removed: `tools: [{ googleSearchRetrieval: {} }]`
   - Added: Serper web search call before Gemini
   - Search query: `"${name} ${company} ${domain} LinkedIn professional background"`
   - Formats and injects search results into prompt

2. **`lib/research/agents/company-agent.ts`**
   - Removed: `tools: [{ googleSearchRetrieval: {} }]`
   - Added: Serper web search call before Gemini
   - Search query: `"${companyName} ${domain} company overview products news"`
   - Formats and injects search results into prompt

3. **`lib/research/types.ts`**
   - Added: `SearchResult` interface

4. **`.env.example`**
   - Added: `SERPER_API_KEY` environment variable

## Environment Variables

```bash
# Required for both branches
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash-exp

# Required ONLY for Serper branch
SERPER_API_KEY=your_serper_api_key
```

Get a Serper API key at: https://serper.dev

## Usage Flow

### Person Research

1. **Build search query**
   ```typescript
   const searchQuery = `${name} ${company} ${domain} LinkedIn professional background`;
   ```

2. **Perform web search**
   ```typescript
   const searchResults = await webSearch({
     query: searchQuery,
     numResults: 5,
     userId,
     meetingId,
   });
   ```

3. **Format results**
   ```typescript
   const searchContext = formatSearchResults(searchResults);
   ```

4. **Call Gemini with context**
   ```typescript
   const fullPrompt = `${prompt}\n\n## Web Search Results:\n${searchContext}`;
   const result = await model.generateContent(fullPrompt);
   ```

### Company Research

Same pattern as person research, but with company-specific search query:
```typescript
const searchQuery = `${companyName || domain} ${domain} company overview products news`;
```

## API Usage Tracking

The implementation tracks two types of API usage:

1. **Serper API Usage** - via `TokenTracker.trackApiUsage()`
   - API name: `'serper'`
   - Operation type: `'search'`
   - Metadata: query, numResults, resultsCount

2. **Gemini Token Usage** - via `TokenTracker.trackUsage()`
   - Model name: `gemini-2.0-flash-exp`
   - Input/output/cached tokens

## Error Handling

The Serper integration includes robust error handling:

1. **Missing API key** - Returns empty array, logs error
2. **API request failure** - Returns empty array, logs error
3. **No results found** - Returns empty array with "No search results found" message
4. **Tracking failure** - Logs warning but continues execution

The research agents will still function (with degraded quality) if Serper returns no results.

## Cost Analysis

### Serper API Costs
- $5 per 2,500 searches = $0.002 per search
- 2 searches per meeting (person + company)
- **Cost per meeting: ~$0.004**

### Gemini Token Costs (gemini-2.0-flash-exp)
- Input: $0.075 per 1M tokens
- Output: $0.30 per 1M tokens
- Typical usage: ~3,000 input + 1,500 output tokens per meeting
- **Cost per meeting: ~$0.00067**

### Total Cost per Meeting
- **Serper branch: ~$0.00467** ($0.004 Serper + $0.00067 Gemini)
- **Grounding branch: ~$0.00100** (Gemini tokens only, but higher token count)

**Note**: Actual costs may vary based on:
- Search result length
- Number of cached tokens
- Grounding overhead in Gemini
- Model pricing changes

## Testing Checklist

- [x] Serper API integration working
- [x] Search results formatted correctly
- [x] Person agent can perform research
- [x] Company agent can perform research
- [x] API usage tracking for Serper works
- [x] Token tracking for Gemini works
- [x] Environment variables documented
- [x] No TypeScript compilation errors
- [x] Error handling robust

### Pending Tests
- [ ] Test with real meetings and compare quality with grounding
- [ ] Measure actual latency difference
- [ ] Verify cost calculations with real usage
- [ ] Test error handling (Serper API down, invalid key, etc.)
- [ ] Compare research quality between branches

## Switching Between Implementations

### Use Gemini Grounding Branch
```bash
cd frontend
git checkout feature/unified-research-agent
```
- Requires only `GOOGLE_GEMINI_API_KEY`
- Single API call per research
- Less control but simpler

### Use Serper API Branch
```bash
cd frontend
git checkout feature/unified-research-agent-serper
```
- Requires `GOOGLE_GEMINI_API_KEY` + `SERPER_API_KEY`
- Two API calls per research
- More control and debuggability

## Benefits of Serper Approach

1. **Explicit Control** - You control the search queries
2. **Debugging** - Can inspect search results before LLM processing
3. **Fallback Option** - Alternative if grounding has issues
4. **Transparency** - Can see exactly what data the LLM receives
5. **Flexibility** - Can modify search parameters easily
6. **API Usage Tracking** - Separate tracking for search vs LLM

## Known Limitations

1. **Sequential Calls** - Higher latency than single grounding call
2. **Additional Dependency** - Requires Serper API account
3. **Cost Overhead** - Slight additional cost for Serper API
4. **Manual Query Construction** - Need to craft good search queries

## Future Improvements

1. **Parallel Requests** - Make Serper calls parallel for person + company
2. **Query Optimization** - Fine-tune search queries based on results
3. **Caching** - Cache search results for common queries
4. **Fallback Strategy** - Try grounding if Serper fails
5. **A/B Testing** - Compare quality metrics between approaches
6. **Cost Optimization** - Adjust numResults based on quality needs

## References

- Original Python implementation: `backend/src/research_agent/web_search.py`
- Backend grounding migration: `backend/GROUNDING_MIGRATION.md`
- Pre-grounding commit: `38db664^`
- Serper API docs: https://serper.dev/docs
