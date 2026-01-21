# Changelog - Frontend

All notable changes to the PrepFor.app frontend will be documented in this file.

---

## 2026-01-20

### Changed

- **Removed PKCE Flow** - Switched to traditional OAuth flow with backend token exchange
  - Removed `code_verifier` and `code_challenge` generation
  - Frontend now delegates all token exchange to backend
  - Simplified OAuth login route (no PKCE cookies)
  - Updated callback route to call `/api/auth/exchange-token` on backend
  - Backend handles: token exchange, user creation, token encryption
  - Fixed backend URL: `http://localhost:8000` (was 8080)
  - Client secret stays server-side only, never exposed to browser

### Added

- **Next.js 14 Application**: Created frontend with App Router, TypeScript, and Tailwind CSS
  - Installed dependencies: @supabase/supabase-js, iron-session
  - ESLint and TypeScript configured

- **Environment Configuration** (`.env.local`)
  - Supabase URL and anon key
  - Google OAuth client ID and secret
  - OAuth redirect URI
  - Backend service URL
  - Session secret for iron-session

- **OAuth Utilities** (`lib/oauth.ts`)
  - `generateCodeVerifier()` - Create random PKCE code verifier
  - `generateCodeChallenge()` - SHA256 hash of verifier
  - `generateState()` - Random state for CSRF protection
  - `buildAuthUrl()` - Build Google OAuth authorization URL with PKCE

- **Session Management** (`lib/session.ts`)
  - SessionData interface (userId, email, isLoggedIn)
  - iron-session configuration with secure HTTP-only cookies
  - 7-day session expiration

- **Supabase Client** (`lib/supabase.ts`)
  - Server-side Supabase client for RLS-protected queries

- **Landing Page** (`app/page.tsx`)
  - "Sign in with Google" button with official Google branding
  - Clean, centered design with gradient background
  - Links to /api/auth/login

- **OAuth Login Endpoint** (`app/api/auth/login/route.ts`)
  - Generates PKCE code_verifier and code_challenge
  - Generates random state for CSRF protection
  - Stores verifier and state in secure HTTP-only cookies (10 min expiration)
  - Redirects to Google OAuth consent screen
  - Requests calendar.readonly scope

- **OAuth Callback Handler** (`app/api/auth/callback/route.ts`)
  - Verifies state parameter (CSRF protection)
  - Exchanges authorization code for tokens via backend service
  - Creates/updates user in Supabase database
  - Creates iron-session with user data
  - Clears temporary OAuth cookies
  - Redirects to /dashboard on success
  - Error handling with redirect to landing page

- **Logout Endpoint** (`app/api/auth/logout/route.ts`)
  - Destroys iron-session
  - Redirects to landing page

- **Dashboard Page** (`app/dashboard/page.tsx`) - Protected route
  - Displays upcoming meetings (next 7 days)
  - Shows meeting details: title, time, attendees
  - Internal/External badge for meetings
  - External attendee indicator
  - Empty state for no meetings
  - User email and logout button in nav

- **Route Protection Middleware** (`middleware.ts`)
  - Protects /dashboard routes (redirects to / if not logged in)
  - Redirects logged-in users from / to /dashboard
  - iron-session integration

- **Documentation** (`README.md`)
  - Installation instructions
  - Environment variable configuration
  - Authentication flow diagram
  - File structure overview
  - Development and testing instructions

### Security Features

- **Backend Token Exchange**: Client secret never exposed to browser, stays on backend
- **CSRF Protection**: State parameter validation prevents code interception
- **Secure Sessions**: iron-session with HTTP-only cookies (7-day expiration)
- **RLS Integration**: Direct Supabase access with Row Level Security
- **Token Encryption**: OAuth tokens encrypted at rest in database (via backend)

### Architecture

```
app/
├── page.tsx                    # Landing page
├── dashboard/
│   └── page.tsx               # Dashboard (protected)
└── api/
    └── auth/
        ├── login/route.ts     # OAuth initiation
        ├── callback/route.ts  # OAuth callback
        └── logout/route.ts    # Logout

lib/
├── oauth.ts                   # OAuth utilities (state generation)
├── session.ts                 # Session configuration
└── supabase.ts               # Supabase client

middleware.ts                  # Route protection
```

### Notes

- Phase 1 frontend complete: OAuth flow + dashboard
- Next.js 14 App Router with Server Components
- Session management via iron-session
- Integration with Python backend for token exchange
- Ready for integration testing with backend services
