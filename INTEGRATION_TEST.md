# End-to-End Integration Test Guide

Test the complete flow from frontend to backend to database.

---

## Prerequisites

✅ Backend running: `http://localhost:8080`
✅ Frontend running: `http://localhost:3000`
✅ Supabase configured
✅ API keys set (.env files)

---

## Quick Test (Manual Trigger)

### 1. Start Backend
```bash
cd backend
uv run python main.py
# Should see: "Uvicorn running on http://0.0.0.0:8080"
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
# Should see: "Local: http://localhost:3000"
```

### 3. Create Test Meeting (via Dashboard)

Option A: **Sync from Google Calendar**
- Sign in to frontend
- Go to Dashboard
- Click "Sync Calendar" button
- Wait for meetings to appear

Option B: **Insert Test Meeting Directly (SQL)**
```sql
-- In Supabase SQL Editor
INSERT INTO meetings (user_id, calendar_event_id, title, start_time, end_time, is_external, status)
VALUES (
  'YOUR_USER_ID',
  'test-event-123',
  'Demo Meeting with Tech Leaders',
  NOW() + INTERVAL '2 days',
  NOW() + INTERVAL '2 days' + INTERVAL '1 hour',
  true,
  'pending'
);

-- Add external attendees
INSERT INTO attendees (meeting_id, email, name, domain, is_internal)
VALUES
  ((SELECT id FROM meetings WHERE calendar_event_id = 'test-event-123'), 'sundar@google.com', 'Sundar Pichai', 'google.com', false),
  ((SELECT id FROM meetings WHERE calendar_event_id = 'test-event-123'), 'satya@microsoft.com', 'Satya Nadella', 'microsoft.com', false);
```

### 4. Trigger Research (Frontend)

1. **Open Dashboard**: http://localhost:3000/dashboard
2. **Select Meeting**: Click on the test meeting
3. **Switch to Prep Notes Tab**: Click "Prep Notes" tab
4. **Click "Generate Prep Note"** button
5. **Wait 30-60 seconds** (research takes time)
6. **Prep note appears** with:
   - Summary
   - Talking points
   - Attendee insights
   - Company info

### 5. Verify Backend Logs

```bash
# Backend terminal should show:
[Orchestrator] Starting research for meeting abc-123
[Orchestrator] Meeting: Demo Meeting with Tech Leaders with 2 attendees
[Orchestrator] Researching 2 external attendees
[PersonAgent] Researching Sundar Pichai
[PersonAgent] Researching Satya Nadella
[CompanyAgent] Researching google.com
[CompanyAgent] Researching microsoft.com
[Orchestrator] Saved prep note to database
[Orchestrator] Research complete for meeting abc-123
```

### 6. Verify Database

```sql
-- Check meeting status updated
SELECT id, title, status FROM meetings WHERE calendar_event_id = 'test-event-123';
-- Should show: status = 'ready'

-- Check prep note saved
SELECT meeting_id, content FROM prep_notes WHERE meeting_id = (SELECT id FROM meetings WHERE calendar_event_id = 'test-event-123');
-- Should return JSON with research data
```

---

## Automated Test (Cron Job)

### Setup Cron (One-Time)

1. **Deploy Edge Function**
```bash
cd backend/supabase
supabase functions deploy trigger-research
supabase secrets set BACKEND_API_URL=http://localhost:8080
```

2. **Enable pg_cron**
- Go to Supabase Dashboard → Database → Extensions
- Enable "pg_cron"

3. **Run Migration**
```bash
supabase db push
# Or manually run: backend/supabase/migrations/20260123_001_cron_research_trigger.sql
```

4. **Update Cron Job with Your Values**
```sql
SELECT cron.schedule(
    'trigger-research-edge-function',
    '0 6 * * *',  -- Daily at 6 AM UTC
    $$
    SELECT net.http_post(
        url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/trigger-research',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer YOUR_ANON_KEY'
        ),
        body := '{}'::jsonb
    );
    $$
);
```

### Test Cron Manually

```bash
# Trigger cron job manually (don't wait for 6 AM)
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/trigger-research' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

Expected response:
```json
{
  "success": true,
  "message": "Research triggered for 2 meetings",
  "processed": 2,
  "succeeded": 2,
  "failed": 0,
  "results": [...]
}
```

---

## Test Checklist

### Backend API
- [ ] `GET /health` returns 200
- [ ] `POST /research` with meeting_id triggers research
- [ ] Backend logs show research progress
- [ ] Prep note saved to database

### Frontend
- [ ] Dashboard displays meetings
- [ ] Clicking meeting shows details
- [ ] Prep Notes tab loads
- [ ] "Generate Prep Note" button appears for pending meetings
- [ ] Button triggers research
- [ ] Loading state shows "Generating..."
- [ ] Prep note displays after generation
- [ ] Status badge shows "AI Research Complete"

### Database
- [ ] Meeting status updates: pending → researching → ready
- [ ] Prep note saved to `prep_notes` table
- [ ] Content is valid JSON with expected structure

### Edge Function (Cron)
- [ ] Function deploys successfully
- [ ] Manual trigger works
- [ ] Fetches pending meetings correctly
- [ ] Calls backend for each meeting
- [ ] Handles errors gracefully

---

## Common Issues

### Backend Not Responding
```bash
# Check if running
curl http://localhost:8080/health

# If not running, start it
cd backend
uv run python main.py
```

### Frontend Can't Reach Backend
```bash
# Check .env.local has correct URL
cat .env.local | grep BACKEND_API_URL
# Should be: NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8080
```

### No Prep Note Generated
- Check backend logs for errors
- Verify API keys are set (GEMINI_API_KEY, SERPER_API_KEY)
- Check meeting has external attendees
- Verify meeting status in database

### Cron Job Not Running
```sql
-- Check if cron job exists
SELECT * FROM cron.job;

-- Check cron job history
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;

-- Manually trigger
SELECT net.http_post(...);
```

---

## Production URLs

When deploying to production, update:

**Frontend `.env.production`:**
```
NEXT_PUBLIC_BACKEND_API_URL=https://research-agent-xxx.run.app
```

**Supabase Secrets:**
```bash
supabase secrets set BACKEND_API_URL=https://research-agent-xxx.run.app
```

**Cron Job URL:**
```sql
-- Update cron to use production Edge Function URL
url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/trigger-research'
```

---

## Success Criteria

✅ Backend API running and responsive
✅ Frontend displays meetings from database
✅ "Generate Prep Note" button triggers research
✅ Research completes in 30-60 seconds
✅ Prep note displays with formatted data
✅ Cron job runs daily and processes pending meetings
✅ All logs show success messages
✅ No errors in browser console or backend logs

---

## Next Steps After Testing

1. ✅ Verify all tests pass
2. Monitor for 24 hours to ensure stability
3. Deploy to production (Cloud Run + Vercel)
4. Set up monitoring/alerts
5. Add user feedback mechanism
6. Consider caching strategies
7. Optimize API call costs
