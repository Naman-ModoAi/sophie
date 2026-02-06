# Homepage Redesign - Technical Architecture

## Overview
This document outlines the technical implementation strategy for the **app-wide design system redesign**. This includes the landing page, dashboard, settings, and all authenticated pages.

## File Structure

```
app/
└── (public)/
    └── page.tsx              # Main homepage (updated imports)

components/
└── landing/                  # All updated with new design
    ├── Navigation.tsx        # Glass nav bar
    ├── Hero.tsx              # Gradient hero
    ├── SocialProof.tsx       # New inline section
    ├── ProblemSection.tsx    # Updated copy
    ├── HowItWorks.tsx        # 3-step cards
    ├── WhatYouGet.tsx        # Benefits focus
    ├── WhoItsFor.tsx         # NEW component
    ├── WhySophie.tsx      # Updated 3-point list
    ├── PricingSection.tsx    # Styled update
    ├── FinalCTA.tsx          # Updated copy
    └── (remove unused)

app/
├── globals.css               # New design tokens
└── layout.tsx                # Font configuration

tailwind.config.ts            # Complete redesign
```

## Design System Architecture

### Token Hierarchy
```
CSS Variables (globals.css)
    ↓
Tailwind Config (tailwind.config.ts)
    ↓
Component Classes
    ↓
React Components
```

### Color System
- **Brand Palette**: Primary blues/purples for CTAs, accents
- **Semantic Colors**: Context-specific (success, error, decorative)
- **Background System**: Three tiers (bg, surface, dark)
- **Text Hierarchy**: Three levels (primary, secondary, muted)

### Typography System
- **Font Loading**: next/font/google (optimized)
- **Two Families**: Fraunces (serif, display) + Sora (sans, UI)
- **Responsive Sizing**: clamp() for fluid typography
- **Letter Spacing**: Tight for headlines, wide for labels

## Component Patterns

### Server Components
All landing page components remain **Server Components** (no interactivity needed, except Navigation).

```typescript
// Example: Simple server component
export function ProblemSection() {
  return (
    <section className="py-[100px] px-6">
      {/* Content */}
    </section>
  )
}
```

### Client Components
Only components with interactivity need `'use client'`:
- **Navigation**: Scroll listener for background change
- **PricingSection**: Tab switching (if applicable)
- Any components with Intersection Observer for animations

### Animation Strategy

#### CSS-Only Animations (Preferred)
```css
/* Floating orbs - pure CSS */
@keyframes float {
  0%, 100% { transform: translate(0,0) scale(1); }
  33% { transform: translate(30px,-20px) scale(1.05); }
  66% { transform: translate(-20px,15px) scale(0.95); }
}
```

#### JavaScript Animations (Only When Needed)
Use Intersection Observer for scroll reveals:
```typescript
'use client'
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-up')
        }
      })
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  )
  // Observe elements
}, [])
```

## Glassmorphism Implementation

### Approach
Use Tailwind utilities + custom classes:

```typescript
// Component usage
<nav className="glass-nav">

// globals.css
.glass-nav {
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.6);
}
```

### Browser Support
- Modern browsers: Full support
- Safari: Requires `-webkit-backdrop-filter`
- Fallback: Solid background if no support

## Gradient System

### Implementation
Pre-defined gradients in Tailwind config:

```typescript
backgroundImage: {
  'gradient-hero': 'linear-gradient(135deg, #EEF0FB 0%, #F8F0FB 35%...)',
  'gradient-accent': 'linear-gradient(135deg, #4F7DF3 0%, #7C5CFC 100%)',
  // ...
}

// Usage
<div className="bg-gradient-hero">
<button className="bg-gradient-accent">
```

### Text Gradients
For gradient text (headings, accents):

```typescript
<h1 className="bg-gradient-accent bg-clip-text text-transparent">
  Headline
</h1>
```

## Performance Considerations

### Font Loading
- Use `next/font/google` for automatic optimization
- `display: 'swap'` to prevent FOIT
- Preload critical fonts

### Animation Performance
- Use `transform` and `opacity` only (GPU-accelerated)
- Avoid animating `width`, `height`, `margin`
- Use `will-change` sparingly

### Image Optimization
- Use Next.js `<Image>` component
- Lazy load below-the-fold images
- Serve WebP with fallbacks

## Migration Strategy

### Approach: Incremental Update
1. **Design System First**: Update Tailwind + globals.css
2. **Top to Bottom**: Start with Navigation → Hero → subsequent sections
3. **Test Each Section**: Ensure no regressions
4. **Remove Old Code**: Delete unused components after verification

### Migration Strategy Notes
- Design system changes will affect ALL pages
- Test landing page first, then dashboard, then settings
- Components will automatically use new tokens via Tailwind
- Check for hardcoded colors that bypass design tokens

## Testing Strategy

### Visual Regression
- Take screenshots before/after each section
- Compare against design doc
- Manual review on real devices

### Functional Testing
- Verify all CTAs work (Google Calendar sign-in)
- Test form submissions (Contact form)
- Ensure navigation links function

### Accessibility
- Check color contrast ratios
- Verify keyboard navigation
- Test with screen readers
- Ensure animations respect `prefers-reduced-motion`

## Deployment Checklist

### Pre-Deployment
- [ ] Run `npm run build` locally
- [ ] Check for build errors/warnings
- [ ] Test production build locally
- [ ] Verify environment variables

### Post-Deployment
- [ ] Check production URL
- [ ] Test on multiple devices
- [ ] Monitor error logs
- [ ] Check analytics for issues

## Dependencies

### New Dependencies
```json
{
  "dependencies": {
    "lucide-react": "^0.x.x"  // If not already installed
  }
}
```

### Font Dependencies
Handled by `next/font/google` (no separate package needed).

## Rollback Plan

### If Issues Arise
1. Git revert to previous commit
2. Redeploy previous version
3. Investigate issues in development
4. Fix and redeploy

### Branch Strategy
- Work on `homepage` branch (current)
- Test thoroughly before merging to `main`
- Keep `main` always deployable

## Future Considerations

### A/B Testing
- Set up variant system for testing copy/design
- Use feature flags for gradual rollout

### Analytics
- Track CTA click rates
- Monitor section scroll depth
- Measure conversion funnel

### SEO
- Ensure meta tags are updated
- Check structured data
- Verify Open Graph images

---

**Last Updated**: 2026-02-05
**Status**: Ready for implementation
