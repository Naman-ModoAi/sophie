'use client';

import { ExpandableSection } from '../ExpandableSection';

/**
 * PeopleResearchTab Component
 *
 * Displays detailed research about each meeting attendee including:
 * - Basic info (name, role, company)
 * - LinkedIn profile link
 * - Tenure information
 * - Professional background (expandable)
 * - Person-specific talking points
 * - Recent activity
 *
 * @param attendees - Array of attendee objects from PrepNote
 * @param expandedSections - Set of currently expanded section IDs
 * @param toggleSection - Function to toggle section expansion
 */

interface Attendee {
  name: string;
  current_role?: string;
  company?: string;
  background?: string;
  tenure?: string;
  linkedin_url?: string;
  talking_points: string[];
  recent_activity?: string;
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
        <div
          key={index}
          className="p-4 bg-surface rounded-lg border border-text/10 space-y-3"
        >
          {/* Header Section */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">👤</span>
                <h4 className="text-base font-semibold text-text">{attendee.name}</h4>
              </div>
              {attendee.current_role && (
                <p className="text-sm text-text/70">
                  {attendee.current_role}
                  {attendee.company && ` at ${attendee.company}`}
                </p>
              )}
              {attendee.tenure && (
                <p className="text-sm text-text/60 mt-1">📅 {attendee.tenure}</p>
              )}
            </div>
            {attendee.linkedin_url && (
              <a
                href={attendee.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent hover:underline whitespace-nowrap"
              >
                LinkedIn →
              </a>
            )}
          </div>

          {/* Expandable Sections */}
          <div className="space-y-3 pt-2">
            {/* Background */}
            {attendee.background && (
              <ExpandableSection
                id={`attendee-${index}-background`}
                title="Background"
                isExpanded={expandedSections.has(`attendee-${index}-background`)}
                onToggle={toggleSection}
              >
                <p className="text-sm text-text/90 leading-relaxed">
                  {attendee.background}
                </p>
              </ExpandableSection>
            )}

            {/* Talking Points */}
            {attendee.talking_points.length > 0 && (
              <ExpandableSection
                id={`attendee-${index}-talking`}
                title="Talking Points"
                count={attendee.talking_points.length}
                isExpanded={expandedSections.has(`attendee-${index}-talking`)}
                onToggle={toggleSection}
              >
                <ol className="space-y-2 list-decimal list-inside">
                  {attendee.talking_points.map((point, i) => (
                    <li key={i} className="text-sm text-text/90 leading-relaxed">
                      {point}
                    </li>
                  ))}
                </ol>
              </ExpandableSection>
            )}

            {/* Recent Activity */}
            {attendee.recent_activity && (
              <ExpandableSection
                id={`attendee-${index}-activity`}
                title="Recent Activity"
                isExpanded={expandedSections.has(`attendee-${index}-activity`)}
                onToggle={toggleSection}
              >
                <p className="text-sm text-text/90 leading-relaxed">
                  {attendee.recent_activity}
                </p>
              </ExpandableSection>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
