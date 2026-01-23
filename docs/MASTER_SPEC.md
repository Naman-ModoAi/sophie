# UI Product Specifications

## Purpose
This document captures **what the product UI must be**, independent of implementation details. It is the source of truth for product and design requirements.

---

## Authentication & Access

- The app front page acts as a **landing page** when the user is not logged in
- No content pages are accessible without authentication
- Authentication is done exclusively via **Google Sign-In**
- Clicking "Sign in" initiates Google OAuth
- After successful login, user is redirected to **Dashboard**

---

## Pages Required

### 1. Landing Page (Unauthenticated)

**Purpose**: Explain value and convert users

Must include:
- Product headline and short description
- Primary CTA: Sign in with Google
- Optional feature highlights
- Footer with legal links

Must NOT include:
- Sidebar
- User-specific content

---

### 2. Dashboard (Authenticated)

**Purpose**: Primary workspace

Must include:
- List of meetings
- Meeting details view
- Attendees information per meeting
- Prep notes attached to each meeting

Behavior:
- Selecting a meeting updates details panel
- Prep notes are editable
- Clear empty states when data is missing

---

### 3. Settings (Authenticated)

**Purpose**: User account management

Sections:

#### Profile
- Avatar
- Name
- Email (read-only if from Google)

#### Plan & Billing
- Current plan
- Plan features
- Upgrade action

---

## Design System Constraints

### Colors (Strict)

Only these colors are allowed:

- Text: `#0A0A0FCC`
- App background: `#F0F0F5`
- Accent / CTA: `#0D9488`
- Surface / cards: `#FFFFFF`

Rules:
- No additional colors
- Opacity variations only

---

### Typography

- Single font family across the app
- Consistent font scale for headings and body text
- No decorative or secondary fonts

---

## Consistency Rules

- All pages must follow the same layout structure
- All UI must be built from reusable components
- No inline styles or page-specific UI hacks

---

This document defines **what must exist** and **what is allowed** in the UI.

