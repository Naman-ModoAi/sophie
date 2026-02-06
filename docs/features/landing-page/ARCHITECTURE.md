# Landing Page - Technical Architecture

## Overview

The landing page will be a comprehensive marketing site built as a single-page application using Next.js 14 with Server Components. The page will be fully responsive, follow the design token system, and integrate with the existing Supabase OAuth flow.

## File Structure

```
app/
  (public)/
    page.tsx                           # Main landing page (MODIFIED)
    layout.tsx                         # Existing minimal layout (NO CHANGE)

components/
  landing/                             # New directory for landing page components
    Hero.tsx                           # Hero section with CTA
    ProblemSection.tsx                 # Problem statement section
    HowItWorks.tsx                     # 3-step process
    WhatYouGet.tsx                     # Benefits breakdown
    Testimonials.tsx                   # Social proof with quotes
    WhySophiHQ.tsx                   # Key differentiators
    PricingSection.tsx                 # Pricing cards (Free & Pro)
    SecurityTrust.tsx                  # Trust indicators
    ContactForm.tsx                    # Contact form with validation
    FinalCTA.tsx                       # Final conversion section
    Navigation.tsx                     # Top navigation bar

  ui/                                  # Existing UI components (USE AS-IS)
    Button.tsx
    Card.tsx
    Badge.tsx
    Input.tsx
    [... other existing components]

  layout/
    Footer.tsx                         # Existing footer (MINOR UPDATES)

lib/
  actions/
    contact.ts                         # Server action for contact form submission

types/
  landing.ts                           # TypeScript types for landing page data
```

## Component Architecture

### Section Components (Presentational)

Each major section of the landing page will be a separate React Server Component for:
- Better code organization
- Easier testing
- Reusability
- Clear separation of concerns

All section components will:
- Accept props for content (for future CMS integration)
- Use design tokens exclusively
- Be fully responsive (mobile-first)
- Export as named exports

### Navigation Component

**Location**: `components/landing/Navigation.tsx`

**Features**:
- Fixed/sticky on scroll (optional enhancement)
- Smooth scroll to anchor links
- Mobile hamburger menu (if needed)
- CTA button always visible

**Props**:
```typescript
interface NavigationProps {
  className?: string;
}
```

### Hero Component

**Location**: `components/landing/Hero.tsx`

**Features**:
- Large headline with accent color on key phrase
- Subheadline text
- Primary CTA (Google OAuth button)
- Secondary CTA (scroll to "How it works")
- Trust indicators
- Target audience badges

**Props**:
```typescript
interface HeroProps {
  headline: string;
  highlightedText: string;
  subheadline: string;
  primaryCTA: {
    text: string;
    href: string;
  };
  secondaryCTA: {
    text: string;
    href: string;
  };
}
```

### Pricing Section Component

**Location**: `components/landing/PricingSection.tsx`

**Features**:
- 2 pricing cards (Free & Pro)
- Highlight "Most Popular" plan
- Feature lists
- CTAs for each plan
- Annual/monthly toggle (future enhancement)

**Props**:
```typescript
interface PricingPlan {
  name: 'free' | 'pro';
  price: {
    monthly: number;
    annually?: number;
  };
  features: string[];
  cta: {
    text: string;
    href: string;
  };
  badge?: string; // e.g., "Most Popular"
}

interface PricingSectionProps {
  plans: PricingPlan[];
}
```

### Contact Form Component

**Location**: `components/landing/ContactForm.tsx`

**Features**:
- Email input with validation
- Submit button
- Success/error states
- Privacy notice
- Form submission via Server Action

**State Management**:
- Client component (needs useState for form state)
- Uses Server Action for submission

**Props**:
```typescript
interface ContactFormProps {
  className?: string;
}
```

## Data Flow

### Contact Form Submission

```
ContactForm.tsx (Client Component)
    ↓ (form submit)
Server Action: /lib/actions/contact.ts
    ↓
Email service (future: send to support email)
    ↓
Return success/error
    ↓
ContactForm updates UI state
```

### OAuth Flow (Existing)

```
User clicks "Connect Google Calendar"
    ↓
/api/auth/login
    ↓
Supabase OAuth (Google)
    ↓
/api/auth/callback
    ↓
User sync + token storage
    ↓
Redirect to /dashboard
```

## Styling Approach

### Design Tokens Usage

All components MUST use design tokens:

```typescript
// ✅ Correct
<div className="bg-background">
<h1 className="text-text">
<button className="bg-accent text-surface">
<div className="border-text/10">

// ❌ Incorrect
<div className="bg-gray-100">
<h1 className="text-gray-900">
<button className="bg-teal-600 text-white">
<div className="border-gray-200">
```

### Responsive Design

Use Tailwind's responsive prefixes:
- Mobile-first approach (default = mobile)
- `sm:` - 640px and up
- `md:` - 768px and up
- `lg:` - 1024px and up
- `xl:` - 1280px and up

```typescript
// Example: Stack on mobile, grid on desktop
<div className="flex flex-col md:grid md:grid-cols-3 gap-6">
```

### Component Patterns

**Section Container**:
```typescript
<section className="py-16 md:py-24 px-6">
  <div className="max-w-7xl mx-auto">
    {/* Content */}
  </div>
</section>
```

**Card Grid**:
```typescript
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {/* Cards */}
</div>
```

## Server Actions

### Contact Form Handler

**Location**: `lib/actions/contact.ts`

```typescript
'use server'

import { z } from 'zod'

const contactSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function submitContactForm(formData: FormData) {
  // Validate input
  const result = contactSchema.safeParse({
    email: formData.get('email'),
  })

  if (!result.success) {
    return {
      success: false,
      error: result.error.errors[0].message
    }
  }

  // TODO: Send email to support (future enhancement)
  // For now, just log
  console.log('Contact form submission:', result.data.email)

  return {
    success: true,
    message: "Thanks! We'll be in touch soon."
  }
}
```

## Performance Optimizations

### Image Optimization
- Use Next.js `<Image>` component for any images
- Set proper width/height
- Use `loading="lazy"` for below-the-fold images

### Code Splitting
- Sections are separate components (automatic code splitting)
- Contact form is client component (splits from server components)

### Font Loading
- Use Next.js font optimization (already configured)
- Ensure no layout shift during font load

## SEO Considerations

### Meta Tags

Update `app/(public)/page.tsx` with metadata:

```typescript
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SophiHQ - Never walk into a call cold',
  description: 'Instant meeting briefs from your calendar. AI-powered research on attendees and companies delivered before every call.',
  openGraph: {
    title: 'SophiHQ - Never walk into a call cold',
    description: 'Instant meeting briefs from your calendar. AI-powered research on attendees and companies delivered before every call.',
    type: 'website',
  },
}
```

### Semantic HTML

- Use proper heading hierarchy (h1 → h2 → h3)
- Use semantic tags (`<section>`, `<article>`, `<nav>`)
- Add ARIA labels where needed

## Testing Strategy

### Manual Testing Checklist
- [ ] All CTAs link to correct destinations
- [ ] OAuth flow initiates correctly
- [ ] Smooth scrolling works for anchor links
- [ ] Mobile responsive on all screen sizes
- [ ] Contact form validation works
- [ ] Contact form submission succeeds
- [ ] All sections render correctly
- [ ] Design tokens applied consistently
- [ ] Footer links work

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader compatible
- [ ] Form labels properly associated

## Migration from Current Implementation

### Current State (`app/(public)/page.tsx`)
- Basic hero section
- Simple 3-feature grid
- Footer

### Changes Required
1. Extract Navigation to separate component
2. Expand Hero section with more content
3. Add 8 new sections (Problem, How It Works, etc.)
4. Update Footer with additional links
5. Add contact form functionality

### Approach
- Create all section components first
- Update main page.tsx to compose sections
- Test incrementally (section by section)
- Ensure no breaking changes to OAuth flow

## Dependencies

### Existing Dependencies (No New Installs Needed)
- `next` (14.x)
- `react` (18.x)
- `tailwindcss`
- `@supabase/ssr`

### Potential Future Dependencies
- Email service (SendGrid, Resend, etc.) for contact form
- Form validation library (zod - already used in other parts)

## Edge Cases & Error Handling

### Contact Form
- Handle rate limiting (prevent spam)
- Show user-friendly error messages
- Handle network failures gracefully

### Navigation
- Handle missing anchor targets
- Smooth scroll fallback for older browsers

### Pricing
- Handle Stripe checkout errors (if user clicks upgrade)
- Show loading states during checkout

## Future Enhancements (Out of Scope)

- Animated illustrations/Lottie animations
- Video demo embed
- Interactive product tour
- Pricing calculator
- Testimonial carousel
- Blog section integration
- Multi-language support
- Dark mode toggle
