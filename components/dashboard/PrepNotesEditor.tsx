'use client';

import { useState, useEffect } from 'react';
import { Textarea, Button, Badge, Tabs } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { PrepNoteSummaryHeader } from './PrepNoteSummaryHeader';
import { OverviewTab } from './tabs/OverviewTab';
import { PeopleResearchTab } from './tabs/PeopleResearchTab';
import { CompanyIntelTab } from './tabs/CompanyIntelTab';
import { DiscussionPointsTab } from './tabs/DiscussionPointsTab';

interface PrepNotesEditorProps {
  meetingId: string;
  initialNotes?: string;
  onSave?: (notes: string) => void;
}

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

export function PrepNotesEditor({ meetingId, initialNotes = '', onSave }: PrepNotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [aiPrepNote, setAiPrepNote] = useState<PrepNote | null>(null);
  const [meetingStatus, setMeetingStatus] = useState<string>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

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

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    if (!aiPrepNote) return;

    const allIds = [
      ...aiPrepNote.attendees.flatMap((_, i) => [
        `attendee-${i}-background`,
        `attendee-${i}-talking`,
        `attendee-${i}-activity`,
      ]),
      ...aiPrepNote.companies.flatMap((_, i) => [
        `company-${i}-overview`,
        `company-${i}-products`,
        `company-${i}-news`,
      ]),
    ];
    setExpandedSections(new Set(allIds));
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  const exportToPDF = async () => {
    if (!aiPrepNote) return;
    try {
      // Import html2pdf dynamically
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default;

      // Get the content element
      const content = document.getElementById('prep-notes-export-content');
      if (!content) {
        console.error('Export content element not found');
        return;
      }

      const opt = {
        margin: 10,
        filename: `${aiPrepNote.meeting_title || 'prep-notes'}-${
          new Date().toISOString().split('T')[0]
        }.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      };

      await html2pdf().from(content).set(opt).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
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
        <div id="prep-notes-export-content" className="space-y-6">
          {/* Summary Header */}
          <PrepNoteSummaryHeader prepNote={aiPrepNote} meetingStatus={meetingStatus} />

          {/* Actions Bar */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="secondary" onClick={expandAll} className="text-sm">
                Expand All
              </Button>
              <Button variant="secondary" onClick={collapseAll} className="text-sm">
                Collapse All
              </Button>
            </div>
            <Button variant="secondary" onClick={exportToPDF} className="text-sm">
              📄 Export PDF
            </Button>
          </div>

          {/* Tabbed Content */}
          <Tabs
            defaultTab="overview"
            tabs={[
              {
                id: 'overview',
                label: '📋 Overview',
                content: <OverviewTab prepNote={aiPrepNote} />,
              },
              {
                id: 'people',
                label: `👥 People Research (${aiPrepNote.attendees.length})`,
                content: (
                  <PeopleResearchTab
                    attendees={aiPrepNote.attendees}
                    expandedSections={expandedSections}
                    toggleSection={toggleSection}
                  />
                ),
              },
              {
                id: 'companies',
                label: `🏢 Company Intel (${aiPrepNote.companies.length})`,
                content: (
                  <CompanyIntelTab
                    companies={aiPrepNote.companies}
                    attendees={aiPrepNote.attendees}
                    expandedSections={expandedSections}
                    toggleSection={toggleSection}
                  />
                ),
              },
              {
                id: 'talking-points',
                label: '💡 Discussion Points',
                content: <DiscussionPointsTab prepNote={aiPrepNote} />,
              },
            ]}
          />
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
