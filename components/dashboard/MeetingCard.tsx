'use client';

import { Badge } from '@/components/ui';

interface Meeting {
  id: string;
  title: string | null;
  start_time: string;
  is_internal: boolean;
  attendees?: Array<{
    name: string | null;
    email: string;
    is_internal: boolean;
  }>;
}

interface MeetingCardProps {
  meeting: Meeting;
  isSelected: boolean;
  onClick: () => void;
}

export function MeetingCard({ meeting, isSelected, onClick }: MeetingCardProps) {
  const externalCount = meeting.attendees?.filter(a => !a.is_internal).length || 0;

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-4 rounded-md transition-all duration-300
        ${isSelected
          ? 'bg-brand-blue/5 border-2 border-brand-blue shadow-soft'
          : 'bg-surface border-2 border-transparent hover:border-text-primary/10 hover:shadow-soft hover:translate-y-[-2px]'
        }
      `}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold font-serif text-text-primary line-clamp-1">
          {meeting.title || 'Untitled Meeting'}
        </h3>
        <Badge variant={meeting.is_internal ? 'default' : 'accent'}>
          {meeting.is_internal ? 'Internal' : 'External'}
        </Badge>
      </div>

      <p className="text-sm text-text-secondary mb-2">
        {new Date(meeting.start_time).toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })}
      </p>

      {externalCount > 0 && (
        <p className="text-xs text-brand-blue">
          {externalCount} external {externalCount === 1 ? 'attendee' : 'attendees'}
        </p>
      )}
    </button>
  );
}
