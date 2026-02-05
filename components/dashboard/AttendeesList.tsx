'use client';

import { useState, useEffect } from 'react';
import { Badge, Button } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

interface Attendee {
  id?: string;
  name: string | null;
  email: string;
  is_internal: boolean;
  company?: string | null;
}

interface AttendeesListProps {
  attendees: Attendee[];
  meetingId: string;
}

export function AttendeesList({ attendees: initialAttendees, meetingId }: AttendeesListProps) {
  const [attendees, setAttendees] = useState<Attendee[]>(initialAttendees);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch detailed attendee info with company
  useEffect(() => {
    async function fetchDetailedAttendees() {
      const supabase = createClient();
      const { data } = await supabase
        .from('attendees')
        .select(`
          id,
          name,
          email,
          is_internal,
          company_id,
          companies (
            name,
            domain
          )
        `)
        .eq('meeting_id', meetingId);

      if (data) {
        const mappedAttendees = data.map(att => ({
          id: att.id,
          name: att.name,
          email: att.email,
          is_internal: att.is_internal,
          company: (att.companies as any)?.name || (att.companies as any)?.domain || null
        }));
        setAttendees(mappedAttendees);
      }
    }

    fetchDetailedAttendees();
  }, [meetingId]);

  const handleUpdate = (id: string, field: 'name' | 'company', value: string) => {
    setAttendees(prev => prev.map(att =>
      att.id === id ? { ...att, [field]: value } : att
    ));
  };

  const handleSave = async (id: string) => {
    setIsSaving(true);
    try {
      const attendee = attendees.find(a => a.id === id);
      if (!attendee) return;

      const supabase = createClient();

      // Update attendee name and mark as manually edited
      const { error: attendeeError } = await supabase
        .from('attendees')
        .update({
          name: attendee.name,
          name_manually_edited: true
        })
        .eq('id', id);

      if (attendeeError) throw attendeeError;

      // Update company name if provided
      if (attendee.company) {
        const { data: attendeeData } = await supabase
          .from('attendees')
          .select('company_id')
          .eq('id', id)
          .single();

        if (attendeeData?.company_id) {
          // Mark company as manually edited
          await supabase
            .from('attendees')
            .update({ company_manually_edited: true })
            .eq('id', id);

          await supabase
            .from('companies')
            .update({ name: attendee.company })
            .eq('id', attendeeData.company_id);
        }
      }

      setEditingId(null);
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save attendee information.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!attendees || attendees.length === 0) {
    return (
      <div className="text-sm text-text-muted">No attendees</div>
    );
  }

  return (
    <div className="space-y-3">
      {attendees.map((attendee, idx) => (
        <div
          key={attendee.id || idx}
          className="flex items-start gap-3 p-3 bg-bg rounded-md border border-text-primary/10 shadow-soft hover:shadow-soft hover:translate-y-[-2px] transition-all duration-300"
        >
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-xs text-text-secondary w-20">Name:</label>
              {editingId === attendee.id ? (
                <input
                  type="text"
                  value={attendee.name || ''}
                  onChange={(e) => handleUpdate(attendee.id!, 'name', e.target.value)}
                  className="flex-1 px-2 py-1 text-sm bg-bg border border-text-primary/10 rounded focus:outline-none focus:ring-1 focus:ring-brand-blue"
                />
              ) : (
                <span className="text-sm text-text-primary font-medium">
                  {attendee.name || 'Not specified'}
                </span>
              )}
            </div>

            {!attendee.is_internal && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-text-secondary w-20">Company:</label>
                {editingId === attendee.id ? (
                  <input
                    type="text"
                    value={attendee.company || ''}
                    onChange={(e) => handleUpdate(attendee.id!, 'company', e.target.value)}
                    className="flex-1 px-2 py-1 text-sm bg-bg border border-text-primary/10 rounded focus:outline-none focus:ring-1 focus:ring-brand-blue"
                  />
                ) : (
                  <span className="text-sm text-text-primary">
                    {attendee.company || 'Not specified'}
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <label className="text-xs text-text-secondary w-20">Email:</label>
              <span className="text-sm text-text-secondary">{attendee.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!attendee.is_internal && (
              <Badge variant="accent">External</Badge>
            )}
            {attendee.id && !attendee.is_internal && (
              editingId === attendee.id ? (
                <>
                  <Button
                    variant="primary"
                    onClick={() => handleSave(attendee.id!)}
                    disabled={isSaving}
                    className="text-xs px-3 py-1"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setEditingId(null)}
                    disabled={isSaving}
                    className="text-xs px-3 py-1"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => setEditingId(attendee.id!)}
                  className="text-xs px-3 py-1"
                >
                  Edit
                </Button>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
