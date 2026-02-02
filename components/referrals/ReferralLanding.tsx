'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function ReferralLanding({ referrerName }: { referrerName: string }) {
  const handleSignUp = () => {
    window.location.href = '/api/auth/login';
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-text mb-2">You've been invited!</h1>
          <p className="text-text/70">
            <span className="font-semibold text-accent">{referrerName}</span> has invited you to try PrepFor
          </p>
        </div>

        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-text mb-2">🎁 Special Offer</h2>
          <p className="text-text/70 text-sm">
            Sign up and generate your first prep note to unlock <span className="font-semibold text-accent">3 bonus meeting credits</span>!
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <h3 className="font-semibold text-text">What is PrepFor?</h3>
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

        <Button onClick={handleSignUp} className="w-full">
          Sign in with Google
        </Button>

        <p className="text-xs text-text/50 text-center mt-4">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </Card>
    </div>
  );
}
