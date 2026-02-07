import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface border-t border-text-primary/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="text-xl font-bold font-serif text-text-primary mb-1">Sophi</div>
            <div className="text-sm text-text-muted italic">Before every call.</div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4">Product</h4>
            <div className="flex flex-col gap-3">
              <Link
                href="#how-it-works"
                className="text-sm text-text-secondary hover:text-text-primary transition-all duration-300"
              >
                How it works
              </Link>
              <Link
                href="#pricing"
                className="text-sm text-text-secondary hover:text-text-primary transition-all duration-300"
              >
                Pricing
              </Link>
              <Link
                href="#contact"
                className="text-sm text-text-secondary hover:text-text-primary transition-all duration-300"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4">Legal</h4>
            <div className="flex flex-col gap-3">
              <Link
                href="/terms"
                className="text-sm text-text-secondary hover:text-text-primary transition-all duration-300"
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-text-secondary hover:text-text-primary transition-all duration-300"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-text-primary/10">
          <p className="text-sm text-text-secondary text-center">
            © {currentYear} Sophi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
