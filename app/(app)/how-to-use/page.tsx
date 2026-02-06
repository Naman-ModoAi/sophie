import { getAuthUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default async function HowToUsePage() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/');
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Page Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-serif font-bold text-text-primary mb-4">How to Use SophiHQ</h1>
        <p className="text-lg text-text-secondary leading-relaxed">
          SophiHQ helps you prepare for meetings by automatically researching attendees and companies.
          Follow this guide to get the most out of the platform.
        </p>
      </div>

      {/* Guide Sections */}
      <div className="space-y-16">

        {/* Section 1: Sign In with Google */}
        <section>
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-2xl font-bold text-brand-blue">1</span>
            <h2 className="text-3xl font-serif font-bold text-text-primary">Sign In with Google</h2>
          </div>

          <p className="text-text-secondary leading-relaxed mb-6">
            Get started by signing in with your Google account. This automatically connects your Google Calendar
            and enables secure authentication through Supabase.
          </p>

          {/* Screenshot */}
          <div className="mb-6 rounded-lg border border-text-primary/10 shadow-soft overflow-hidden">
            <img src="/images/guide/landing-page.png" alt="Landing page with Sign in with Google button" className="w-full h-auto" />
          </div>

          <ul className="space-y-2 text-text-secondary">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-brand-blue mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>One-click sign in with your Google account</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-brand-blue mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Automatic Google Calendar access for meeting sync</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-brand-blue mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Secure authentication powered by Supabase</span>
            </li>
          </ul>
        </section>

        {/* Section 2: Calendar Connection */}
        <section>
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-2xl font-bold text-brand-blue">2</span>
            <h2 className="text-3xl font-serif font-bold text-text-primary">Calendar Connection</h2>
          </div>

          <p className="text-text-secondary leading-relaxed mb-6">
            Your Google Calendar automatically syncs every time you load the dashboard. You can also manually
            resync from the Settings page if you need to refresh your meetings.
          </p>

          {/* Screenshot */}
          <div className="mb-6 rounded-lg border border-text-primary/10 shadow-soft overflow-hidden">
            <img src="/images/guide/settings-calendar.png" alt="Settings page with calendar connection and resync button" className="w-full h-auto" />
          </div>

          <ul className="space-y-2 text-text-secondary mb-6">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-brand-blue mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Automatically syncs the next 7 days of meetings</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-brand-blue mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Manual resync available in Settings if needed</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-brand-blue mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Reconnect your calendar if the connection is lost</span>
            </li>
          </ul>

          <Link href="/settings">
            <Button variant="secondary">Go to Settings →</Button>
          </Link>
        </section>

        {/* Section 3: View Your Meetings */}
        <section>
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-2xl font-bold text-brand-blue">3</span>
            <h2 className="text-3xl font-serif font-bold text-text-primary">View Your Meetings</h2>
          </div>

          <p className="text-text-secondary leading-relaxed mb-6">
            Your dashboard displays all upcoming meetings in chronological order. Meetings are automatically
            categorized as "Internal" (attendees from your domain) or "External" (attendees from other companies).
          </p>

          {/* Screenshot */}
          <div className="mb-6 rounded-lg border border-text-primary/10 shadow-soft overflow-hidden">
            <img src="/images/guide/dashboard-meetings.png" alt="Dashboard with meeting list and internal/external badges" className="w-full h-auto" />
          </div>

          <ul className="space-y-2 text-text-secondary mb-6">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-brand-blue mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Upcoming meetings displayed chronologically</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-brand-blue mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Internal vs External badges for easy identification</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-brand-blue mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Click any meeting to see full details and attendee information</span>
            </li>
          </ul>

          <Link href="/dashboard">
            <Button variant="secondary">Go to Dashboard →</Button>
          </Link>
        </section>

        {/* Section 4: Generate Prep Notes */}
        <section>
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-2xl font-bold text-brand-blue">4</span>
            <h2 className="text-3xl font-serif font-bold text-text-primary">Generate Prep Notes</h2>
          </div>

          <p className="text-text-secondary leading-relaxed mb-6">
            For meetings with external attendees, click the "Prep Notes" tab and generate AI-powered research
            on attendees and their companies. The system uses 1 credit per external attendee and delivers
            comprehensive prep notes directly to your email.
          </p>

          {/* Screenshot */}
          <div className="mb-6 rounded-lg border border-text-primary/10 shadow-soft overflow-hidden">
            <img src="/images/guide/meeting-prep-notes.png" alt="Meeting detail panel with Prep Notes tab and Generate button" className="w-full h-auto" />
          </div>

          <ul className="space-y-2 text-text-secondary">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-brand-blue mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Navigate to the "Prep Notes" tab in any meeting</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-brand-blue mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Click "Generate Prep Notes" to start AI research</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-brand-blue mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>1 credit per external attendee (company research included)</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-brand-blue mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>AI researches each attendee's background and company information</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-brand-blue mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Prep notes delivered directly to your email</span>
            </li>
          </ul>

          <div className="mt-6 p-4 bg-brand-blue/10 border border-brand-blue/20 rounded-lg">
            <p className="text-sm text-text-primary/80">
              <strong>Free Plan:</strong> 20 credits/month • <strong>Pro Plan:</strong> 200 credits/month with rollover
            </p>
          </div>
        </section>

        {/* Section 5: Edit Attendee Information */}
        <section>
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-2xl font-bold text-brand-blue">5</span>
            <h2 className="text-3xl font-serif font-bold text-text-primary">Edit Attendee Information</h2>
          </div>

          <p className="text-text-secondary leading-relaxed mb-6">
            SophiHQ automatically detects attendee names and companies from calendar invites, but sometimes
            this information is incomplete. You can edit attendee details to ensure accurate AI research.
          </p>

          {/* Screenshot */}
          <div className="mb-6 rounded-lg border border-text-primary/10 shadow-soft overflow-hidden">
            <img src="/images/guide/attendee-edit.png" alt="Attendee list with edit mode and editable fields" className="w-full h-auto" />
          </div>

          <ul className="space-y-2 text-text-secondary">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-brand-blue mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Automatic detection from Google Calendar invites</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-brand-blue mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Click "Edit" on any external attendee to modify details</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-brand-blue mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Update name and company information if incorrect or incomplete</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-brand-blue mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Accurate information improves AI research quality</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-brand-blue mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Click "Save" to confirm your changes</span>
            </li>
          </ul>
        </section>

      </div>

      {/* Footer CTA */}
      <div className="mt-16 pt-8 border-t border-text-primary/10">
        <div className="text-center">
          <h3 className="text-2xl font-serif font-bold text-text-primary mb-4">Ready to Start?</h3>
          <p className="text-text-secondary mb-6">
            Head to your dashboard to see upcoming meetings and generate your first prep notes.
          </p>
          <Link href="/dashboard">
            <Button variant="primary">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
