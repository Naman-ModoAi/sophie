'use client';

import { useState, useEffect } from 'react';
import { Textarea, Button, Badge, Tabs } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { OverviewTab } from './tabs/OverviewTab';
import { PeopleResearchTab } from './tabs/PeopleResearchTab';
import { CompanyIntelTab } from './tabs/CompanyIntelTab';
import { DiscussionPointsTab } from './tabs/DiscussionPointsTab';
import { useToast } from '@/contexts/ToastContext';
import { PrepNote } from '@/lib/research/types';

interface PrepNotesEditorProps {
  meetingId: string;
  initialNotes?: string;
  onSave?: (notes: string) => void;
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
  const { showToast } = useToast();

  // Fetch AI-generated prep note on mount + subscribe to realtime changes
  useEffect(() => {
    setIsLoading(true);
    setAiPrepNote(null);
    setMeetingStatus('pending');

    const supabase = createClient();

    async function fetchPrepNote() {
      try {
        const { data: meeting } = await supabase
          .from('meetings')
          .select('status')
          .eq('id', meetingId)
          .single();

        if (meeting) {
          setMeetingStatus(meeting.status);
          if (meeting.status === 'researching') {
            setIsGenerating(true);
          }
        }

        const { data: prepNote } = await supabase
          .from('prep_notes')
          .select('content')
          .eq('meeting_id', meetingId)
          .maybeSingle();

        if (prepNote?.content) {
          setAiPrepNote(prepNote.content as PrepNote);
        }
      } catch (error) {
        // Error fetching prep note
      } finally {
        setIsLoading(false);
      }
    }

    fetchPrepNote();

    // Subscribe to meeting status changes so we know when research completes
    const channel = supabase
      .channel(`meeting-status-${meetingId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'meetings',
        filter: `id=eq.${meetingId}`,
      }, async (payload) => {
        const newStatus = payload.new.status;
        setMeetingStatus(newStatus);

        if (newStatus === 'ready') {
          setIsGenerating(false);
          // Fetch the newly created prep note
          const { data: prepNote } = await supabase
            .from('prep_notes')
            .select('content')
            .eq('meeting_id', meetingId)
            .maybeSingle();

          if (prepNote?.content) {
            setAiPrepNote(prepNote.content as PrepNote);
            showToast('Prep note generated successfully!', 'success');
          }
        } else if (newStatus === 'researching') {
          setIsGenerating(true);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [meetingId, showToast]);

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
      // Failed to save notes
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
    // No longer needed with markdown cards - always expanded
  };

  const collapseAll = () => {
    // No longer needed with markdown cards - always expanded
  };

  const exportToPDF = async () => {
    if (!aiPrepNote) return;
    try {
      // Dynamic import to avoid SSR issues
      const { jsPDF } = await import('jspdf');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Helper: Add text with automatic line wrapping and pagination
      const addText = (text: string, fontSize: number, fontStyle: string = 'normal', color: number[] = [0, 0, 0]) => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', fontStyle);
        pdf.setTextColor(color[0], color[1], color[2]);

        const lines = pdf.splitTextToSize(text, contentWidth);
        const lineHeight = fontSize * 0.5;

        for (const line of lines) {
          // Check if we need a new page
          if (yPosition + lineHeight > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin, yPosition);
          yPosition += lineHeight;
        }
      };

      // Helper: Add spacing
      const addSpace = (space: number) => {
        yPosition += space;
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
      };

      // Helper: Add section header
      const addSectionHeader = (title: string) => {
        addSpace(8);
        addText(title, 14, 'bold', [41, 128, 185]);
        addSpace(4);
      };

      // Helper: Add subsection header
      const addSubsectionHeader = (title: string) => {
        addSpace(5);
        addText(title, 11, 'bold', [52, 73, 94]);
        addSpace(3);
      };

      // Helper: Add bullet list
      const addBulletList = (items: string[]) => {
        for (const item of items) {
          if (!item) continue;
          const bulletText = `• ${item}`;
          addText(bulletText, 10, 'normal');
          addSpace(2);
        }
      };

      // Title
      addText(aiPrepNote.meeting_title || 'Meeting Prep Notes', 18, 'bold', [44, 62, 80]);
      addSpace(3);

      // Meeting Details
      if (aiPrepNote.meeting_time) {
        addText(`📅 ${new Date(aiPrepNote.meeting_time).toLocaleString()}`, 10, 'normal', [100, 100, 100]);
        addSpace(3);
      }
      if (aiPrepNote.generated_at) {
        addText(`Generated: ${new Date(aiPrepNote.generated_at).toLocaleString()}`, 9, 'italic', [120, 120, 120]);
        addSpace(6);
      }

      // Summary
      if (aiPrepNote.summary) {
        addSectionHeader('📋 Summary');
        addText(aiPrepNote.summary, 10, 'normal');
      }

      // Discussion Points
      if (aiPrepNote.suggested_talking_points?.length > 0) {
        addSectionHeader('💡 Discussion Points');
        addBulletList(aiPrepNote.suggested_talking_points);
      }

      // People Research
      if (aiPrepNote.attendees?.length > 0) {
        addSectionHeader(`👥 People Research (${aiPrepNote.attendees.length})`);

        for (const attendee of aiPrepNote.attendees) {
          addSubsectionHeader(attendee.name);
          addText(`Email: ${attendee.email}`, 9, 'normal', [100, 100, 100]);
          addSpace(2);

          // Convert markdown to plain text for PDF
          const plainText = attendee.markdown_content
            .replace(/#{1,6}\s/g, '') // Remove markdown headers
            .replace(/\*\*/g, '') // Remove bold
            .replace(/\*/g, '') // Remove italic
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1'); // Convert links to text

          addText(plainText, 10, 'normal');
          addSpace(3);
        }
      }

      // Company Intel
      if (aiPrepNote.companies?.length > 0) {
        addSectionHeader(`🏢 Company Intel (${aiPrepNote.companies.length})`);

        for (const company of aiPrepNote.companies) {
          addSubsectionHeader(company.name);
          addText(company.domain, 9, 'normal', [41, 128, 185]);
          addSpace(2);

          // Convert markdown to plain text for PDF
          const plainText = company.markdown_content
            .replace(/#{1,6}\s/g, '') // Remove markdown headers
            .replace(/\*\*/g, '') // Remove bold
            .replace(/\*/g, '') // Remove italic
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1'); // Convert links to text

          addText(plainText, 10, 'normal');
          addSpace(3);
        }
      }

      // Save the PDF
      const filename = `${aiPrepNote.meeting_title || 'prep-notes'}-${
        new Date().toISOString().split('T')[0]
      }.pdf`;
      pdf.save(filename);
    } catch (error) {
      showToast('Failed to generate PDF. Please try again.', 'error');
    }
  };

  const handleGeneratePrepNote = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meeting_id: meetingId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 403) {
          const message = errorData.message ||
                         errorData.error ||
                         'Insufficient credits. Please upgrade your plan.';
          showToast(message, 'error');
          setIsGenerating(false);
          return;
        }

        throw new Error(errorData.error || 'Failed to generate prep note');
      }

      // Success — realtime subscription will handle the UI update when status changes to 'ready'
    } catch (error) {
      // If fetch itself fails (timeout/network), research may still be running on backend.
      // The realtime subscription will pick up the status change, so just inform the user.
      if (error instanceof Error && !error.message.includes('credits')) {
        showToast('Research is running in the background. You\'ll be notified when it\'s ready.', 'info');
      }
      // Keep isGenerating true — the realtime sub will reset it when status changes
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
    <div className="space-y-3">
      {/* Status Badge and Generate Button */}
      <div className="flex items-center justify-between gap-2">
        <Badge variant={meetingStatus === 'ready' ? 'success' : 'default'}>
          {meetingStatus === 'ready' ? '✓ AI Research Complete' :
           meetingStatus === 'researching' ? 'Researching...' :
           'Pending Research'}
        </Badge>

        {!aiPrepNote && (
          isGenerating || meetingStatus === 'researching' ? (
            <span className="text-sm text-text/60 flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating prep notes in background...
            </span>
          ) : (
            <Button
              variant="primary"
              onClick={handleGeneratePrepNote}
              className="text-sm"
            >
              Generate Prep Note
            </Button>
          )
        )}
      </div>

      {/* AI-Generated Prep Note */}
      {aiPrepNote && (
        <div className="space-y-3">
          {/* Actions Bar */}
          <div className="flex justify-end items-center">
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
      <div className="space-y-1">
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
