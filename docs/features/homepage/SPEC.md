# Homepage Redesign - Feature Specification

## Overview
Complete redesign of the Sophie homepage with a premium, modern aesthetic featuring soft gradients, glassmorphism, and refined typography.

## Goals
1. **Visual Upgrade**: Transform from simple teal design to sophisticated gradient-based design system
2. **Brand Elevation**: Position Sophie as a premium, thoughtful product
3. **Improved Copy**: Implement concise, benefit-focused messaging
4. **Modern UX**: Add smooth animations, glass effects, and interactive elements

## Design System Changes

### Typography
- **Add Fonts**: Fraunces (serif for headlines), Sora (sans for body)
- **Hierarchy**: Larger, softer headlines with more whitespace

### Colors
- **Old**: Single teal accent, gray backgrounds
- **New**: Multi-color brand palette (blues, purples, teal), gradient backgrounds
  - Primary: `#4F7DF3` (brand blue)
  - Accent gradient: Blue → Purple
  - Semantic: Teal, peach, pink for variety

### Visual Effects
- **Glassmorphism**: Nav bar, badges, cards with backdrop blur
- **Gradients**: Hero background, CTA buttons, text accents
- **Animations**: Floating orbs, scroll reveals, hover states
- **Shadows**: Softer, more sophisticated shadow system

## Content Changes

### New Copy Structure (from design doc)
1. **Hero**: "Never walk into a meeting unprepared"
2. **Social Proof**: Inline credibility statement
3. **Problem**: "You shouldn't have to Google people 2 minutes before a call"
4. **How It Works**: 3-step process
5. **What You Get**: Feature → Benefit mapping
6. **Who It's For**: Target personas
7. **Why Sophie**: Key differentiators
8. **CTA**: "Be ready for every meeting"

## Technical Implementation

### Phase 1: Design System Setup
- [ ] Update Tailwind config with new color tokens
- [ ] Install and configure Fraunces + Sora fonts
- [ ] Add new design tokens to globals.css
- [ ] Create utility classes for glassmorphism, gradients

### Phase 2: Component Updates
- [ ] Update Navigation with glass effect
- [ ] Redesign Hero with gradient background and new copy
- [ ] Update ProblemSection with new messaging
- [ ] Redesign HowItWorks with step cards
- [ ] Update WhatYouGet with benefit focus
- [ ] Add WhoItsFor section (new)
- [ ] Update WhySophie section
- [ ] Redesign PricingSection (if needed)
- [ ] Update FinalCTA with new copy
- [ ] Keep Footer as-is (or minor updates)

### Phase 3: Animations & Polish
- [ ] Add floating orb backgrounds
- [ ] Implement scroll reveal animations
- [ ] Add hover states to cards and buttons
- [ ] Optimize for mobile responsiveness

## Success Criteria
- [ ] Design matches visual spec (gradients, glass, fonts)
- [ ] Copy matches content doc
- [ ] Animations are smooth (60fps)
- [ ] Mobile responsive
- [ ] Page load performance maintained

## Scope
**IMPORTANT**: This design system applies to the **entire application**, including:
- Landing page (public homepage)
- Dashboard
- Settings
- All authenticated app pages

The new design tokens, fonts, and visual style will be used across all pages.

## Non-Goals
- Backend changes
- Authentication flow changes
- Database schema changes

## References
- Content: `/docs/Sophie Home page.md`
- Design system: `/docs/Sophie app-design.md`
- Current page: `/app/(public)/page.tsx`
