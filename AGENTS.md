# AGENTS.md

This document provides guidelines for agentic coding agents working in this Next.js frontend repository.

## Project Overview

Sophi is a Next.js 14 frontend with Google OAuth authentication and calendar integration. It uses the App Router, TypeScript, Tailwind CSS, Supabase for data, and iron-session for session management.

## Development Commands

### Core Commands
- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run migrate` - Run database migrations

### Testing
No test framework is currently configured. When implementing tests, use Jest/Vitest and ensure they're added to package.json scripts.

## Project Structure

```
app/
├── (app)/dashboard/     # Protected dashboard pages
├── (app)/settings/      # Protected settings pages
├── (public)/            # Public pages (landing)
├── api/                 # API routes (auth, calendar, stripe)
└── layout.tsx           # Root layout

lib/
├── supabase/           # Supabase client configs
├── oauth.ts            # OAuth utilities
└── session.ts          # Session configuration

components/
├── ui/                 # Reusable UI components
├── dashboard/          # Dashboard-specific components
├── layout/             # Layout components
└── settings/           # Settings components
```

## Code Style Guidelines

### TypeScript & Types
- Use strict TypeScript configuration (already enabled)
- Define interfaces for all props and data structures
- Use `interface` for object shapes, `type` for unions/primitives
- Export types/interfaces separately from implementations
- Use proper generic types where applicable

### Import Patterns
```typescript
// Next.js imports first
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// External libraries
import { getIronSession } from 'iron-session';

// Internal imports with @ alias
import { SessionData } from '@/lib/session';
import { Button } from '@/components/ui';
import { createClient } from '@/lib/supabase/server';
```

### Component Conventions
- Use PascalCase for component names
- Export components as named exports, not default
- Use `forwardRef` for components that accept refs
- Always include `displayName` for forwardRef components
- Client components must start with `'use client';`
- Props interfaces should be named `ComponentNameProps`

### File Naming
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- API routes: `route.ts`
- Pages: `page.tsx`
- Layouts: `layout.tsx`

### Styling with Tailwind
- Use design tokens from CSS variables (defined in globals.css)
- Prefer token-based classes: `text-text` instead of `text-gray-900`
- Use consistent spacing scale: `p-md`, `gap-sm`, etc.
- Leverage CSS-in-JS pattern for component variants
- Avoid arbitrary values except when absolutely necessary

### API Routes
- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Return `NextResponse` objects
- Handle errors gracefully with appropriate status codes
- Validate environment variables with `!` assertion (they're required)
- Use try-catch blocks with proper error logging

### Database & Supabase
- Use `createClient()` for RLS-protected operations
- Use `createServiceClient()` for admin operations (bypasses RLS)
- Always handle database errors with proper error checking
- Use type-safe queries with TypeScript interfaces

### Session Management
- Use iron-session for server-side sessions
- Session data must conform to `SessionData` interface
- Always validate `isLoggedIn` before accessing protected data
- Use middleware for route protection

### Error Handling
```typescript
// Database operations
const { data, error } = await supabase.from('meetings').select('*');
if (error) {
  console.error('Database error:', error);
  return []; // or appropriate fallback
}

// API routes
try {
  // operation
} catch (error: any) {
  console.error('Operation failed:', error.message);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

### Environment Variables
- All required environment variables are asserted with `!`
- Never log or expose sensitive environment variables
- Use `NEXT_PUBLIC_` prefix for client-side variables only

### Security Practices
- Validate OAuth state parameters for CSRF protection
- Use secure, HTTP-only cookies for sessions
- Never expose service role keys to client code
- Validate user sessions before accessing protected resources

## Component Library Patterns

### UI Components
- Keep components in `components/ui/` directory
- Use composition over inheritance
- Support `className` prop for customization
- Use variant pattern for different styles

### Data Flow
- Server Components for data fetching
- Client Components for interactivity
- Use Server Actions for mutations
- Pass data as props, not through context unless global

## Common Patterns

### OAuth Flow
1. Generate state in `/api/auth/login`
2. Redirect to Google OAuth
3. Handle callback in `/api/auth/callback`
4. Create iron-session and redirect to dashboard

### Database Queries
```typescript
// Fetching with joins
const { data } = await supabase
  .from('meetings')
  .select(`
    *,
    attendees (*)
  `)
  .eq('user_id', userId)
  .order('start_time');
```

### Form Handling
- Use native HTML forms with Server Actions when possible
- For complex forms, use client-side state management
- Always validate and sanitize inputs

## Testing Guidelines

When implementing tests:
- Unit tests for utility functions
- Integration tests for API routes
- Component tests for UI components
- E2E tests for critical user flows

## Performance Considerations

- Use Next.js Image for optimized images
- Implement proper loading states
- Use React.memo for expensive components
- Leverage Next.js caching strategies
- Optimize bundle size with dynamic imports