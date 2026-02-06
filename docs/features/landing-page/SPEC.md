# Landing Page Feature Specification

## Overview

Transform the current basic landing page into a comprehensive marketing site that follows the content from "Sophie-landing final.md" document. The landing page should effectively communicate Sophie's value proposition, showcase features, display pricing, and include social proof.

## Business Goals

- Convert visitors into free trial signups via Google Calendar OAuth
- Clearly communicate the problem Sophie solves
- Display pricing transparently (Free and Pro plans)
- Build trust through testimonials and security messaging
- Provide clear calls-to-action throughout the page

## Target Users

🎯 Sales reps & founders running deals
💼 Consultants & partners leading client conversations
⚖️ Advisors, lawyers & recruiters in high-stakes meetings

## User Stories

1. **As a visitor**, I want to quickly understand what Sophie does so I can decide if it's relevant for me
2. **As a potential customer**, I want to see how the product works so I can understand the workflow
3. **As a price-conscious user**, I want to see transparent pricing so I can make an informed decision
4. **As a security-conscious professional**, I want to know my data is safe before connecting my calendar
5. **As a visitor**, I want to see social proof so I can trust this product works for others like me

## Functional Requirements

### Navigation Bar
- Brand name/logo: "Sophie" with tagline "Before every call"
- Navigation links: How it works, Pricing, Contact
- Primary CTA: "Connect Google Calendar — Free"
- Should be sticky/fixed on scroll (optional enhancement)

### Hero Section
- **Headline**: "Never walk into a call cold."
- **Subheadline**: "Instant meeting briefs from your calendar so you know who's in the room, what matters, and how to lead the conversation."
- **Primary CTA**: "Connect Google Calendar — Free" (OAuth flow)
- **Secondary CTA**: "See how it works" (scrolls to section)
- **Trust indicator**: "No credit card required"
- **Target audience badges**: Display the 3 target user types with icons

### Problem Section
- **Headline**: "Right before an important call, you're probably:"
- List common pain points:
  - Googling the company last minute
  - Skimming LinkedIn while joining Zoom
  - Trying to remember who's who and why this meeting exists
- **Callout**: "That's not preparation. That's winging it. And clients notice."
- **Key message**: "Your calendar tells you when the meeting is. It doesn't help you understand what actually matters for the conversation."

### How It Works Section
- **Headline**: "Simple. Automatic. Ready."
- 3-step process:
  1. **Connect your calendar**: Securely connect Google Calendar in seconds
  2. **Sophie does the homework**: We pull together context on the company, attendees, and situation
  3. **You show up ready**: A short, skimmable brief — before every call
- Each step should have an icon/number indicator
- Optional: Add illustration or screenshot for each step

### What You Get Section
- **Headline**: "Every meeting gets a clear prep brief."
- 3 benefit cards:
  1. **Know the company**
     - What they do
     - What's happening now
     - Why this meeting matters
  2. **Know the people**
     - Who's in the room
     - Their roles and relevance
     - Who's driving the conversation
  3. **Know how to lead the call**
     - Talking points that move things forward
     - Smart questions that show preparation
     - Sales or relationship cues
- **Key message**: "Not long documents. Not fluff. Just signal."

### Social Proof Section
- **Context line**: "Used by sales reps, consultants, and advisors who spend their day in back-to-back meetings. Early access users onboarding now."
- 3 testimonials with initials, name, and role:
  1. Jake R. (Account Executive): "Saved me 20–30 minutes before every call. I used to have 6 tabs open — now I just check my brief."
  2. Sarah P. (Management Consultant): "Clients keep saying 'you really did your homework.' I didn't — Sophie did."
  3. Michael K. (Founder & CEO): "Game changer for back-to-back days. I walk into every meeting knowing exactly what to focus on."

### Why Sophie Section
- **Headline**: "Stop winging it."
- 3 key benefits:
  - **No manual prep**: Your briefs are ready before you are
  - **No scattered notes or tabs**: Everything in one clean view
  - **No awkward moments**: Never ask "So… tell me about your company?"
- **Key message**: "Just calmer, sharper conversations."

### Pricing Section
- **Headline**: "Start free. Upgrade when it sticks."
- 2 pricing cards:

  **Free Plan**
  - $0
  - 20 credits (one-time)
  - Core meeting briefs
  - Standard models
  - Community support
  - CTA: "Get Started Free"

  **Pro Plan** (marked as "Most Popular")
  - $25/month OR $20/mo billed annually
  - 200 credits every month
  - Advanced models for deeper insights
  - Priority support
  - Priority access to new features
  - CTA: "Upgrade to Pro"

- **Social proof**: "Most users upgrade after their first week."

### Security & Trust Section
- **Headline**: "You stay in control."
- Trust indicators:
  - ✓ Read-only calendar access
  - ✓ No emails sent on your behalf
  - ✓ Data used only to prepare your meetings

### Contact Section
- **Headline**: "Get in touch"
- **Subheading**: "Have a question or want to learn more? Drop your email and we'll get back to you."
- Simple email form with:
  - Email input field
  - Submit button
  - Privacy note: "We'll only use your email to respond. No spam, ever."
  - Success message: "Thanks! We'll be in touch soon."

### Final CTA Section
- **Headline**: "Stop winging important conversations."
- **Subheading**: "Be call ready — every time."
- **Primary CTA**: "Connect Google Calendar — Free"
- **Trust indicator**: "No credit card required"

### Footer
- Brand name: "Sophie" with tagline
- Navigation sections:
  - **Product**: How it works, Pricing, Contact
  - **Legal**: Terms of Service, Privacy Policy
- Copyright: "© 2025 Sophie. All rights reserved."

## Non-Functional Requirements

### Design
- Follow design token system (bg-background, bg-surface, text-text, bg-accent)
- Mobile-responsive design (mobile-first approach)
- Smooth scrolling for anchor links
- Consistent spacing and typography
- Use existing UI component library where possible

### Performance
- Fast initial load (< 3s)
- Optimize images/icons
- Lazy load below-the-fold content (if needed)

### SEO
- Proper heading hierarchy (h1, h2, h3)
- Meta descriptions
- Semantic HTML

### Accessibility
- Keyboard navigation support
- Proper ARIA labels
- Sufficient color contrast
- Focus states on interactive elements

## Out of Scope (For This Phase)

- Video demos/animations
- Blog or content marketing pages
- Live chat integration
- Multi-language support
- A/B testing infrastructure
- Advanced analytics beyond basic tracking

## Success Metrics

- Conversion rate: % of visitors who click "Connect Google Calendar"
- Scroll depth: How far users scroll through the page
- Time on page
- CTA click rate at different positions

## Technical Constraints

- Must use Next.js 14 App Router
- Must use Supabase OAuth flow for Google Calendar
- Must follow existing design token system
- Must be mobile-responsive
- Must work with existing Footer component

## Dependencies

- Existing OAuth flow (`/api/auth/login`)
- Design token system in `app/globals.css`
- UI component library in `components/ui/`
- Footer component in `components/layout/Footer.tsx`

## References

- Content source: `docs/Sophie-landing final.md`
- Current implementation: `app/(public)/page.tsx`
- Design system: `CLAUDE.md` (Design System section)
