import Link from 'next/link';

export function FinalCTA() {
  return (
    <section className="py-[100px] px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Headline */}
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-text-primary mb-4">
          Stop winging important conversations.
        </h2>

        {/* Subheading */}
        <p className="text-xl text-text-secondary mb-10">
          Be call ready — every time.
        </p>

        {/* CTA Button */}
        <a
          href="/api/auth/login"
          className="inline-flex items-center gap-3 bg-brand-blue text-white px-8 py-4 rounded-lg text-lg font-sans font-semibold hover:bg-brand-blue/90 transition-all duration-300 shadow-cta hover:shadow-cta-hover mb-4"
        >
          <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fillRule="evenodd">
              <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="currentColor" opacity="0.9"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="currentColor" opacity="0.9"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="currentColor" opacity="0.9"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="currentColor" opacity="0.9"/>
            </g>
          </svg>
          Connect Google Calendar — Free
        </a>

        {/* Trust Indicator */}
        <p className="text-sm text-text-muted">
          No credit card required
        </p>
      </div>
    </section>
  );
}
