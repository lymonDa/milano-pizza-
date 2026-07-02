import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'accent' | 'secondary' | 'success' | 'warning' | 'default';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  const variants = {
    primary: 'bg-primary-100 text-primary-900',
    accent: 'bg-accent-100 text-accent-900',
    secondary: 'bg-secondary-100 text-secondary-900',
    success: 'bg-primary-100 text-primary-800',
    warning: 'bg-accent-100/70 text-accent-800',
    default: 'bg-background-200 text-foreground-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium whitespace-nowrap',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}