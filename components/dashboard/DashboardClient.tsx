'use client';

import { useState, useEffect } from 'react';
import { MeetingCard } from './MeetingCard';
import { MeetingDetailPanel } from './MeetingDetailPanel';
import { EmptyState } from './EmptyState';
import { Button } from '@/components/ui';
import { SyncIcon } from '@/components/ui/icons/SyncIcon';
import { useToast } from '@/contexts/ToastContext';
import { createClient } from '@/lib/supabase/client';

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
  userId: string;
}

export function DashboardClient({ meetings: initialMeetings, userId }: DashboardClientProps) {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(
    initialMeetings.length > 0 ? initialMeetings[0].id : null
  );
  const [isResyncing, setIsResyncing] = useState(false);
  const { showToast } = useToast();
  const supabase = createClient();

  const selectedMeeting = meetings.find(m => m.id === selectedMeetingId);

  // Auto-sync calendar in the background on mount (non-blocking)
  useEffect(() => {
    let cancelled = false;
    async function backgroundSync() {
      try {
        const response = await fetch('/api/calendar/resync', { method: 'POST' });
        if (!response.ok) {
          console.error('[backgroundSync] Auto-sync failed');
        }
      } catch (error) {
        console.error('[backgroundSync] Auto-sync error:', error);
      }
    }
    backgroundSync();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('meetings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meetings'
        },
        async () => {
          // Refetch meetings when any change occurs
          const { data } = await supabase
            .from('meetings')
            .select('*, attendees (*)')
            .eq('user_id', userId)
            .eq('is_cancelled', false)
            .gte('start_time', new Date().toISOString())
            .order('start_time', { ascending: true })
            .limit(50);

          if (data) {
            setMeetings(data);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  const handleResync = async () => {
    setIsResyncing(true);
    try {
      const response = await fetch('/api/calendar/resync', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Resync failed');
      }

      const result = await response.json();
      showToast(`Synced ${result.meetings_synced} meetings`, 'success');
    } catch (error) {
      showToast('Failed to resync calendar. Please try again.', 'error');
    } finally {
      setIsResyncing(false);
    }
  };

  if (meetings.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      {/* Resync Button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleResync}
          disabled={isResyncing}
        >
          <span className="flex items-center gap-2">
            {isResyncing ? (
              <>
                <SyncIcon className="w-4 h-4 animate-spin" />
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <SyncIcon className="w-4 h-4" />
                <span>Sync</span>
              </>
            )}
          </span>
        </Button>
      </div>

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
    </div>
  );
}
