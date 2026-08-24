import { cn } from '@/design-system/utils/cn';

export interface ProgressBarProps {
  value: number; // 0-100
  tone?: 'brand' | 'success' | 'warning' | 'danger';
  className?: string;
}

/** Used for physical-progress %, budget utilisation and stock-depletion indicators. */
export function ProgressBar({ value, tone = 'brand', className }: ProgressBarProps) {
  const bar = {
    brand: 'bg-brand-500',
    success: 'bg-status-success',
    warning: 'bg-status-warning',
    danger: 'bg-status-danger',
  }[tone];
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-muted', className)}>
      <div className={cn('h-full rounded-full transition-all', bar)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
