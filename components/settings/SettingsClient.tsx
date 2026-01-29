'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Card, Button, Badge, Tabs, Toast } from '@/components/ui';
import type { ToastVariant } from '@/components/ui';

type Props = {
  userId: string;
  user: {
    email: string;
    plan_type: 'free' | 'pro';
    email_timing: 'immediate' | '1hr' | '30min' | 'digest';
    credits_balance: number;
    credits_used_this_month: number;
  };
  calendarConnected: boolean;
  tokenExpired: boolean;
  initialToast?: { message: string; variant: ToastVariant };
};

export default function SettingsClient({ userId, user, calendarConnected, tokenExpired, initialToast }: Props) {
  const router = useRouter();
  const [emailTiming, setEmailTiming] = useState(user.email_timing);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null);
  const [isWaitingForUpdate, setIsWaitingForUpdate] = useState(false);
  const hasProcessedToast = useRef(false);

  // Handle Stripe checkout success with realtime subscription
  useEffect(() => {
    // Prevent running multiple times
    if (hasProcessedToast.current) return;

    // Check if we're coming from the success redirect (not the upgraded redirect)
    const params = new URLSearchParams(window.location.search);
    const isFromStripe = params.get('success') === 'true';
    const isAlreadyUpgraded = params.get('upgraded') === 'true';

    if (initialToast?.variant === 'success' && isFromStripe && !isAlreadyUpgraded) {
      hasProcessedToast.current = true;
      console.log('[Settings] Starting realtime subscription for user:', userId);
      setIsWaitingForUpdate(true);

      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const channel = supabase
        .channel('user-plan-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: `id=eq.${userId}`
          },
          (payload) => {
            console.log('[Settings] Realtime update received:', payload);
            if (payload.new.plan_type === 'pro') {
              console.log('[Settings] Plan upgraded to Pro, redirecting...');
              channel.unsubscribe();
              setIsWaitingForUpdate(false);
              // Force a full page reload to get updated data
              window.location.href = '/settings?upgraded=true';
            } else {
              console.log('[Settings] Plan type is:', payload.new.plan_type);
            }
          }
        )
        .subscribe();

      // Timeout after 10 seconds if webhook hasn't updated the plan
      const timeout = setTimeout(() => {
        console.log('[Settings] Timeout reached - webhook took >10s');
        channel.unsubscribe();
        setIsWaitingForUpdate(false);
        setToast({
          message: 'Payment successful! Refresh the page if your plan hasn\'t updated.',
          variant: 'success'
        });
        // Clear URL params to prevent re-triggering
        window.history.replaceState({}, '', '/settings');
      }, 10000);

      return () => {
        channel.unsubscribe();
        clearTimeout(timeout);
      };
    } else if (initialToast && !hasProcessedToast.current) {
      hasProcessedToast.current = true;
      // For non-success toasts (like canceled or upgraded), show immediately
      setToast(initialToast);
      // Clear URL params after showing toast
      setTimeout(() => {
        window.history.replaceState({}, '', '/settings');
      }, 100);
    }
  }, [initialToast, userId, router]);

  const handleSave = async () => {
    // Validate email timing
    const validOptions = ['immediate', '1hr', '30min', 'digest'];
    if (!validOptions.includes(emailTiming)) {
      setToast({ message: 'Invalid email timing option', variant: 'error' });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/settings/email-timing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_timing: emailTiming }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to save settings' }));
        throw new Error(errorData.error || 'Failed to save settings');
      }

      setToast({ message: 'Settings saved successfully', variant: 'success' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings';
      setToast({ message: errorMessage, variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleReconnect = () => {
    window.location.replace('/api/auth/login');
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
    } catch {
      setToast({ message: 'Failed to start checkout', variant: 'error' });
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/portal', { method: 'POST' });
      const { url } = await response.json();
      if (url) window.location.href = url;
    } catch {
      setToast({ message: 'Failed to open customer portal', variant: 'error' });
    }
  };

  const emailTimingOptions = [
    { value: 'immediate', label: 'Immediate', description: 'Send as soon as prep note is ready', proOnly: true },
    { value: '1hr', label: '1 hour before', description: 'Send 1 hour before meeting starts', proOnly: false },
    { value: '30min', label: '30 minutes before', description: 'Send 30 minutes before meeting starts', proOnly: false },
    { value: 'digest', label: 'Morning digest', description: 'Daily email at 8 AM with all meetings', proOnly: false },
  ];

  const tabs = [
    {
      id: 'account',
      label: 'Account',
      content: (
        <Card className="p-6">
          <div className="space-y-4">
            {/* Profile and Credit Balance */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-text/10">
              {/* Left: Avatar and Email */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center ring-0.5 ring-accent/20">
                  <span className="text-xl font-medium text-white">
                    {user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-text">{user.email.split('@')[0]}</p>
                  <p className="text-sm text-text/70">{user.email}</p>
                </div>
              </div>

              {/* Right: Credit Balance (Free users only) */}
              {user.plan_type === 'free' && (
                <div className="min-w-[200px]">
                  <label className="text-xs text-text/70 mb-1.5 block">Credit Balance</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-text/10 rounded-full h-2">
                      <div
                        className="bg-accent rounded-full h-2 transition-all"
                        style={{ width: `${Math.min((user.credits_balance / 10) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-text whitespace-nowrap">
                      {user.credits_balance} / 10
                    </span>
                  </div>
                  {user.credits_balance === 0 && (
                    <p className="text-xs text-warning mt-1">
                      Out of credits
                    </p>
                  )}
                  {user.credits_balance > 0 && user.credits_balance < 3 && (
                    <p className="text-xs text-warning mt-1">
                      Low credits
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Plan Information */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm text-text/70 mb-1 block">Current Plan</label>
                <div className="flex items-center gap-2">
                  <Badge variant={user.plan_type === 'pro' ? 'accent' : 'default'}>
                    {user.plan_type === 'free' ? 'Free Plan' : 'Pro Plan'}
                  </Badge>
                  <span className="text-sm text-text/60">
                    {user.plan_type === 'free' ? '10 credits/month' : '1000 credits/month'}
                  </span>
                </div>
              </div>
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

            {/* Plan Features Comparison */}
            <div className="p-4 bg-text/5 rounded-lg">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Free Plan */}
                <div>
                  <h3 className="font-medium text-text mb-2 flex items-center gap-2">
                    Free Plan
                    {user.plan_type === 'free' && <Badge variant="default">Current</Badge>}
                  </h3>
                  <ul className="space-y-1 text-sm text-text/70">
                    <li>✓ 10 credits/month</li>
                    <li>✓ Basic prep notes</li>
                    <li>✓ Email delivery</li>
                    <li>✓ Calendar sync</li>
                  </ul>
                </div>

                {/* Pro Plan */}
                <div>
                  <h3 className="font-medium text-text mb-2 flex items-center gap-2">
                    Pro Plan
                    {user.plan_type === 'pro' && <Badge variant="accent">Current</Badge>}
                  </h3>
                  <ul className="space-y-1 text-sm text-text/70">
                    <li>✓ 1000 credits/month</li>
                    <li>✓ Advanced prep notes</li>
                    <li>✓ Immediate email</li>
                    <li>✓ Priority support</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ),
    },
    {
      id: 'calendar',
      label: 'Calendar',
      content: (
        <Card className="p-6">
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
      ),
    },
    {
      id: 'email-timing',
      label: 'Email Timing',
      content: (
        <Card className="p-6">
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

          <div className="mt-6">
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving || emailTiming === user.email_timing}
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </Card>
      ),
    },
  ];

  return (
    <>
      {isWaitingForUpdate && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-surface p-6 rounded-lg shadow-lg max-w-md mx-4">
            <div className="flex items-center gap-4">
              <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full"></div>
              <div>
                <p className="font-medium text-text">Processing your subscription...</p>
                <p className="text-sm text-text/70 mt-1">This will only take a moment</p>
              </div>
            </div>
          </div>
        </div>
      )}
      <Tabs tabs={tabs} defaultTab="account" />
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
