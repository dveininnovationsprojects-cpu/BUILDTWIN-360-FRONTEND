import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/design-system/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink-700">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'h-9 rounded border border-surface-border bg-surface-base px-3 text-sm text-ink-900 placeholder:text-ink-300',
            'focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400',
            error && 'border-status-danger focus:ring-status-danger',
            className,
          )}
          {...props}
        />
        {hint && !error && <span className="text-xs text-ink-500">{hint}</span>}
        {error && <span className="text-xs text-status-danger">{error}</span>}
      </div>
    );
  },
);
Input.displayName = 'Input';
