import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-text">
              PrepFor.app
            </h1>

            {/* Value Proposition */}
            <p className="text-xl sm:text-2xl text-text/80 mb-4 max-w-2xl mx-auto">
              Never walk into a meeting unprepared
            </p>
            <p className="text-lg text-text/60 mb-12 max-w-2xl mx-auto">
              Get AI-powered research on your attendees before every call.
              Sync with Google Calendar and receive intelligent prep notes automatically.
            </p>

            {/* Google Sign-in CTA */}
            <Link
              href="/api/auth/login"
              className="inline-flex items-center gap-3 bg-surface border border-text/10 rounded-md px-8 py-4 text-text font-medium hover:shadow-lg hover:border-text/20 transition-all shadow-md"
            >
              <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <g fill="none" fillRule="evenodd">
                  <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
                </g>
              </svg>
              Sign in with Google
            </Link>
          </div>

          {/* Feature Highlights */}
          <div className="mt-24 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">
                Auto-Sync Calendar
              </h3>
              <p className="text-text/60">
                Connect your Google Calendar and automatically track upcoming meetings
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">
                AI Research
              </h3>
              <p className="text-text/60">
                Get intelligent background research on attendees and their companies
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">
                Instant Prep Notes
              </h3>
              <p className="text-text/60">
                Receive meeting preparation notes automatically before each call
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
