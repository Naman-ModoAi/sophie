// Landing Page Type Definitions

export interface CTAButton {
  text: string;
  href: string;
}

export interface NavigationLink {
  label: string;
  href: string;
}

export interface HeroProps {
  headline: string;
  highlightedText: string;
  subheadline: string;
  primaryCTA: CTAButton;
  secondaryCTA: CTAButton;
  trustIndicator: string;
}

export interface FeatureStep {
  number: number;
  title: string;
  description: string;
}

export interface BenefitCard {
  icon: React.ReactNode;
  title: string;
  features: string[];
}

export interface Testimonial {
  quote: string;
  initials: string;
  name: string;
  role: string;
}

export interface PricingPlan {
  name: 'free' | 'pro';
  price: {
    monthly: number;
    annually?: number;
  };
  features: string[];
  cta: CTAButton;
  badge?: string;
  isPopular?: boolean;
}

export interface TrustIndicator {
  text: string;
  icon?: React.ReactNode;
}
