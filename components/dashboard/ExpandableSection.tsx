'use client';

/**
 * ExpandableSection Component
 *
 * Reusable component for expand/collapse functionality.
 * Features smooth toggle animation, chevron indicator, and optional count badge.
 *
 * @param id - Unique identifier for this section
 * @param title - Section title
 * @param count - Optional count badge (e.g., number of items)
 * @param isExpanded - Whether the section is currently expanded
 * @param onToggle - Callback function when section is toggled
 * @param children - Content to display when expanded
 * @param defaultExpanded - Optional default expanded state (unused, kept for future)
 */

interface ExpandableSectionProps {
  id: string;
  title: string;
  count?: number;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function ExpandableSection({
  id,
  title,
  count,
  isExpanded,
  onToggle,
  children,
}: ExpandableSectionProps) {
  return (
    <div className="space-y-2">
      <button
        onClick={() => onToggle(id)}
        className="flex items-center justify-between w-full text-left hover:text-accent transition-colors cursor-pointer group"
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${title}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text/70 group-hover:text-accent">
            {title}
            {count !== undefined && ` (${count})`}
          </span>
        </div>
        <span className="text-text/50 group-hover:text-accent transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          ▶
        </span>
      </button>

      {isExpanded && (
        <div className="pl-4 border-l-2 border-accent/20 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}
