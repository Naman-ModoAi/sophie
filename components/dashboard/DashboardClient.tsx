'use client';

import { useState } from 'react';
import { MeetingCard } from './MeetingCard';
import { MeetingDetailPanel } from './MeetingDetailPanel';
import { EmptyState } from './EmptyState';

interface Meeting {
  id: string;
  title: string | null;
  start_time: string;
  end_time: string | null;
  is_internal: boolean;
  attendees?: Array<{
    name: string | null;
    email: string;
    is_internal: boolean;
  }>;
}

interface DashboardClientProps {
  meetings: Meeting[];
}

export function DashboardClient({ meetings }: DashboardClientProps) {
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(
    meetings.length > 0 ? meetings[0].id : null
  );

  const selectedMeeting = meetings.find(m => m.id === selectedMeetingId);

  if (meetings.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Meetings List */}
      <div className="lg:col-span-1">
        <h3 className="text-sm font-semibold text-text/70 mb-3 px-1">
          UPCOMING MEETINGS
        </h3>
        <div className="space-y-2">
          {meetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              isSelected={meeting.id === selectedMeetingId}
              onClick={() => setSelectedMeetingId(meeting.id)}
            />
          ))}
        </div>
      </div>

      {/* Meeting Details Panel */}
      <div className="lg:col-span-2">
        {selectedMeeting ? (
          <MeetingDetailPanel meeting={selectedMeeting} />
        ) : (
          <div className="bg-surface rounded-md shadow-sm p-8 text-center text-text/50">
            Select a meeting to view details
          </div>
        )}
      </div>
    </div>
  );
}
