'use client';

import { Card } from '@/components/ui/Card';

export default function ReferralLanding({ referrerName }: { referrerName: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-text mb-2">You've been invited!</h1>
          <p className="text-text/70">
            <span className="font-semibold text-accent">{referrerName}</span> has invited you to try MeetReady
          </p>
        </div>

        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-text mb-2">🎁 Special Offer</h2>
          <p className="text-text/70 text-sm">
            Sign up and generate your first prep note to unlock <span className="font-semibold text-accent">3 bonus meeting credits</span>!
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <h3 className="font-semibold text-text">What is MeetReady?</h3>
          <ul className="space-y-2 text-text/70 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-accent">✓</span>
              <span>Automatically research meeting attendees and their companies</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">✓</span>
              <span>Generate personalized prep notes before every meeting</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">✓</span>
              <span>Save hours of manual research every week</span>
            </li>
          </ul>
        </div>

        <form action="/api/auth/login" method="GET">
          <button
            type="submit"
            className="w-full px-4 py-2 rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 bg-accent text-surface hover:bg-accent/90 active:bg-accent/80"
          >
            Sign in with Google
          </button>
        </form>

        <p className="text-xs text-text/50 text-center mt-4">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </Card>
    </div>
  );
}
