import { Badge } from '@/components/ui';

interface Attendee {
  name: string | null;
  email: string;
  is_internal: boolean;
}

interface AttendeesListProps {
  attendees: Attendee[];
}

export function AttendeesList({ attendees }: AttendeesListProps) {
  if (!attendees || attendees.length === 0) {
    return (
      <div className="text-sm text-text/50">No attendees</div>
    );
  }

  return (
    <div className="space-y-2">
      {attendees.map((attendee, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between gap-3 p-3 bg-background rounded-md"
        >
          <div className="flex-1 min-w-0">
            <div className="font-medium text-text truncate">
              {attendee.name || attendee.email}
            </div>
            {attendee.name && (
              <div className="text-sm text-text/60 truncate">
                {attendee.email}
              </div>
            )}
          </div>
          {!attendee.is_internal && (
            <Badge variant="accent">External</Badge>
          )}
        </div>
      ))}
    </div>
  );
}
