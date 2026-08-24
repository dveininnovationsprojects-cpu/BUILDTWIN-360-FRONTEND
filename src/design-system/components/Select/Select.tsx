import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/design-system/utils/cn';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      <select
        id={id}
        ref={ref}
        className={cn(
          'h-9 rounded border border-surface-border bg-surface-base px-3 text-sm text-ink-900',
          'focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400',
          error && 'border-status-danger focus:ring-status-danger',
          className,
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-status-danger">{error}</span>}
    </div>
  ),
);
Select.displayName = 'Select';
