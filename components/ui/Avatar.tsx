import { HTMLAttributes, forwardRef } from 'react';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt = 'Avatar', fallback, size = 'md', className = '', ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
    };

    const initials = fallback
      ? fallback.charAt(0).toUpperCase()
      : alt.charAt(0).toUpperCase();

    return (
      <div
        ref={ref}
        className={`
          relative inline-flex items-center justify-center
          rounded-full overflow-hidden
          bg-accent/10 text-accent font-medium
          ${sizeClasses[size]}
          ${className}
        `}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
