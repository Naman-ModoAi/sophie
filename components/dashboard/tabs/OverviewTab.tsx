'use client';

import { SummaryCard } from '../SummaryCard';

/**
 * OverviewTab Component
 *
 * Displays meeting overview, summary, and quick stats.
 * Includes meeting details, summary text, and statistics about attendees,
 * companies, and talking points.
 *
 * @param prepNote - The complete PrepNote object
 */

interface PrepNote {
  meeting_id: string;
  meeting_title: string;
  meeting_time: string;
  generated_at: string;
  summary: string;
  suggested_talking_points: string[];
  attendees: Array<{
    name: string;
    current_role?: string;
    company?: string;
    background?: string;
    tenure?: string;
    linkedin_url?: string;
    talking_points: string[];
    recent_activity?: string;
  }>;
  companies: Array<{
    name: string;
    domain: string;
    overview?: string;
    industry?: string;
    size?: string;
    funding?: string;
    products: string[];
    recent_news: string[];
  }>;
}

interface OverviewTabProps {
  prepNote: PrepNote;
}

function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

function formatTimeAgo(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  } catch {
    return 'recently';
  }
}

export function OverviewTab({ prepNote }: OverviewTabProps) {
  // Calculate stats
  const totalAttendees = prepNote.attendees.length;
  const totalCompanies = prepNote.companies.length;
  const totalTalkingPoints =
    prepNote.suggested_talking_points.length +
    prepNote.attendees.reduce((sum, att) => sum + att.talking_points.length, 0);
  const industries = new Set(prepNote.companies.map((c) => c.industry).filter(Boolean));
  const industriesCount = industries.size;

  return (
    <div className="space-y-6">
      {/* Meeting Details Card */}
      <div className="p-4 bg-surface rounded-lg border border-text/10 space-y-3">
        <h3 className="text-base font-semibold text-text">Meeting Details</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-text/70">Title: </span>
            <span className="text-text font-medium">{prepNote.meeting_title}</span>
          </div>
          {prepNote.meeting_time && (
            <div>
              <span className="text-text/70">Scheduled: </span>
              <span className="text-text">{formatDateTime(prepNote.meeting_time)}</span>
            </div>
          )}
          {prepNote.generated_at && (
            <div>
              <span className="text-text/70">Research Generated: </span>
              <span className="text-text">{formatTimeAgo(prepNote.generated_at)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Summary Card */}
      <div className="p-4 bg-surface rounded-lg border border-text/10 space-y-3">
        <h3 className="text-base font-semibold text-text">Summary</h3>
        <p className="text-sm text-text/90 leading-relaxed">{prepNote.summary}</p>
      </div>

      {/* Quick Stats Grid */}
      <div>
        <h3 className="text-base font-semibold text-text mb-3">Quick Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            icon="👥"
            title="Attendees"
            value={totalAttendees}
            subtitle={`${totalAttendees} total`}
          />
          <SummaryCard
            icon="🏢"
            title="Companies"
            value={totalCompanies}
            subtitle={industriesCount > 0 ? `${industriesCount} industries` : undefined}
          />
          <SummaryCard
            icon="💡"
            title="Talking Points"
            value={totalTalkingPoints}
            subtitle={`${prepNote.suggested_talking_points.length} general + ${
              totalTalkingPoints - prepNote.suggested_talking_points.length
            } specific`}
          />
          <SummaryCard
            icon="✓"
            title="Status"
            value="Ready"
            subtitle="Research complete"
            variant="success"
          />
        </div>
      </div>
    </div>
  );
}
