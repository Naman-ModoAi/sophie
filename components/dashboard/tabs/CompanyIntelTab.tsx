'use client';

import { MarkdownCard } from '@/components/ui';

/**
 * CompanyIntelTab Component
 *
 * Displays research about companies in markdown format
 */

interface Company {
  name: string;
  domain: string;
  markdown_content: string;
}

interface Attendee {
  name: string;
  email: string;
  markdown_content: string;
}

interface CompanyIntelTabProps {
  companies: Company[];
  attendees: Attendee[];
  expandedSections: Set<string>;
  toggleSection: (id: string) => void;
}

export function CompanyIntelTab({
  companies,
  attendees,
  expandedSections,
  toggleSection,
}: CompanyIntelTabProps) {
  if (companies.length === 0) {
    return (
      <div className="text-center py-8 text-text/50">
        No company information available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {companies.map((company, index) => (
        <div key={`${company.domain}-${index}`} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏢</span>
              <h3 className="text-base font-semibold text-text">{company.name}</h3>
            </div>
            <a
              href={`https://${company.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent hover:underline flex items-center gap-1"
            >
              Visit Website ↗
            </a>
          </div>
          <MarkdownCard content={company.markdown_content} />
        </div>
      ))}
    </div>
  );
}
