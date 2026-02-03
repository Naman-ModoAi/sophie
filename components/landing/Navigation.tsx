import Link from 'next/link';

interface NavigationProps {
  className?: string;
}

export function Navigation({ className = '' }: NavigationProps) {
  return (
    <nav className={`border-b border-text/10 bg-surface/50 backdrop-blur-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex flex-col">
            <div className="text-xl font-bold text-text">MeetReady</div>
            <div className="text-xs text-text/50">Before every call</div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#how-it-works"
              className="text-sm text-text/70 hover:text-text transition-colors"
            >
              How it works
            </Link>
            <Link
              href="#pricing"
              className="text-sm text-text/70 hover:text-text transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#contact"
              className="text-sm text-text/70 hover:text-text transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/api/auth/login"
              className="inline-flex items-center px-4 py-2 bg-accent text-surface rounded-md text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              Connect Google Calendar — Free →
            </Link>
          </div>

          {/* Mobile CTA Only */}
          <div className="md:hidden">
            <Link
              href="/api/auth/login"
              className="inline-flex items-center px-4 py-2 bg-accent text-surface rounded-md text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              Get Started →
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
