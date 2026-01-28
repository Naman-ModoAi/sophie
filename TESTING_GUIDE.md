# Testing Guide: Unified Research Agent

This guide helps you test the migrated TypeScript research agent.

## Prerequisites

1. **Gemini API Key**: Get your API key from [Google AI Studio](https://aistudio.google.com/apikey)
2. **Environment Setup**: Add to `.env.local`:
   ```env
   GOOGLE_GEMINI_API_KEY=your_actual_api_key_here
   GEMINI_MODEL=gemini-2.0-flash-exp
   ```

## Database Setup

Run the token tracking migration if not already applied:

```bash
npm run migrate
```

This will create the `token_usage` and `api_usage` tables needed for tracking.

## Testing Steps

### 1. Basic TypeScript Compilation

```bash
npm run build
```

Should complete without errors.

### 2. Start Development Server

```bash
npm run dev
```

Server should start on `http://localhost:3000`

### 3. Test Research API Manually

#### Option A: Via Dashboard UI
1. Sign in to the app
2. Sync your calendar
3. Click "Generate Prep" on a meeting
4. Check browser console for logs like:
   - `[Orchestrator] Starting research for meeting...`
   - `[PersonAgent] Researching...`
   - `[CompanyAgent] Researching...`

#### Option B: Via API Call
```bash
curl -X POST http://localhost:3000/api/research \
  -H "Content-Type: application/json" \
  -d '{"meeting_id": "your-meeting-uuid-here"}'
```

### 4. Verify Token Tracking

After running research, check the database:

```sql
-- Check token usage
SELECT * FROM token_usage
ORDER BY created_at DESC
LIMIT 10;

-- Check user token totals
SELECT id, email, tokens_used_this_month, total_tokens_used
FROM users
WHERE tokens_used_this_month > 0;
```

### 5. Verify Prep Note Generated

```sql
-- Check prep notes
SELECT meeting_id, created_at, content->>'summary' as summary
FROM prep_notes
ORDER BY created_at DESC
LIMIT 5;
```

## Expected Output

### Console Logs

```
[Research API] Triggering research for meeting: abc-123-def
[Orchestrator] Starting research for meeting abc-123-def
[Orchestrator] Meeting: Weekly Sync with 2 attendees
[Orchestrator] Researching 1 external attendees
[Orchestrator] Researching person: John Doe (john@example.com)
[PersonAgent] Researching John Doe
[PersonAgent] Using Gemini grounding for research
[TokenTracker] Tracked 1234 tokens for user xyz, meeting abc, agent person
[Orchestrator] Researching 1 unique companies
[Orchestrator] Researching company: example.com
[CompanyAgent] Researching example.com
[CompanyAgent] Using Gemini grounding for research
[TokenTracker] Tracked 987 tokens for user xyz, meeting abc, agent company
[Orchestrator] Saved prep note to database
[Orchestrator] Research complete for meeting abc-123-def
[Research API] Research completed for: Weekly Sync
```

### API Response

```json
{
  "success": true,
  "message": "Research completed successfully",
  "meeting_id": "abc-123-def",
  "result": {
    "meeting_id": "abc-123-def",
    "meeting_title": "Weekly Sync",
    "meeting_time": "2026-01-28T10:00:00Z",
    "summary": "Meeting with John Doe from Example Corp...",
    "attendees": [...],
    "companies": [...],
    "suggested_talking_points": [...]
  }
}
```

## Troubleshooting

### Error: "GOOGLE_GEMINI_API_KEY environment variable is required"
- Check `.env.local` has the API key
- Restart Next.js dev server after adding env vars

### Error: "Meeting not found"
- Ensure the meeting exists in your database
- Check meeting UUID is correct

### Error: "Failed to track token usage"
- Run migration: `npm run migrate`
- Check Supabase connection
- Verify RLS policies allow service role to insert

### No Research Results
- Check Gemini API key is valid
- Check Gemini API quota/limits
- Look for errors in console logs

## Comparison with Python Backend

To verify output quality matches the Python version:

1. Keep Python backend running
2. Test same meeting with both:
   - TypeScript: `POST /api/research`
   - Python: Direct call to Flask backend
3. Compare:
   - Response structure
   - Research quality
   - Token usage
   - Response time

## Performance Expectations

- **Response time**: 5-15 seconds (depending on number of attendees)
- **Token usage**: ~2000-5000 tokens per meeting (varies by complexity)
- **Success rate**: >95% for valid meetings

## Next Steps

Once testing is successful:

1. Verify in production environment
2. Monitor error rates and token usage
3. Update documentation
4. Consider shutting down Python backend
5. Merge to main branch
