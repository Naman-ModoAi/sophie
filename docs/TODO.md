# Product Backlog

**Last Updated:** 2026-01-26

---

## High Priority

### 1. Complete Settings Page Implementation
**Status:** Partially implemented
**Effort:** Medium
**Impact:** High

Currently only route exists. Need to implement:
- Profile section (avatar, name, email display)
- Plan & Billing section
- Upgrade CTA integration with Stripe
- Form validation and save functionality

**Reference:** MASTER_CHECKLIST.md Phase 7

---

### 2. Quality Checks & Testing
**Status:** Not started
**Effort:** Medium
**Impact:** High

From MASTER_CHECKLIST Phase 8:
- [ ] Verify color restrictions (only allowed: #0A0A0FCC, #F0F0F5, #0D9488, #FFFFFF)
- [ ] Verify typography consistency
- [ ] Test unauthenticated flow
- [ ] Test authenticated navigation
- [ ] Test responsiveness across devices

---

### 3. AI Prep Notes Reliability Improvements
**Status:** Needs improvement
**Effort:** Medium
**Impact:** High

Current issues:
- Error handling in prep note generation
- Loading states could be clearer
- Need retry logic for failed generations
- No indication of generation progress

---

## Medium Priority

### 1. User Notes Persistence
**Status:** TODO commented in code
**Effort:** Small
**Impact:** Medium

Currently in PrepNotesEditor.tsx line 103:
```typescript
// TODO: Implement actual save logic to user_notes table
```

Need to:
- Create/verify user_notes table schema
- Implement save endpoint
- Add optimistic UI updates

---

### 2. Enhanced Attendee Editing
**Status:** Recently added, needs polish
**Effort:** Small
**Impact:** Medium

Recently added attendee info editing. Consider:
- Inline editing improvements
- Validation for required fields
- Save confirmation feedback
- Undo/redo functionality

---

### 3. Email Notifications System
**Status:** Partially implemented
**Effort:** Medium
**Impact:** Medium

API route exists (`/api/settings/email-timing`). Need to:
- Build UI for email preferences
- Implement email templates
- Test delivery system
- Add email preview feature

---

### 4. Meeting Filters & Search
**Status:** Not started
**Effort:** Medium
**Impact:** Medium

Dashboard currently shows all meetings. Add:
- Search by title/attendee
- Filter by date range
- Filter by internal/external
- Filter by prep status (ready/pending/researching)

---

### 5. Final Validation (Phase 9)
**Status:** Not started
**Effort:** Small
**Impact:** Medium

- [ ] No duplicate components
- [ ] No unused styles
- [ ] All pages use shared layouts
- [ ] Code cleanup and optimization

---

## Low Priority / Someday

### 1. Keyboard Shortcuts
**Effort:** Small
**Impact:** Low

Power user feature:
- Navigate between meetings (j/k)
- Quick search (/)
- Export PDF (e)
- New note (n)

---

### 2. Dark Mode
**Effort:** Medium
**Impact:** Low

Would require:
- Design token updates
- Theme switcher in settings
- Respect system preferences
- Update color palette (maintain brand consistency)

---

### 3. Meeting Notes Templates
**Effort:** Medium
**Impact:** Low

Allow users to:
- Create custom note templates
- Select template per meeting type
- Share templates across team (future multi-user)

---

### 4. Calendar View
**Effort:** Medium
**Impact:** Low

Alternative view to list:
- Month/week/day views
- Drag-and-drop rescheduling (view only for now)
- Color coding by status

---

### 5. Export Options
**Effort:** Small
**Impact:** Low

Currently only PDF export. Add:
- Export to Markdown
- Export to Google Docs
- Export to Notion
- Email prep notes directly

---

### 6. Browser Extension
**Effort:** Large
**Impact:** Low

Quick access from browser:
- View next meeting
- Quick note entry
- One-click prep note generation

---

## Bugs & Issues

### 1. PDF Export: Line Breaks in Bullet Points
**Status:** Known issue
**Priority:** Medium

Long bullet points in PDF export may not wrap correctly. Need to test and adjust line height calculations.

---

### 2. Loading States During Calendar Sync
**Status:** Needs improvement
**Priority:** Low

When resyncing calendar:
- Page reload is jarring
- No progress indicator
- Consider optimistic updates or smooth transition

---

## Ideas (Unsorted)

_New ideas go here. Review regularly and promote to priority sections._

### 1. Meeting Recordings Integration
Connect with Zoom/Meet to:
- Pull meeting recordings
- Generate transcripts
- Extract action items automatically
- Link recordings to prep notes

---

### 2. Team Collaboration Features
Multi-user support:
- Share prep notes with team
- Collaborative editing
- Comments and mentions
- Role-based access (viewer/editor/admin)

---

### 3. AI Follow-up Suggestions
After meeting:
- Generate follow-up email drafts
- Extract action items
- Schedule follow-up meetings
- Track commitments made

---

### 4. LinkedIn Deep Integration
Enhanced research:
- Pull recent posts/activity
- Mutual connections
- Shared interests
- Suggested ice breakers

---

### 5. CRM Integration
Sync with:
- Salesforce
- HubSpot
- Pipedrive
Connect meeting prep with deal context

---

### 6. Analytics Dashboard
Track:
- Meeting preparation time
- Meetings attended vs skipped
- Prep note usage patterns
- ROI on meeting time

---

## Completed ✓

### Phase 1: Foundation
- [x] Initialize Next.js 14 project (App Router)
- [x] Configure global CSS
- [x] Define design tokens (colors, spacing, typography)
- [x] Set up font loading

### Phase 2: Authentication
- [x] Install and configure NextAuth (Auth.js)
- [x] Set up Google OAuth provider
- [x] Implement middleware for route protection
- [x] Verify unauthenticated redirect behavior

### Phase 3: Layouts
- [x] Build public layout (landing only)
- [x] Build authenticated AppShell
- [x] Implement Sidebar component
- [x] Implement TopNav component

### Phase 4: Core UI Components
- [x] Button (variants: primary, secondary, disabled)
- [x] Card
- [x] Input
- [x] Textarea
- [x] Tabs
- [x] Modal
- [x] Badge
- [x] Avatar

### Phase 5: Landing Page
- [x] Hero section
- [x] Value proposition text
- [x] Google sign-in CTA
- [x] Footer

### Phase 6: Dashboard
- [x] Meetings list
- [x] Meeting card component
- [x] Meeting details panel
- [x] Attendees list
- [x] Prep notes editor
- [x] Empty states
- [x] Enhanced prep notes with tabbed interface (Overview, People Research, Company Intel, Discussion Points)
- [x] PDF export functionality
- [x] Expand/collapse sections
- [x] AI prep note generation
- [x] Resync button with primary styling

---

## Notes

- Follow MASTER_SPEC.md for all UI decisions
- Follow MASTER_ARCHITECTURE.md for code organization
- Never deviate from approved color palette
- All new features should have empty states
- Test on mobile before marking complete
