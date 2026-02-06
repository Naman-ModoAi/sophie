# Homepage Redesign - Implementation Checklist

## Phase 1: Design System Setup ✅

### 1.1 Tailwind Configuration
- [ ] Update `tailwind.config.ts` with new color tokens
  - [ ] Brand colors (blue, indigo, violet)
  - [ ] Semantic colors (teal, red, peach, pink)
  - [ ] Background variants (default, warm, cool)
  - [ ] Dark theme colors
  - [ ] Text colors (primary, secondary, muted)
- [ ] Add new border radius values (lg: 20px, md: 12px, nav: 16px, logo: 9px)
- [ ] Add custom shadows (soft, glass, cta, cta-hover)
- [ ] Add gradient presets (hero, accent, dark, cta)
- [ ] Add letter spacing tokens
- [ ] Add animation keyframes (float, pulse-dot, fade-up)

### 1.2 Font Setup
- [ ] Install Fraunces and Sora from next/font/google
- [ ] Configure font variables in root layout
- [ ] Update Tailwind to use new font families

### 1.3 Global Styles
- [ ] Update `globals.css` with new design tokens
- [ ] Add glassmorphism utility classes
- [ ] Add gradient utilities
- [ ] Test design tokens in isolation

---

## Phase 2: Component Updates 🔄

### 2.1 Navigation Component
- [ ] Add glass effect (backdrop blur, transparency)
- [ ] Update colors to match new palette
- [ ] Add scroll-triggered solid background
- [ ] Update button styles to new design
- [ ] Test responsive behavior

### 2.2 Hero Section
- [ ] Implement gradient background
- [ ] Add floating orb decorations
- [ ] Update headline copy: "Never walk into a meeting unprepared"
- [ ] Update subheadline and CTA
- [ ] Use Fraunces font for headline
- [ ] Add primary CTA button with gradient
- [ ] Implement scroll reveal animation

### 2.3 Social Proof (New)
- [ ] Add inline section below hero
- [ ] Copy: "Used by sales reps, consultants, and advisors..."
- [ ] Subtle styling, doesn't need full section

### 2.4 Problem Section
- [ ] Update copy: "You shouldn't have to..."
- [ ] Use bullet points for pain points
- [ ] Update styling with new colors
- [ ] Add subtle card hover effects

### 2.5 How It Works
- [ ] Redesign as 3-step cards
- [ ] Add icon badges with gradients
- [ ] Update copy to match content doc
- [ ] Add stagger animation on scroll reveal

### 2.6 What You Get
- [ ] Focus on benefits over features
- [ ] Update copy: "Meeting briefs that include..."
- [ ] Redesign feature cards
- [ ] Add icons with gradient backgrounds

### 2.7 Who It's For (New Section)
- [ ] Create new component
- [ ] List personas: Sales reps, consultants, lawyers, etc.
- [ ] Simple, clean layout
- [ ] "If your work depends on conversations..."

### 2.8 Why Sophie
- [ ] Update with new copy (3 points)
- [ ] "No manual prep / No scattered notes / No awkward moments"
- [ ] Simplified layout

### 2.9 Pricing Section
- [ ] Update styling to match new design
- [ ] Keep existing functionality
- [ ] Add glass effect to cards
- [ ] Update button styles

### 2.10 Final CTA
- [ ] Update copy: "Be ready for every meeting"
- [ ] Dark gradient background
- [ ] Glass button effect
- [ ] Full-width section

### 2.11 Footer
- [ ] Minor styling updates if needed
- [ ] Ensure colors match new palette

---

## Phase 3: Animations & Polish 🎨

### 3.1 Background Effects
- [ ] Add floating orb elements (CSS only, no JS)
- [ ] Blur and subtle colors
- [ ] Multiple sizes and speeds

### 3.2 Scroll Animations
- [ ] Implement Intersection Observer for scroll reveals
- [ ] Add fade-up animation to sections
- [ ] Stagger animations for card grids
- [ ] Test performance

### 3.3 Interactive States
- [ ] Card hover: translateY + shadow
- [ ] Button hover: translateY + increased shadow
- [ ] CTA arrow slide animation
- [ ] Nav scroll effect
- [ ] Smooth transitions (0.3s ease)

### 3.4 Responsive Design
- [ ] Test mobile layout (≤768px)
- [ ] Test tablet layout (769-960px)
- [ ] Ensure text sizes use clamp()
- [ ] Stack elements properly on mobile
- [ ] Test CTA buttons on small screens

---

## Phase 4: Testing & Optimization ✔️

### 4.1 Visual QA
- [ ] Compare against design doc
- [ ] Check all gradients render correctly
- [ ] Verify font loading and fallbacks
- [ ] Test glassmorphism on different backgrounds
- [ ] Check color contrast for accessibility

### 4.2 Performance
- [ ] Check Lighthouse score
- [ ] Optimize font loading
- [ ] Ensure animations don't cause jank
- [ ] Test on slower devices

### 4.3 Cross-Browser Testing
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (backdrop-filter support)
- [ ] Mobile browsers

### 4.4 Content Review
- [ ] Verify all copy matches content doc
- [ ] Check for typos
- [ ] Ensure CTAs are clear
- [ ] Review tone consistency

---

## Completion Criteria

### Must Have
- ✅ All Phase 1 tasks (design system)
- ✅ All Phase 2 tasks (components)
- ✅ Mobile responsive
- ✅ New copy implemented

### Should Have
- ✅ Phase 3 animations
- ✅ Glassmorphism effects
- ✅ Floating orbs

### Nice to Have
- Advanced micro-interactions
- Additional animation polish
- A/B testing setup

---

## Notes
- Keep existing authentication flow unchanged
- Don't modify dashboard/app design
- Maintain existing functionality (Google Calendar sign-in)
- Remove old components if completely replaced
