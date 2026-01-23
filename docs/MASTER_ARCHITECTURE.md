# UI Architecture – Next.js 14

## Purpose
This document explains **how the UI is structured and organized** in Next.js 14 using the App Router.

---

## Framework & Routing

- Framework: Next.js 14
- Routing: App Router (`/app` directory)
- Rendering: Server Components by default

---

## Folder Structure

```
app/
├── (public)/
│   ├── layout.tsx        # Landing layout (no auth)
│   └── page.tsx          # Landing page
│
├── (app)/
│   ├── layout.tsx        # Authenticated app shell
│   ├── dashboard/
│   │   └── page.tsx
│   ├── settings/
│   │   ├── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   └── billing/
│   │       └── page.tsx
│
├── api/
│   └── auth/
│       └── [...nextauth]/route.ts
│
├── globals.css
└── providers.tsx
```

---

## Layout Strategy

### Public Layout
- Used only for unauthenticated pages
- Minimal header
- No sidebar

### App Layout (Authenticated)

All authenticated pages are wrapped by a shared layout:

- Sidebar navigation
- Top navigation bar
- Main content container

This guarantees visual and structural consistency.

---

## Authentication Architecture

- Auth handled by NextAuth (Auth.js)
- Google OAuth provider
- Middleware protects authenticated routes

Protected routes:
- `/dashboard`
- `/settings/*`

Unauthenticated access redirects to landing page.

---

## Component Organization

```
components/
├── layout/
│   ├── AppShell.tsx
│   ├── Sidebar.tsx
│   └── TopNav.tsx
│
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Textarea.tsx
│   ├── Tabs.tsx
│   ├── Modal.tsx
│   └── Badge.tsx
│
├── dashboard/
│   ├── MeetingCard.tsx
│   ├── AttendeesList.tsx
│   └── PrepNotes.tsx
```

---

## Rendering & State Strategy

- Server Components:
  - Meetings list
  - User profile

- Client Components:
  - Prep notes editor
  - Tabs
  - Modals

- Mutations handled via Server Actions

---

This document defines **how the UI is built and structured**.

