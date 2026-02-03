import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-text/10 bg-surface/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-1">
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-text">PrepFor.app</div>
            <div className="flex items-center gap-8">
              <Link href="#features" className="text-sm text-text/70 hover:text-text transition-colors">
                How it works
              </Link>
              <a
                href="/api/auth/login"
                className="inline-flex items-center px-4 py-2 bg-accent text-surface rounded-md text-sm font-medium hover:bg-accent/90 transition-colors"
              >
                Try for free →
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-6 pt-4 pb-10 sm:pt-8 sm:pb-24">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium mb-8">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="3" />
              </svg>
              AI-powered meeting prep
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
              <span className="text-text">Never walk into a </span>
              <span className="text-accent">meeting unprepared</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-1xl text-text/60 mb-8 max-w-3xl mx-auto leading-relaxed">
              Get instant insights on attendees and companies. AI research delivered before every call — no manual work required.
            </p>

            {/* CTA Button */}
            <a
              href="/api/auth/login"
              className="inline-flex items-center gap-3 bg-accent text-surface px-8 py-4 rounded-lg text-lg font-semibold hover:bg-accent/90 transition-all shadow-lg hover:shadow-xl mb-4"
            >
              <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <g fill="none" fillRule="evenodd">
                  <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="currentColor" opacity="0.9"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="currentColor" opacity="0.9"/>
                  <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="currentColor" opacity="0.9"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="currentColor" opacity="0.9"/>
                </g>
              </svg>
              Start with Google Calendar →
            </a>
            <p className="text-sm text-text/50">
              Syncs with Google Calendar • Free to get started
            </p>
          </div>

          {/* Feature Highlights */}
          <div id="features" className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="p-6 rounded-xl bg-surface border border-text/10 hover:border-accent/30 transition-colors">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">
                Auto-Sync Calendar
              </h3>
              <p className="text-text/60 text-sm leading-relaxed">
                Connect once, and we'll automatically track all your upcoming meetings from Google Calendar
              </p>
            </div>

            <div className="p-6 rounded-xl bg-surface border border-text/10 hover:border-accent/30 transition-colors">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">
                AI-Powered Research
              </h3>
              <p className="text-text/60 text-sm leading-relaxed">
                Get intelligent background research on every attendee and their company automatically
              </p>
            </div>

            <div className="p-6 rounded-xl bg-surface border border-text/10 hover:border-accent/30 transition-colors">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">
                Instant Prep Notes
              </h3>
              <p className="text-text/60 text-sm leading-relaxed">
                Receive comprehensive meeting briefs before every call — talking points, context, and key insights
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
