import { cn } from '@/lib/utils';
import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground-800 mb-1.5">
            {label}
            {props.required && <span className="text-accent-500 ltr:ml-0.5 rtl:mr-0.5">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-3 py-2.5 text-sm rounded-md border bg-background-50 text-foreground-950 placeholder:text-foreground-400 transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400',
            error
              ? 'border-accent-500 focus:ring-accent-400 focus:border-accent-400'
              : 'border-background-300/60 hover:border-background-400',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-accent-600">{error}</p>
        )}
        {helper && !error && (
          <p className="mt-1 text-xs text-foreground-500">{helper}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';