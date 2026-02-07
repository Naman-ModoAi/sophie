'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Toast, ToastVariant } from '@/components/ui/Toast';

interface ReferralData {
  code: string;
  referral_link: string;
  total_completed: number;
  pending_count: number;
  credits_earned: number;
}

interface ReferralStats {
  pending_referrals: Array<{
    id: string;
    referred_email: string | null;
    status: string;
    signed_up_at: string | null;
    created_at: string;
  }>;
  completed_referrals: Array<{
    id: string;
    completed_at: string;
    users: {
      email: string;
      name: string;
    };
  }>;
  credits_breakdown: Array<{
    credit_type: string;
    amount: number;
    earned_at: string;
  }>;
  next_milestone: {
    target: number;
    current: number;
    reward: string;
  } | null;
}

interface ReferralDashboardProps {
  referralData: ReferralData;
  stats: ReferralStats;
}

export default function ReferralDashboard({ referralData, stats }: ReferralDashboardProps) {
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null);

  const showToast = (message: string, variant: ToastVariant) => {
    setToast({ message, variant });
  };

  // Format date consistently for SSR/CSR to avoid hydration errors
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralData.referral_link);
      showToast('Referral link copied to clipboard!', 'success');
    } catch (error) {
      showToast('Failed to copy link', 'error');
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Try Sophi - Get 3 bonus meetings!');
    const body = encodeURIComponent(
      `Hey! I've been using Sophi to automatically prep for every meeting – it saves me hours each week.\n\nIf you take a lot of external meetings, you'll love it. Sign up with my link and get 3 bonus meetings:\n\n${referralData.referral_link}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const shareViaLinkedIn = () => {
    const url = encodeURIComponent(referralData.referral_link);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const shareViaTwitter = () => {
    const text = encodeURIComponent(
      `I've been using Sophi to automatically prep for every meeting. Check it out: ${referralData.referral_link}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}
      <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-serif font-bold text-text-primary mb-2">Invite Friends, Earn Credits</h1>
      <p className="text-text-secondary mb-8">
        Share Sophi with colleagues and earn meeting credits when they sign up
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="text-text-secondary text-sm mb-1">Total Completed</div>
          <div className="text-3xl font-bold text-text-primary">{referralData.total_completed}</div>
        </Card>
        <Card className="p-6">
          <div className="text-text-secondary text-sm mb-1">Pending Referrals</div>
          <div className="text-3xl font-bold text-text-primary">{referralData.pending_count}</div>
        </Card>
        <Card className="p-6">
          <div className="text-text-secondary text-sm mb-1">Credits Earned</div>
          <div className="text-3xl font-bold text-brand-blue">{referralData.credits_earned}</div>
        </Card>
      </div>

      {/* Referral Link Card */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-serif font-semibold text-text-primary mb-4">Your Referral Link</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={referralData.referral_link}
            readOnly
            className="flex-1 px-4 py-2 bg-background border border-text-primary/20 rounded-md text-text-primary"
          />
          <Button onClick={copyToClipboard}>Copy Link</Button>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={shareViaEmail}>
            📧 Email
          </Button>
          <Button variant="secondary" onClick={shareViaLinkedIn}>
            💼 LinkedIn
          </Button>
          <Button variant="secondary" onClick={shareViaTwitter}>
            🐦 Twitter
          </Button>
        </div>
      </Card>

      {/* Milestone Progress (Pro users only) */}
      {stats.next_milestone && (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-serif font-semibold text-text-primary mb-4">Next Milestone</h2>
          <div className="mb-2">
            <span className="text-text-secondary">Progress to {stats.next_milestone.reward}: </span>
            <span className="text-text-primary font-semibold">
              {stats.next_milestone.current}/{stats.next_milestone.target}
            </span>
          </div>
          <div className="w-full bg-text-primary/10 rounded-full h-2">
            <div
              className="bg-brand-blue h-2 rounded-full transition-all"
              style={{ width: `${(stats.next_milestone.current / stats.next_milestone.target) * 100}%` }}
            />
          </div>
        </Card>
      )}

      {/* Referral History */}
      <Card className="p-6">
        <h2 className="text-xl font-serif font-semibold text-text-primary mb-4">Referral History</h2>

        {stats.completed_referrals.length === 0 && stats.pending_referrals.length === 0 ? (
          <p className="text-text-secondary">No referrals yet. Share your link to get started!</p>
        ) : (
          <div className="space-y-4">
            {stats.completed_referrals.map((ref) => (
              <div key={ref.id} className="flex items-center justify-between py-3 border-b border-text-primary/10">
                <div>
                  <div className="text-text-primary font-medium">{ref.users.name || ref.users.email}</div>
                  <div className="text-text-secondary text-sm">
                    Completed {formatDate(ref.completed_at)}
                  </div>
                </div>
                <Badge variant="success">Completed</Badge>
              </div>
            ))}
            {stats.pending_referrals.map((ref) => (
              <div key={ref.id} className="flex items-center justify-between py-3 border-b border-text-primary/10">
                <div>
                  <div className="text-text-primary font-medium">
                    {ref.referred_email || 'Pending signup'}
                  </div>
                  <div className="text-text-secondary text-sm">
                    {ref.status === 'signed_up' ? 'Signed up' : 'Link clicked'}
                    {' '}
                    {formatDate(ref.signed_up_at || ref.created_at)}
                  </div>
                </div>
                <Badge variant="warning">Pending</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
    </>
  );
}
