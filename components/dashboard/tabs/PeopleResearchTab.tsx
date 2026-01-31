'use client';

import { MarkdownCard } from '@/components/ui';

/**
 * PeopleResearchTab Component
 *
 * Displays research about each meeting attendee in markdown format
 */

interface Attendee {
  name: string;
  email: string;
  markdown_content: string;
}

interface PeopleResearchTabProps {
  attendees: Attendee[];
  expandedSections: Set<string>;
  toggleSection: (id: string) => void;
}

export function PeopleResearchTab({
  attendees,
  expandedSections,
  toggleSection,
}: PeopleResearchTabProps) {
  if (attendees.length === 0) {
    return (
      <div className="text-center py-8 text-text/50">
        No attendee information available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {attendees.map((attendee, index) => (
        <div key={`${attendee.email}-${index}`} className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">👤</span>
            <h3 className="text-base font-semibold text-text">{attendee.name}</h3>
            <span className="text-sm text-text/50">({attendee.email})</span>
          </div>
          <MarkdownCard content={attendee.markdown_content} />
        </div>
      ))}
    </div>
  );
}
