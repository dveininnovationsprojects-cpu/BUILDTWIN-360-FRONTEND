import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/design-system/utils/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      <textarea
        id={id}
        ref={ref}
        className={cn(
          'min-h-[88px] rounded border border-surface-border bg-surface-base px-3 py-2 text-sm text-ink-900 placeholder:text-ink-300',
          'focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400',
          error && 'border-status-danger focus:ring-status-danger',
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs text-status-danger">{error}</span>}
    </div>
  ),
);
Textarea.displayName = 'Textarea';
