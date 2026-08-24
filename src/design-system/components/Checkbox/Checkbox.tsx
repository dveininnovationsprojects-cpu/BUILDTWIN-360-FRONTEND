import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/design-system/utils/cn';

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => (
    <label htmlFor={id} className="flex items-center gap-2 text-sm text-ink-700 cursor-pointer">
      <input
        id={id}
        ref={ref}
        type="checkbox"
        className={cn(
          'h-4 w-4 rounded border-surface-border text-brand-500 focus:ring-brand-400',
          className,
        )}
        {...props}
      />
      {label}
    </label>
  ),
);
Checkbox.displayName = 'Checkbox';
