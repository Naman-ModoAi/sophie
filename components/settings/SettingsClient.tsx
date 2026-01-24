'use client';

import { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';

type Props = {
  user: {
    email: string;
    plan_type: 'free' | 'pro';
    email_timing: 'immediate' | '1hr' | '30min' | 'digest';
    meetings_used: number;
  };
  calendarConnected: boolean;
  tokenExpired: boolean;
};

export default function SettingsClient({ user, calendarConnected, tokenExpired }: Props) {
  const [emailTiming, setEmailTiming] = useState(user.email_timing);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      const response = await fetch('/api/settings/email-timing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_timing: emailTiming }),
      });

      if (!response.ok) throw new Error('Failed to save');

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReconnect = () => {
    window.location.href = '/api/auth/login';
  };

  const handleUpgrade = async (priceId: string) => {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const { url } = await response.json();
      if (url) window.location.href = url;
    } catch (error) {
      alert('Failed to start checkout');
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/portal', { method: 'POST' });
      const { url } = await response.json();
      if (url) window.location.href = url;
    } catch (error) {
      alert('Failed to open customer portal');
    }
  };

  const emailTimingOptions = [
    { value: 'immediate', label: 'Immediate', description: 'Send as soon as prep note is ready', proOnly: true },
    { value: '1hr', label: '1 hour before', description: 'Send 1 hour before meeting starts', proOnly: false },
    { value: '30min', label: '30 minutes before', description: 'Send 30 minutes before meeting starts', proOnly: false },
    { value: 'digest', label: 'Morning digest', description: 'Daily email at 8 AM with all meetings', proOnly: false },
  ];

  return (
    <div className="space-y-6">
      {/* Account Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-text mb-4">Account</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-text/70">Email</label>
            <p className="text-text">{user.email}</p>
          </div>
          <div>
            <label className="text-sm text-text/70">Plan</label>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={user.plan_type === 'pro' ? 'accent' : 'default'}>
                {user.plan_type.toUpperCase()}
              </Badge>
              {user.plan_type === 'free' ? (
                <Button variant="primary" onClick={() => handleUpgrade(process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID!)}>
                  Upgrade to Pro
                </Button>
              ) : (
                <Button variant="secondary" onClick={handleManageSubscription}>
                  Manage Subscription
                </Button>
              )}
            </div>
          </div>
          {user.plan_type === 'free' && (
            <div>
              <label className="text-sm text-text/70">Monthly Usage</label>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-text/10 rounded-full h-2">
                  <div
                    className="bg-accent rounded-full h-2 transition-all"
                    style={{ width: `${Math.min((user.meetings_used / 5) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-sm text-text">
                  {user.meetings_used} / 5 meetings
                </span>
              </div>
              {user.meetings_used >= 5 && (
                <p className="text-sm text-warning mt-2">
                  ⚠️ You've reached your free plan limit. Upgrade to Pro for unlimited meetings.
                </p>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Calendar Connection */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-text mb-4">Calendar Connection</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text">Google Calendar</p>
              <p className="text-sm text-text/70">
                {calendarConnected
                  ? tokenExpired
                    ? 'Connected but token expired'
                    : 'Connected and syncing'
                  : 'Not connected'}
              </p>
            </div>
            <Badge variant={calendarConnected && !tokenExpired ? 'success' : 'warning'}>
              {calendarConnected && !tokenExpired ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
          {(!calendarConnected || tokenExpired) && (
            <Button variant="primary" onClick={handleReconnect}>
              {tokenExpired ? 'Reconnect Calendar' : 'Connect Calendar'}
            </Button>
          )}
        </div>
      </Card>

      {/* Email Timing Preferences */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-text mb-4">Email Timing</h2>
        <p className="text-sm text-text/70 mb-4">
          Choose when to receive meeting prep notes via email
        </p>
        <div className="space-y-3">
          {emailTimingOptions.map((option) => (
            <label
              key={option.value}
              className={`
                flex items-start p-4 border rounded-lg cursor-pointer transition-all
                ${emailTiming === option.value
                  ? 'border-accent bg-accent/5'
                  : 'border-text/10 hover:border-text/20'
                }
                ${option.proOnly && user.plan_type === 'free' ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input
                type="radio"
                name="email_timing"
                value={option.value}
                checked={emailTiming === option.value}
                onChange={(e) => setEmailTiming(e.target.value as typeof emailTiming)}
                disabled={option.proOnly && user.plan_type === 'free'}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-text">{option.label}</span>
                  {option.proOnly && <Badge variant="accent">Pro</Badge>}
                </div>
                <p className="text-sm text-text/70 mt-1">{option.description}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-6">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving || emailTiming === user.email_timing}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
          {saved && <span className="text-sm text-accent">✓ Saved successfully</span>}
        </div>
      </Card>
    </div>
  );
}
