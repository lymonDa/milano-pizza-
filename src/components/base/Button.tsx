import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  isLoading,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      'bg-primary-500 text-background-50 hover:bg-primary-600 active:bg-primary-700',
    secondary:
      'bg-secondary-500 text-background-50 hover:bg-secondary-600 active:bg-secondary-700',
    accent:
      'bg-accent-500 text-background-50 hover:bg-accent-600 active:bg-accent-700',
    outline:
      'border-2 border-primary-500 text-primary-700 hover:bg-primary-50 active:bg-primary-100',
    ghost:
      'text-foreground-700 hover:bg-background-100 active:bg-background-200',
    danger:
      'bg-accent-500 text-background-50 hover:bg-accent-600 active:bg-accent-700',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150 whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}