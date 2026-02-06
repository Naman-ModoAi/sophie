import Link from 'next/link';

interface NavigationProps {
  className?: string;
}

export function Navigation({ className = '' }: NavigationProps) {
  return (
    <nav className={`glass-nav ${className}`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex flex-col">
            <div className="text-xl font-bold text-text-primary">SophiHQ</div>
            <div className="text-xs text-text-muted">Before every call</div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#how-it-works"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              How it works
            </Link>
            <Link
              href="#pricing"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#contact"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Contact
            </Link>
            <a
              href="/api/auth/login"
              className="inline-flex items-center px-6 py-3 bg-gradient-accent text-white rounded-md text-sm font-semibold shadow-cta hover:translate-y-[-2px] hover:shadow-cta-hover transition-all duration-300"
            >
              Get Started →
            </a>
          </div>

          {/* Mobile CTA Only */}
          <div className="md:hidden">
            <a
              href="/api/auth/login"
              className="inline-flex items-center px-4 py-2 bg-gradient-accent text-white rounded-md text-sm font-semibold shadow-cta transition-all"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
