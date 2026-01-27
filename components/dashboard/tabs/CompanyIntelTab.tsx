'use client';

import { ExpandableSection } from '../ExpandableSection';

/**
 * CompanyIntelTab Component
 *
 * Displays detailed company research including:
 * - Company name and domain
 * - Quick facts (industry, size, funding)
 * - Overview (expandable)
 * - Products list (expandable)
 * - Recent news (expandable)
 * - Associated attendees from the meeting
 *
 * @param companies - Array of company objects from PrepNote
 * @param attendees - Array of attendee objects (to compute associated attendees)
 * @param expandedSections - Set of currently expanded section IDs
 * @param toggleSection - Function to toggle section expansion
 */

interface Company {
  name: string;
  domain: string;
  overview?: string;
  industry?: string;
  size?: string;
  funding?: string;
  products: string[];
  recent_news: string[];
}

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
      {companies.map((company, index) => {
        // Compute associated attendees
        const associatedAttendees = attendees.filter(
          (att) => att.company === company.name
        );

        return (
          <div
            key={`${company.domain}-${index}`}
            className="p-4 bg-surface rounded-lg border border-text/10 space-y-4"
          >
            {/* Header Section */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🏢</span>
                  <h4 className="text-base font-semibold text-text">{company.name}</h4>
                </div>
                <p className="text-sm text-text/60">{company.domain}</p>
              </div>
              {company.domain && (
                <a
                  href={`https://${company.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-accent hover:underline whitespace-nowrap"
                >
                  Visit Website →
                </a>
              )}
            </div>

            {/* Quick Facts Section */}
            {(company.industry || company.size || company.funding) && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-text/70">📊 Quick Facts</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {company.industry && (
                    <div className="text-sm">
                      <span className="text-text/60">Industry: </span>
                      <span className="text-text">{company.industry}</span>
                    </div>
                  )}
                  {company.size && (
                    <div className="text-sm">
                      <span className="text-text/60">Size: </span>
                      <span className="text-text">{company.size}</span>
                    </div>
                  )}
                  {company.funding && (
                    <div className="text-sm">
                      <span className="text-text/60">Funding: </span>
                      <span className="text-text">{company.funding}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Expandable Sections */}
            <div className="space-y-3">
              {/* Overview */}
              {company.overview && (
                <ExpandableSection
                  id={`company-${index}-overview`}
                  title="Overview"
                  isExpanded={expandedSections.has(`company-${index}-overview`)}
                  onToggle={toggleSection}
                >
                  <p className="text-sm text-text/90 leading-relaxed">
                    {company.overview}
                  </p>
                </ExpandableSection>
              )}

              {/* Products */}
              {company.products.length > 0 && (
                <ExpandableSection
                  id={`company-${index}-products`}
                  title="Products"
                  count={company.products.length}
                  isExpanded={expandedSections.has(`company-${index}-products`)}
                  onToggle={toggleSection}
                >
                  <ul className="space-y-2">
                    {company.products.map((product, i) => (
                      <li key={i} className="text-sm text-text/90 flex gap-2">
                        <span className="text-accent">→</span>
                        <span>{product}</span>
                      </li>
                    ))}
                  </ul>
                </ExpandableSection>
              )}

              {/* Recent News */}
              {company.recent_news.length > 0 && (
                <ExpandableSection
                  id={`company-${index}-news`}
                  title="Recent News"
                  count={company.recent_news.length}
                  isExpanded={expandedSections.has(`company-${index}-news`)}
                  onToggle={toggleSection}
                >
                  <ul className="space-y-2">
                    {company.recent_news.map((news, i) => (
                      <li key={i} className="text-sm text-text/90 flex gap-2">
                        <span className="text-accent">•</span>
                        <span>{news}</span>
                      </li>
                    ))}
                  </ul>
                </ExpandableSection>
              )}
            </div>

            {/* Associated Attendees */}
            {associatedAttendees.length > 0 && (
              <div className="pt-2 border-t border-text/10">
                <h5 className="text-sm font-medium text-text/70 mb-2">
                  👥 Attendees from this company ({associatedAttendees.length}):
                </h5>
                <ul className="space-y-1">
                  {associatedAttendees.map((att, i) => (
                    <li key={i} className="text-sm text-text/90">
                      • {att.name}
                      {att.current_role && ` (${att.current_role})`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
