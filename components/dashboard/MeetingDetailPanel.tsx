import { Card, Badge, Tabs } from '@/components/ui';
import { AttendeesList } from './AttendeesList';
import { PrepNotesEditor } from './PrepNotesEditor';

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

interface MeetingDetailPanelProps {
  meeting: Meeting;
}

export function MeetingDetailPanel({ meeting }: MeetingDetailPanelProps) {
  const formattedDate = new Date(meeting.start_time).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = new Date(meeting.start_time).toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const endTime = meeting.end_time
    ? new Date(meeting.end_time).toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="text-2xl font-bold font-serif text-text-primary">
            {meeting.title || 'Untitled Meeting'}
          </h2>
          <Badge variant={meeting.is_internal ? 'default' : 'accent'}>
            {meeting.is_internal ? 'Internal' : 'External'}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-text-secondary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {formattedTime}
              {endTime && ` - ${endTime}`}
            </span>
          </div>
        </div>
      </Card>

      {/* Tabs for Attendees and Prep Notes */}
      <Card>
        <Tabs
          tabs={[
            {
              id: 'attendees',
              label: `Attendees (${meeting.attendees?.length || 0})`,
              content: <AttendeesList attendees={meeting.attendees || []} meetingId={meeting.id} />,
            },
            {
              id: 'prep-notes',
              label: 'Prep Notes',
              content: <PrepNotesEditor meetingId={meeting.id} />,
            },
          ]}
        />
      </Card>
    </div>
  );
}
