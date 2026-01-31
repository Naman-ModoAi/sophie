'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { PrepNote } from '@/lib/research/types';

/**
 * DiscussionPointsTab Component
 *
 * Displays aggregated talking points from the prep note
 * Features copy functionality for all points.
 *
 * @param prepNote - The complete PrepNote object
 */

interface DiscussionPointsTabProps {
  prepNote: PrepNote;
}

export function DiscussionPointsTab({ prepNote }: DiscussionPointsTabProps) {
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const copyAllPoints = async () => {
    const allPoints = prepNote.suggested_talking_points
      .map((p, i) => `${i + 1}. ${p}`)
      .join('\n');

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

      {/* Discussion Points */}
      {prepNote.suggested_talking_points.length > 0 ? (
        <div className="p-4 bg-surface rounded-lg border border-text/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-text">
              Discussion Points ({prepNote.suggested_talking_points.length})
            </h3>
            <button
              onClick={() =>
                copySection(
                  prepNote.suggested_talking_points
                    .map((p, i) => `${i + 1}. ${p}`)
                    .join('\n'),
                  'points'
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
      ) : (
        <div className="text-center py-8 text-text/50">
          No talking points available
        </div>
      )}
    </div>
  );
}
