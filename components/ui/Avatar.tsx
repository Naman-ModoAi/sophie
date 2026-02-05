import { HTMLAttributes, forwardRef, useState } from 'react';
import Image from 'next/image';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt = 'Avatar', fallback, size = 'md', className = '', ...props }, ref) => {
    const [imageError, setImageError] = useState(false);

    const sizeClasses = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
    };

    const sizePixels = {
      sm: 32,
      md: 40,
      lg: 48,
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
          bg-brand-blue/10 text-brand-blue font-medium
          ${sizeClasses[size]}
          ${className}
        `}
        {...props}
      >
        {src && !imageError ? (
          <Image
            src={src}
            alt={alt}
            width={sizePixels[size]}
            height={sizePixels[size]}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
