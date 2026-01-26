'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';

/**
 * DiscussionPointsTab Component
 *
 * Aggregates and displays all talking points from the prep note:
 * - General discussion points (from suggested_talking_points)
 * - Person-specific talking points (from each attendee)
 * Features copy functionality for all points or individual sections.
 *
 * @param prepNote - The complete PrepNote object
 */

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

interface DiscussionPointsTabProps {
  prepNote: PrepNote;
}

export function DiscussionPointsTab({ prepNote }: DiscussionPointsTabProps) {
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const copyAllPoints = async () => {
    const generalPoints = prepNote.suggested_talking_points
      .map((p, i) => `${i + 1}. ${p}`)
      .join('\n');

    const attendeePoints = prepNote.attendees
      .filter((att) => att.talking_points.length > 0)
      .map(
        (att) =>
          `\n${att.name}:\n` +
          att.talking_points.map((p, i) => `${i + 1}. ${p}`).join('\n')
      )
      .join('\n');

    const allPoints = `General Discussion Points:\n${generalPoints}\n\nPerson-Specific Points:${attendeePoints}`;

    try {
      await navigator.clipboard.writeText(allPoints);
      setCopyStatus('Copied all points!');
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      setCopyStatus('Failed to copy');
      setTimeout(() => setCopyStatus(null), 2000);
    }
  };

  const copySection = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(`Copied ${label}!`);
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      setCopyStatus('Failed to copy');
      setTimeout(() => setCopyStatus(null), 2000);
    }
  };

  const attendeesWithPoints = prepNote.attendees.filter(
    (att) => att.talking_points.length > 0
  );

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-text/70">
          {copyStatus && <span className="text-accent">{copyStatus}</span>}
        </div>
        <Button variant="secondary" onClick={copyAllPoints} className="text-sm">
          📋 Copy All Points
        </Button>
      </div>

      {/* General Discussion Points */}
      {prepNote.suggested_talking_points.length > 0 && (
        <div className="p-4 bg-surface rounded-lg border border-text/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-text">
              General Discussion Points ({prepNote.suggested_talking_points.length})
            </h3>
            <button
              onClick={() =>
                copySection(
                  prepNote.suggested_talking_points
                    .map((p, i) => `${i + 1}. ${p}`)
                    .join('\n'),
                  'general points'
                )
              }
              className="text-sm text-accent hover:underline"
            >
              Copy
            </button>
          </div>
          <ol className="space-y-2 list-decimal list-inside">
            {prepNote.suggested_talking_points.map((point, i) => (
              <li key={i} className="text-sm text-text/90 leading-relaxed">
                {point}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Person-Specific Points */}
      {attendeesWithPoints.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-text">Person-Specific Points</h3>
          {attendeesWithPoints.map((attendee, index) => (
            <div
              key={index}
              className="p-4 bg-surface rounded-lg border border-text/10 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-text">
                  For {attendee.name} ({attendee.talking_points.length} points)
                </h4>
                <button
                  onClick={() =>
                    copySection(
                      attendee.talking_points
                        .map((p, i) => `${i + 1}. ${p}`)
                        .join('\n'),
                      `${attendee.name}'s points`
                    )
                  }
                  className="text-sm text-accent hover:underline"
                >
                  Copy
                </button>
              </div>
              <ol className="space-y-2 list-decimal list-inside">
                {attendee.talking_points.map((point, i) => (
                  <li key={i} className="text-sm text-text/90 leading-relaxed">
                    {point}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {prepNote.suggested_talking_points.length === 0 &&
        attendeesWithPoints.length === 0 && (
          <div className="text-center py-8 text-text/50">
            No talking points available
          </div>
        )}
    </div>
  );
}
