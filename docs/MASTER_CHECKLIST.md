# UI Implementation Checklist

## Purpose
This checklist defines the **step-by-step order** to implement the UI cleanly and consistently.

Follow this sequence strictly to avoid refactors.

---

## Phase 1: Foundation

- [x] Initialize Next.js 14 project (App Router)
- [x] Configure global CSS
- [x] Define design tokens (colors, spacing, typography)
- [x] Set up font loading

---

## Phase 2: Authentication

- [x] Install and configure NextAuth (Auth.js)
- [x] Set up Google OAuth provider
- [x] Implement middleware for route protection
- [x] Verify unauthenticated redirect behavior

---

## Phase 3: Layouts

- [x] Build public layout (landing only)
- [x] Build authenticated AppShell
- [x] Implement Sidebar component
- [x] Implement TopNav component

---

## Phase 4: Core UI Components

- [x] Button (variants: primary, secondary, disabled)
- [x] Card
- [x] Input
- [x] Textarea
- [x] Tabs
- [x] Modal
- [x] Badge
- [x] Avatar

Rules:
- No inline styles
- No hardcoded colors

---

## Phase 5: Landing Page

- [x] Hero section
- [x] Value proposition text
- [x] Google sign-in CTA
- [x] Footer

---

## Phase 6: Dashboard

- [x] Meetings list
- [x] Meeting card component
- [x] Meeting details panel
- [x] Attendees list
- [x] Prep notes editor
- [x] Empty states

---

## Phase 7: Settings

- [x] Settings route
- [x] Profile section
- [x] Plan & Billing section
- [x] Upgrade CTA

---

## Phase 8: Quality Checks

- [x] Verify color restrictions
- [x] Verify typography consistency
- [x] Test unauthenticated flow
- [x] Test authenticated navigation
- [x] Test responsiveness

---

## Phase 9: Final Validation

- [ ] No duplicate components
- [ ] No unused styles
- [ ] All pages use shared layouts

---

This checklist ensures a **clean, scalable, and consistent UI implementation**.

