# Guide Screenshots

This directory contains screenshots for the "How to Use" guide page.

## Required Screenshots

Add the following screenshots to this directory:

1. **landing-page.png** (1200x800px)
   - Landing page with Google Sign-in button prominently displayed
   - Clean, full-width view of the page

2. **settings-calendar.png** (1200x800px)
   - Settings page showing the Calendar Connection section
   - Display connection status and resync button

3. **dashboard-meetings.png** (1200x800px)
   - Dashboard with list of upcoming meetings
   - Show meetings with Internal/External badges visible
   - Display at least 2-3 meeting cards

4. **meeting-prep-notes.png** (1200x800px)
   - Meeting detail panel with tabs visible
   - "Prep Notes" tab selected
   - "Generate Prep Notes" button clearly visible

5. **attendee-edit.png** (1200x800px)
   - Attendee list in edit mode
   - Show name and company input fields
   - Edit and Save buttons visible

## Adding Screenshots to the Page

Once you add screenshots to this directory, update the `AnnotatedScreenshot` components in `/app/(app)/how-to-use/page.tsx`:

```tsx
<AnnotatedScreenshot
  imageSrc="/images/guide/landing-page.png"
  alt="Landing page with Sign in with Google button"
  annotations={[...]}
/>
```

## Screenshot Guidelines

- **Format**: PNG for best quality
- **Resolution**: 1200x800px (16:10 aspect ratio)
- **DPI**: 72 DPI for web
- **Compression**: Optimize with tools like TinyPNG
- **Content**: Ensure no sensitive user data is visible
