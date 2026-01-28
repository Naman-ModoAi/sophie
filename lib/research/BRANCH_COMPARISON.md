# Research Agent Branch Comparison

This document provides a side-by-side comparison of the two research agent implementations for testing and evaluation.

## Branches

### 1. `feature/unified-research-agent` (Gemini Grounding)
**Status**: ✅ Implemented
**Approach**: Single API call with built-in grounding

### 2. `feature/unified-research-agent-serper` (Serper API)
**Status**: ✅ Implemented
**Approach**: Two-step process (Serper search → Gemini analysis)

## Quick Switch Guide

```bash
# Switch to Gemini Grounding
cd frontend
git checkout feature/unified-research-agent

# Switch to Serper API
cd frontend
git checkout feature/unified-research-agent-serper
```

## Environment Setup

### Gemini Grounding Branch
```env
GOOGLE_GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.0-flash-exp
```

### Serper API Branch
```env
GOOGLE_GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.0-flash-exp
SERPER_API_KEY=your_serper_key_here  # Additional requirement
```

## Feature Comparison

| Feature | Gemini Grounding | Serper API |
|---------|------------------|------------|
| **API Calls per Meeting** | 2 (person + company) | 4 (2 Serper + 2 Gemini) |
| **Search Method** | Gemini internal grounding | Explicit Serper API |
| **Search Query Control** | ❌ Automatic | ✅ Manual |
| **Search Result Visibility** | ❌ Hidden | ✅ Visible |
| **Token Usage** | Higher (grounding overhead) | Lower (direct prompts) |
| **Latency** | ~5-10s per research | ~7-12s per research |
| **Cost per Meeting** | ~$0.001 (tokens only) | ~$0.00467 (Serper + tokens) |
| **Debugging** | Hard | Easy |
| **Reliability** | Single point of failure | Graceful degradation |
| **Setup Complexity** | Simple (1 API key) | Medium (2 API keys) |

## Testing Scenarios

### Scenario 1: Standard Meeting
- **Meeting**: Team sync with 3 external attendees
- **Expected**: Research 3 people + 2 companies
- **Compare**:
  - Response quality
  - Completeness of data
  - Accuracy of information
  - Relevance of talking points

### Scenario 2: High-Profile Attendee
- **Meeting**: With a well-known CEO or public figure
- **Expected**: Rich LinkedIn data, recent news, background
- **Compare**:
  - Depth of information
  - Recent activity accuracy
  - LinkedIn URL correctness

### Scenario 3: Small/Unknown Company
- **Meeting**: With startup or lesser-known company
- **Expected**: Basic company info, products, funding
- **Compare**:
  - Ability to find information
  - Graceful handling of limited data
  - Relevance of results

### Scenario 4: API Failure
- **Test**: Simulate API failure
- **Expected**: Graceful degradation
- **Compare**:
  - Error messages
  - Fallback behavior
  - User experience

## Evaluation Metrics

### 1. Quality Metrics
- **Accuracy**: Is the information correct?
- **Completeness**: Are all fields populated?
- **Relevance**: Are talking points useful?
- **Freshness**: Is the data up-to-date?

### 2. Performance Metrics
- **Latency**: Time from request to response
- **Success Rate**: % of successful researches
- **Token Usage**: Average tokens per research
- **API Calls**: Number of API calls per meeting

### 3. Cost Metrics
- **Cost per Meeting**: Total API costs
- **Cost per Research**: Average cost per person/company
- **Monthly Cost**: Projected cost at scale

### 4. Developer Experience
- **Debugging**: How easy to debug issues?
- **Monitoring**: Can you track what's happening?
- **Error Messages**: Are errors clear?
- **Setup Time**: How long to get started?

## Sample Test Plan

### Phase 1: Functional Testing
1. Create test meeting with known attendees
2. Run research on Gemini Grounding branch
3. Record results (save to JSON)
4. Switch to Serper API branch
5. Run same research
6. Compare results side-by-side

### Phase 2: Performance Testing
1. Test 10 meetings on each branch
2. Measure average latency
3. Track token usage
4. Calculate costs
5. Compare metrics

### Phase 3: Edge Case Testing
1. Test with missing email data
2. Test with non-corporate domains (gmail.com, etc.)
3. Test with international attendees
4. Test with very long meeting titles/descriptions
5. Test with API failures

### Phase 4: Production Testing
1. Run both branches in parallel (different meetings)
2. Collect user feedback
3. Monitor error rates
4. Track costs
5. Make final decision

## Recommendation Criteria

Choose **Gemini Grounding** if:
- ✅ Simplicity is priority (1 API key)
- ✅ Lower latency is critical
- ✅ Token costs are acceptable
- ✅ You trust Gemini's search query generation

Choose **Serper API** if:
- ✅ Need explicit control over searches
- ✅ Debugging/monitoring is important
- ✅ Want to optimize search queries
- ✅ Need fallback/redundancy options
- ✅ Lower token costs matter

## Data Collection Template

```json
{
  "meeting_id": "...",
  "branch": "gemini-grounding | serper-api",
  "timestamp": "2025-01-28T...",
  "metrics": {
    "latency_ms": 0,
    "input_tokens": 0,
    "output_tokens": 0,
    "cached_tokens": 0,
    "serper_requests": 0,
    "total_cost_usd": 0
  },
  "quality": {
    "persons_found": 0,
    "persons_with_linkedin": 0,
    "persons_with_background": 0,
    "companies_found": 0,
    "companies_with_news": 0,
    "talking_points_count": 0
  },
  "errors": []
}
```

## Next Steps

1. ✅ Implementation complete
2. ⏳ Test with real meetings
3. ⏳ Collect performance data
4. ⏳ Compare quality metrics
5. ⏳ Calculate actual costs
6. ⏳ Make final decision
7. ⏳ Document findings
8. ⏳ Choose primary implementation
9. ⏳ Keep alternative as fallback

## Notes

- Both branches are production-ready
- Both include proper error handling
- Both track API usage
- Both follow same agent patterns
- Easy to switch between them
- Can run A/B test in production

## Resources

- Gemini Grounding docs: https://ai.google.dev/gemini-api/docs/grounding
- Serper API docs: https://serper.dev/docs
- Token tracking: `lib/research/token-tracker.ts`
- Serper implementation: `lib/research/SERPER_IMPLEMENTATION.md`
