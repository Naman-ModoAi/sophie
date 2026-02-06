# Sophie - Frontend

Next.js 14 frontend for Sophie with Google OAuth authentication and calendar integration.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.local` and fill in the values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_OAUTH_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Backend Service
BACKEND_SERVICE_URL=http://localhost:8080

# Session Secret (generate with: openssl rand -base64 32)
SESSION_SECRET=your-session-secret-min-32-chars
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

### Authentication Flow

1. **Landing Page** (`/`) - "Sign in with Google" button
2. **OAuth Login** (`/api/auth/login`) - Generates PKCE parameters and redirects to Google
3. **OAuth Callback** (`/api/auth/callback`) - Exchanges code for tokens, creates user session
4. **Dashboard** (`/dashboard`) - Protected page showing upcoming meetings

### Key Features

- **PKCE Flow**: Secure OAuth 2.0 with code challenge
- **CSRF Protection**: State parameter validation
- **Session Management**: iron-session with secure HTTP-only cookies
- **RLS Security**: Direct Supabase access with Row Level Security
- **Server Components**: Next.js 14 App Router with RSC

### File Structure

```
app/
├── page.tsx                    # Landing page
├── dashboard/
│   └── page.tsx               # Dashboard (protected)
└── api/
    └── auth/
        ├── login/
        │   └── route.ts       # OAuth initiation
        ├── callback/
        │   └── route.ts       # OAuth callback
        └── logout/
            └── route.ts       # Logout

lib/
├── oauth.ts                   # PKCE and OAuth URL generation
├── session.ts                 # Session configuration
└── supabase.ts               # Supabase client

middleware.ts                  # Route protection
```

## Development

### Backend Service Requirement

The frontend requires the Python backend service to be running for:
- Token exchange (`/auth/token` endpoint)
- Calendar sync (background jobs)

See `../backend/README.md` for backend setup.

### Testing OAuth Flow

1. Start backend: `cd ../backend && python main.py`
2. Start frontend: `npm run dev`
3. Visit `http://localhost:3000`
4. Click "Sign in with Google"
5. Authorize with Google account
6. Redirected to dashboard with synced meetings

## Deployment

See main project README for deployment to Vercel.
