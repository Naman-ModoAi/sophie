'use client';

import { useState, useEffect } from 'react';
import { Textarea, Button, Badge, Tabs } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { OverviewTab } from './tabs/OverviewTab';
import { PeopleResearchTab } from './tabs/PeopleResearchTab';
import { CompanyIntelTab } from './tabs/CompanyIntelTab';
import { DiscussionPointsTab } from './tabs/DiscussionPointsTab';
import { useToast } from '@/contexts/ToastContext';

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
  const { showToast } = useToast();

  // Fetch AI-generated prep note on mount
  useEffect(() => {
    // Reset state when meetingId changes
    setIsLoading(true);
    setAiPrepNote(null);
    setMeetingStatus('pending');

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

          if (attendee.current_role || attendee.company) {
            const roleText = [attendee.current_role, attendee.company].filter(Boolean).join(' at ');
            addText(roleText, 10, 'italic', [80, 80, 80]);
            addSpace(2);
          }

          if (attendee.tenure) {
            addText(`Tenure: ${attendee.tenure}`, 9, 'normal', [100, 100, 100]);
            addSpace(2);
          }

          if (attendee.linkedin_url) {
            addText(`LinkedIn: ${attendee.linkedin_url}`, 9, 'normal', [41, 128, 185]);
            addSpace(2);
          }

          if (attendee.background) {
            addText('Background:', 10, 'bold');
            addSpace(2);
            addText(attendee.background, 10, 'normal');
            addSpace(2);
          }

          if (attendee.talking_points?.length > 0) {
            addText('Talking Points:', 10, 'bold');
            addSpace(2);
            addBulletList(attendee.talking_points);
          }

          if (attendee.recent_activity) {
            addText('Recent Activity:', 10, 'bold');
            addSpace(2);
            addText(attendee.recent_activity, 10, 'normal');
            addSpace(2);
          }

          addSpace(3);
        }
      }

      // Company Intel
      if (aiPrepNote.companies?.length > 0) {
        addSectionHeader(`🏢 Company Intel (${aiPrepNote.companies.length})`);

        for (const company of aiPrepNote.companies) {
          addSubsectionHeader(company.name);

          if (company.domain) {
            addText(company.domain, 9, 'normal', [41, 128, 185]);
            addSpace(2);
          }

          if (company.industry || company.size) {
            const details = [company.industry, company.size].filter(Boolean).join(' • ');
            addText(details, 9, 'normal', [100, 100, 100]);
            addSpace(2);
          }

          if (company.funding) {
            addText(`Funding: ${company.funding}`, 9, 'normal', [100, 100, 100]);
            addSpace(2);
          }

          if (company.overview) {
            addText('Overview:', 10, 'bold');
            addSpace(2);
            addText(company.overview, 10, 'normal');
            addSpace(2);
          }

          if (company.products?.length > 0) {
            addText('Products & Services:', 10, 'bold');
            addSpace(2);
            addBulletList(company.products);
          }

          if (company.recent_news?.length > 0) {
            addText('Recent News:', 10, 'bold');
            addSpace(2);
            addBulletList(company.recent_news);
          }

          addSpace(3);
        }
      }

      // Save the PDF
      const filename = `${aiPrepNote.meeting_title || 'prep-notes'}-${
        new Date().toISOString().split('T')[0]
      }.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('Failed to generate PDF. Please try again.', 'error');
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

      showToast('Prep note generated successfully!', 'success');
    } catch (error) {
      console.error('Error generating prep note:', error);
      showToast('Failed to generate prep note. Please try again.', 'error');
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
        <div className="space-y-6">
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
          <div id="prep-notes-export-content">
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
