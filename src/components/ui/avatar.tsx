import { forwardRef, type HTMLAttributes } from 'react';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  name?: string | null;
  image?: string | null;
  isAI?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-11 w-11 text-base',
};

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ name, image, isAI = false, size = 'md', className = '', ...props }, ref) => {
    if (isAI) {
      return (
        <div
          ref={ref}
          className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white font-semibold shadow-sm ${sizeClasses[size]} ${className}`}
          aria-label="SEE AI"
          {...props}
        >
          <span className="tracking-tighter">S</span>
        </div>
      );
    }

    if (image) {
      return (
        <div
          ref={ref}
          className={`relative overflow-hidden rounded-full border border-border-default bg-surface-secondary ${sizeClasses[size]} ${className}`}
          {...props}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={name || 'Foydalanuvchi'} className="h-full w-full object-cover" />
        </div>
      );
    }

    const initials = name
      ? name
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : 'U';

    return (
      <div
        ref={ref}
        className={`flex items-center justify-center rounded-full bg-surface-tertiary text-text-secondary font-medium border border-border-default ${sizeClasses[size]} ${className}`}
        aria-label={name || 'Foydalanuvchi'}
        {...props}
      >
        {initials}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
