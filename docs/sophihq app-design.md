## SophiHQ — Design System

**For Next.js (Tailwind CSS \+ TypeScript) | v1.0 — Feb 2026**

All design tokens are defined in the [Tailwind config](#tailwind-config) at the bottom of this doc. This section provides usage context; the config is the source of truth.

---

## 1\. Brand Essence

Calm & Confident · Smart & Thoughtful · Modern & Alive

**Theme:** Soft Gradient / Glassmorphism (inspired by Linear, Raycast). Airy gradients, generous whitespace, soft glass surfaces, serif headlines \+ clean sans-serif body, subtle animations.

---

## 2\. Design Tokens — Quick Reference

### Colors

| Token Group | Key Colors | Usage |
| :---- | :---- | :---- |
| `brand.blue` `#4F7DF3` | \+ `blue-light`, `blue-soft`, `indigo`, `violet` | Primary accent, CTAs, links, gradients |
| `semantic.*` | `teal` `#36B5A0`, `red` `#F87171`, `peach`, `pink` | Success, errors, warm/decorative accents |
| `bg.*` | `DEFAULT` `#FAFBFE`, `warm` `#F6F4FB`, `cool` `#F0F3FD` | Page & section backgrounds |
| `surface` `#FFFFFF` | — | Cards, inputs, elevated elements |
| `text.*` | `primary` `#1A1D2E`, `secondary` `#5C6178`, `muted` `#9498AD` | Headlines/body, descriptions, captions |
| `dark.*` | `base` `#1A1D2E`, `mid`, `cool`, `warm` | Dark feature/CTA section backgrounds |

### Typography

| Element | Size | Weight | Font |
| :---- | :---- | :---- | :---- |
| Hero H1 | `clamp(2.8rem,6vw,4.5rem)` | 400 | `font-serif` (Fraunces) |
| Section H2 | `clamp(2rem,4vw,2.8rem)` | 400 | `font-serif` |
| Card H3 | `1.1rem` | 400 | `font-serif` |
| Step H3 (dark) | `0.95rem` | 600 | `font-sans` (Sora) |
| Body / Desc | `0.9–1.08rem` | 300–400 | `font-sans` |
| UI Labels / Nav | `0.82rem` | 400–500 | `font-sans` |
| Section Label | `0.68rem` | 600 | `font-sans`, uppercase, `tracking-label` |
| Badges / Caps | `0.68rem` | 600 | `font-sans`, uppercase |

**Letter spacing:** Headlines `-0.02em` to `-0.03em` (`tracking-tight` / `tracking-tighter`). Section labels `0.16em` (`tracking-label`).

### Spacing & Layout

| Context | Value |
| :---- | :---- |
| Major section padding | `py-[100px] px-6` |
| Minor section padding | `py-16` to `py-20`, `px-6` |
| Wide content max-width | `960px` (benefits, how-it-works, pricing) |
| Narrow content max-width | `660–760px` (problem, why sections) |
| Hero text / subtitle | `680px` / `520px` |
| Card grid gap | `gap-5` (20px) |

### Border Radius

`rounded-lg` 20px (cards) · `rounded-md` 12px (buttons, inputs) · `rounded-nav` 16px (nav bar) · `rounded-full` (pills) · `rounded-logo` 9px

### Shadows

| Token | Usage |
| :---- | :---- |
| `shadow-soft` | Card hover states |
| `shadow-glass` | Nav bar, glass surfaces |
| `shadow-cta` | Primary buttons |
| `shadow-cta-hover` | Primary button hover |

### Glassmorphism

```css
/* Nav, badges, featured surfaces */
background: rgba(255,255,255, 0.45);   /* or 0.65 for solid surfaces */
backdrop-filter: blur(24px) saturate(180%);
-webkit-backdrop-filter: blur(24px) saturate(180%); /* Safari */
border: 1px solid rgba(255,255,255, 0.6);
box-shadow: 0 4px 24px rgba(0,0,0, 0.04);
```

### Gradients

| Token | Usage |
| :---- | :---- |
| `bg-gradient-hero` | Hero section background (pastel multi-stop) |
| `bg-gradient-accent` | **Signature** — CTAs, logo marks, badges, text gradients (`background-clip: text`) |
| `bg-gradient-dark` | Dark section backgrounds |
| `bg-gradient-cta` | CTA section backgrounds |

---

## 3\. Animation & Motion

**Defaults:** `ease` or `cubic-bezier(0.22, 1, 0.36, 1)`. Interactive: `0.3s`. Scroll reveals: `0.7s`.

| Element | Behavior |
| :---- | :---- |
| Cards | Hover: `translateY(-4px)` \+ `shadow-soft` |
| Buttons | Hover: `translateY(-2px)` \+ increased shadow |
| CTA arrow | Hover: `translateX(3px)`, `0.25s ease` |
| Nav background | On scroll \>20px: `bg-white/80`, add shadow |
| Card accent bar | Hover: `opacity 0→1`, 3px height, brand color |
| Badge dot | `animate-pulse-dot` (2s ease infinite) |
| Floating orbs | `animate-float` (20s infinite), 300–500px circles, `blur(80–100px)`, brand colors at 8–12% opacity |

**Scroll reveals:** Start `opacity-0 translateY(28px)` → animate to `opacity-1 translateY(0)`. Use Intersection Observer (`threshold: 0.1`, `rootMargin: "0px 0px -40px 0px"`). Stagger grouped items by `0.1s`.

---

## 4\. Component Patterns

### Primary Button

```
bg-gradient-accent text-white text-[0.95rem] font-semibold
px-9 py-[18px] rounded-md shadow-cta
hover:translate-y-[-2px] hover:shadow-cta-hover transition-all duration-300
```

### Secondary Button

```
bg-white/65 backdrop-blur-[12px] text-secondary text-[0.88rem]
px-6 py-[14px] rounded-md border border-white/60
hover:border-brand-blue/20 hover:text-brand-blue hover:bg-white/80
```

### Icon Badges

```
w-[36–44px] h-[36–44px] rounded-[10px]
bg-gradient-to-br from-{color}/10 to-{color}/4
icon: 18–22px, stroke-width-2
```

### Form Inputs

```
bg-white border-[1.5px] border-black/8 rounded-md
px-[18px] py-[14px] text-text-primary placeholder:text-text-muted
focus:border-brand-blue focus:ring-3 focus:ring-brand-blue/10
```

---

## 5\. Responsive Breakpoints

| Breakpoint | Width | Key Changes |
| :---- | :---- | :---- |
| Mobile | ≤768px | 1-col grids, stacked CTAs, nav collapsed |
| Tablet | 769–960px | 2-col grids where possible |
| Desktop | \>960px | Full 3-col grids, side-by-side layouts |

Use Tailwind defaults: `sm` 640, `md` 768, `lg` 1024, `xl` 1280\. Primary breakpoint is `md`.

---

## 6\. Icons

Use **Lucide React** (`npm install lucide-react`). Stroke width: `2` (standard) or `2.5` (emphasis). Default size: `16–22px`.

| Usage | Lucide Name |
| :---- | :---- |
| Error | `X` |
| Success | `Check` |
| People | `Users` |
| Company | `Home` / `Building2` |
| Conversation | `MessageSquare` |
| Analytics | `BarChart3` |
| Read-only | `Eye` |
| Security | `Shield` |
| Verified | `CheckCircle` |
| CTA Arrow | `ArrowRight` |

---

## 7\. Tailwind Config

Copy into `tailwind.config.ts`:

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      colors: {
        brand: {
          blue: '#4F7DF3',
          'blue-light': '#7B9EF8',
          'blue-soft': '#EDF1FE',
          indigo: '#5B4FE3',
          violet: '#7C5CFC',
        },
        semantic: {
          teal: '#36B5A0',
          red: '#F87171',
          peach: '#F0A882',
          pink: '#E87EA1',
        },
        bg: {
          DEFAULT: '#FAFBFE',
          warm: '#F6F4FB',
          cool: '#F0F3FD',
        },
        surface: '#FFFFFF',
        dark: {
          base: '#1A1D2E',
          mid: '#252A42',
          cool: '#1E2B3A',
          warm: '#2A2D42',
        },
        text: {
          primary: '#1A1D2E',
          secondary: '#5C6178',
          muted: '#9498AD',
        },
      },
      borderRadius: {
        lg: '20px',
        md: '12px',
        nav: '16px',
        logo: '9px',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(79,125,243,0.06), 0 12px 40px rgba(79,125,243,0.08)',
        glass: '0 4px 24px rgba(0,0,0,0.04)',
        cta: '0 4px 16px rgba(79,125,243,0.35)',
        'cta-hover': '0 8px 28px rgba(79,125,243,0.45)',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #EEF0FB 0%, #F8F0F6 35%, #F0F4FE 65%, #EAF6F4 100%)',
        'gradient-accent': 'linear-gradient(135deg, #4F7DF3 0%, #7C5CFC 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1A1D2E 0%, #252A42 50%, #1E2B3A 100%)',
        'gradient-cta': 'linear-gradient(135deg, #2A2D42 0%, #1A2B42 100%)',
      },
      letterSpacing: {
        tight: '-0.02em',
        tighter: '-0.03em',
        label: '0.16em',
      },
      animation: {
        float: 'float 20s ease-in-out infinite',
        'pulse-dot': 'pulse-dot 2s ease infinite',
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22,1,0.36,1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(30px,-20px) scale(1.05)' },
          '66%': { transform: 'translate(-20px,15px) scale(0.95)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.85)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(28px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 8\. Google Fonts Setup

Add to `src/app/layout.tsx`:

```ts
import { Sora, Fraunces } from 'next/font/google';

const sora = Sora({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
  axes: ['opsz'],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${sora.variable} ${fraunces.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

