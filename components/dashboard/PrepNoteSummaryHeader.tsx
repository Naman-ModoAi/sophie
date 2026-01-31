'use client';

import { SummaryCard } from './SummaryCard';
import { PrepNote } from '@/lib/research/types';

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
  const totalTalkingPoints = prepNote.suggested_talking_points.length;

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
        subtitle={`${totalCompanies} researched`}
      />
      <SummaryCard
        icon="💡"
        title="Talking Points"
        value={totalTalkingPoints}
        subtitle={`Ready for discussion`}
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
