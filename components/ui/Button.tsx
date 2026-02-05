import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', children, className = '', disabled, ...props }, ref) => {
    const baseStyles = 'px-4 py-2 rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:ring-offset-2';

    const variantStyles = {
      primary: disabled
        ? 'bg-brand-blue/50 text-surface cursor-not-allowed'
        : 'bg-brand-blue text-surface hover:bg-brand-blue/90 active:bg-brand-blue/80 shadow-cta',
      secondary: disabled
        ? 'bg-text-primary/5 text-text-muted cursor-not-allowed border border-text-primary/10'
        : 'bg-surface text-text-primary border border-text-primary/20 hover:bg-text-primary/5 hover:border-text-primary/30 active:bg-text-primary/10',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
