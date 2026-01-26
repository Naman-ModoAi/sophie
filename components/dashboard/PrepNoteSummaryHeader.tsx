'use client';

import { SummaryCard } from './SummaryCard';

/**
 * PrepNoteSummaryHeader Component
 *
 * Displays summary cards at the top of prep notes showing quick stats:
 * - Total attendees
 * - Total companies
 * - Total talking points
 * - Meeting status
 *
 * @param prepNote - The complete PrepNote object
 * @param meetingStatus - Current status of the meeting
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

interface PrepNoteSummaryHeaderProps {
  prepNote: PrepNote;
  meetingStatus: string;
}

export function PrepNoteSummaryHeader({
  prepNote,
  meetingStatus,
}: PrepNoteSummaryHeaderProps) {
  // Calculate stats
  const totalAttendees = prepNote.attendees.length;
  const totalCompanies = prepNote.companies.length;
  const totalTalkingPoints =
    prepNote.suggested_talking_points.length +
    prepNote.attendees.reduce((sum, att) => sum + att.talking_points.length, 0);
  const industries = new Set(
    prepNote.companies.map((c) => c.industry).filter(Boolean)
  );
  const industriesCount = industries.size;

  return (
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
        value={meetingStatus === 'ready' ? 'Ready' : 'Researching'}
        subtitle={meetingStatus === 'ready' ? 'Research complete' : 'In progress'}
        variant={meetingStatus === 'ready' ? 'success' : 'default'}
      />
    </div>
  );
}
