'use client';

/**
 * SummaryCard Component
 *
 * Display key metrics in a card format with optional icon, large value text, and subtitle.
 * Used for displaying quick stats and summary information.
 *
 * @param icon - Optional emoji or icon to display
 * @param title - Card title
 * @param value - Main value to display (large text)
 * @param subtitle - Optional subtitle text below value
 * @param variant - Visual variant (default, accent, success)
 */

interface SummaryCardProps {
  icon?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: 'default' | 'accent' | 'success';
}

export function SummaryCard({
  icon,
  title,
  value,
  subtitle,
  variant = 'default',
}: SummaryCardProps) {
  const variantClasses = {
    default: 'bg-surface border-text-primary/10',
    accent: 'bg-brand-blue/5 border-brand-blue/20',
    success: 'bg-green-500/5 border-green-500/20',
  };

  return (
    <div className={`p-4 rounded-lg border ${variantClasses[variant]} space-y-2 shadow-soft hover:shadow-soft hover:translate-y-[-2px] transition-all duration-300`}>
      <div className="flex items-center gap-2">
        {icon && <span className="text-lg">{icon}</span>}
        <h4 className="text-sm font-medium text-text-secondary">{title}</h4>
      </div>
      <div className="text-2xl font-semibold font-serif text-text-primary">{value}</div>
      {subtitle && <p className="text-xs text-text-secondary">{subtitle}</p>}
    </div>
  );
}
