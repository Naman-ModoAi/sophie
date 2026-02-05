import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
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
        // Legacy colors for backward compatibility
        accent: '#4F7DF3',
        background: '#FAFBFE',
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
