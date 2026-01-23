import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', children, className = '', disabled, ...props }, ref) => {
    const baseStyles = 'px-4 py-2 rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2';

    const variantStyles = {
      primary: disabled
        ? 'bg-accent/50 text-surface cursor-not-allowed'
        : 'bg-accent text-surface hover:bg-accent/90 active:bg-accent/80',
      secondary: disabled
        ? 'bg-text/5 text-text/30 cursor-not-allowed border border-text/10'
        : 'bg-surface text-text border border-text/20 hover:bg-text/5 hover:border-text/30 active:bg-text/10',
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
