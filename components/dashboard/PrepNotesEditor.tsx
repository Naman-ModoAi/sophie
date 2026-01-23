'use client';

import { useState, useEffect } from 'react';
import { Textarea, Button, Badge } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

interface PrepNotesEditorProps {
  meetingId: string;
  initialNotes?: string;
  onSave?: (notes: string) => void;
}

interface PrepNote {
  meeting_title: string;
  summary: string;
  attendees: Array<{
    name: string;
    current_role?: string;
    company?: string;
    background?: string;
    talking_points: string[];
  }>;
  companies: Array<{
    name: string;
    domain: string;
    overview?: string;
    recent_news: string[];
    products: string[];
  }>;
  suggested_talking_points: string[];
}

export function PrepNotesEditor({ meetingId, initialNotes = '', onSave }: PrepNotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [aiPrepNote, setAiPrepNote] = useState<PrepNote | null>(null);
  const [meetingStatus, setMeetingStatus] = useState<string>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch AI-generated prep note on mount
  useEffect(() => {
    async function fetchPrepNote() {
      try {
        const supabase = createClient();

        // Fetch meeting status
        const { data: meeting } = await supabase
          .from('meetings')
          .select('status')
          .eq('id', meetingId)
          .single();

        if (meeting) {
          setMeetingStatus(meeting.status);
        }

        // Fetch prep note if available
        const { data: prepNote, error: prepNoteError } = await supabase
          .from('prep_notes')
          .select('content')
          .eq('meeting_id', meetingId)
          .maybeSingle();

        if (prepNote?.content) {
          setAiPrepNote(prepNote.content as PrepNote);
        }
      } catch (error) {
        console.error('Error fetching prep note:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPrepNote();
  }, [meetingId]);

  const handleChange = (value: string) => {
    setNotes(value);
    setHasChanges(value !== initialNotes);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement actual save logic to user_notes table
      await new Promise(resolve => setTimeout(resolve, 500));
      if (onSave) {
        onSave(notes);
      }
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save notes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratePrepNote = async () => {
    setIsGenerating(true);
    try {
      // Call frontend API route which proxies to backend
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meeting_id: meetingId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate prep note');
      }

      const result = await response.json();
      console.log('Research completed:', result);

      // Refresh prep note
      const supabase = createClient();
      const { data: prepNote, error: fetchError } = await supabase
        .from('prep_notes')
        .select('content')
        .eq('meeting_id', meetingId)
        .maybeSingle();

      if (prepNote?.content) {
        setAiPrepNote(prepNote.content as PrepNote);
        setMeetingStatus('ready');
      } else if (fetchError) {
        console.error('Error fetching prep note after generation:', fetchError);
      }

      alert('Prep note generated successfully!');
    } catch (error) {
      console.error('Error generating prep note:', error);
      alert('Failed to generate prep note. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-text/50">
        Loading prep notes...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Badge and Generate Button */}
      <div className="flex items-center justify-between gap-2">
        <Badge variant={meetingStatus === 'ready' ? 'success' : 'default'}>
          {meetingStatus === 'ready' ? '✓ AI Research Complete' :
           meetingStatus === 'researching' ? 'Researching...' :
           'Pending Research'}
        </Badge>

        {!aiPrepNote && meetingStatus !== 'researching' && (
          <Button
            variant="primary"
            onClick={handleGeneratePrepNote}
            disabled={isGenerating}
            className="text-sm"
          >
            {isGenerating ? 'Generating...' : 'Generate Prep Note'}
          </Button>
        )}
      </div>

      {/* AI-Generated Prep Note */}
      {aiPrepNote && (
        <div className="space-y-4 p-4 bg-accent/5 rounded-lg border border-accent/20">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text">AI-Generated Prep Note</h3>
            <Button
              variant="secondary"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm"
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </Button>
          </div>

          <div className={isExpanded ? 'space-y-4' : 'space-y-4 max-h-96 overflow-hidden relative'}>
            {/* Summary */}
            <div>
              <h4 className="text-sm font-medium text-text/70 mb-1">Summary</h4>
              <p className="text-sm text-text/90">{aiPrepNote.summary}</p>
            </div>

            {/* Talking Points */}
            {aiPrepNote.suggested_talking_points.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-text/70 mb-2">Suggested Talking Points</h4>
                <ul className="space-y-1">
                  {aiPrepNote.suggested_talking_points.map((point, i) => (
                    <li key={i} className="text-sm text-text/90 flex gap-2">
                      <span className="text-accent">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Attendees Research */}
            {aiPrepNote.attendees.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-text/70 mb-2">Attendee Insights</h4>
                <div className="space-y-3">
                  {aiPrepNote.attendees.map((attendee, i) => (
                    <div key={i} className="pl-4 border-l-2 border-accent/30">
                      <p className="text-sm font-medium text-text">{attendee.name}</p>
                      {attendee.current_role && (
                        <p className="text-xs text-text/70">{attendee.current_role} at {attendee.company}</p>
                      )}
                      {attendee.background && (
                        <p className="text-xs text-text/60 mt-1">
                          {isExpanded ? attendee.background : `${attendee.background.slice(0, 150)}...`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Companies Research */}
            {aiPrepNote.companies.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-text/70 mb-2">Company Info</h4>
                <div className="space-y-3">
                  {aiPrepNote.companies.map((company, i) => (
                    <div key={i} className="pl-4 border-l-2 border-accent/30">
                      <p className="text-sm font-medium text-text">{company.name}</p>
                      {company.overview && (
                        <p className="text-xs text-text/60 mt-1">
                          {isExpanded ? company.overview : `${company.overview.slice(0, 150)}...`}
                        </p>
                      )}
                      {company.recent_news.length > 0 && (
                        <p className="text-xs text-accent mt-1">
                          Recent: {isExpanded ? company.recent_news[0] : `${company.recent_news[0].slice(0, 100)}...`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isExpanded && (
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-accent/5 to-transparent pointer-events-none" />
            )}
          </div>
        </div>
      )}

      {/* User's Personal Notes */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-text/70">Your Notes</h3>
        <Textarea
          value={notes}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Add your personal preparation notes here..."
          rows={6}
          className="resize-none"
        />
        {hasChanges && (
          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Notes'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
