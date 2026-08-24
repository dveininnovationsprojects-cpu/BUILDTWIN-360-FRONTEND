import { ReactNode } from 'react';
import { cn } from '@/design-system/utils/cn';

export interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaTone?: 'success' | 'warning' | 'danger' | 'neutral';
  icon?: ReactNode;
}

/** KPI tile for executive/project/site dashboards (Physical Progress %, SPI, CPI, open issues, etc). */
export function StatCard({ label, value, delta, deltaTone = 'neutral', icon }: StatCardProps) {
  const deltaClass = {
    success: 'text-status-success',
    warning: 'text-status-warning',
    danger: 'text-status-danger',
    neutral: 'text-ink-500',
  }[deltaTone];
  return (
    <div className="surface-panel p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</span>
        {icon && <span className="text-brand-500">{icon}</span>}
      </div>
      <span className="text-2xl font-semibold text-brand-900">{value}</span>
      {delta && <span className={cn('text-xs font-medium', deltaClass)}>{delta}</span>}
    </div>
  );
}
