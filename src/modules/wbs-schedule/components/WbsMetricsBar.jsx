import {
  Briefcase,
  PlayCircle,
  Layers,
  PauseCircle,
  CheckCircle2,
  IndianRupee,
} from 'lucide-react';
import { formatCurrency } from '@/modules/projects/constants';

export function WbsMetricsBar({ workPackages = [], onSelectStatus }) {
  const totalPackages = workPackages.length;
  const inProgress = workPackages.filter((w) => w.status === 'IN_PROGRESS').length;
  const planned = workPackages.filter((w) => w.status === 'PLANNED').length;
  const onHold = workPackages.filter((w) => w.status === 'ON_HOLD').length;
  const completed = workPackages.filter((w) => w.status === 'COMPLETED').length;
  const totalBudget = workPackages.reduce((acc, w) => acc + (Number(w.budgetAmount) || 0), 0);

  const cards = [
    {
      label: 'Total Packages',
      value: totalPackages,
      icon: Briefcase,
      color: 'text-brand-700 bg-brand-50/70 border-brand-200 dark:bg-brand-950/40 dark:border-brand-800 dark:text-brand-300',
      onClick: onSelectStatus ? () => onSelectStatus('ALL') : undefined,
    },
    {
      label: 'In Progress',
      value: inProgress,
      icon: PlayCircle,
      color: 'text-status-success bg-status-successBg border-status-success/30',
      onClick: onSelectStatus ? () => onSelectStatus('IN_PROGRESS') : undefined,
    },
    {
      label: 'Planned',
      value: planned,
      icon: Layers,
      color: 'text-sky-700 bg-sky-50/70 border-sky-200 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-300',
      onClick: onSelectStatus ? () => onSelectStatus('PLANNED') : undefined,
    },
    {
      label: 'On Hold',
      value: onHold,
      icon: PauseCircle,
      color:
        onHold > 0
          ? 'text-status-warning bg-status-warningBg border-status-warning/30'
          : 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/30 dark:border-slate-800',
      onClick: onSelectStatus ? () => onSelectStatus('ON_HOLD') : undefined,
    },
    {
      label: 'Completed',
      value: completed,
      icon: CheckCircle2,
      color: 'text-indigo-700 bg-indigo-50/70 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300',
      onClick: onSelectStatus ? () => onSelectStatus('COMPLETED') : undefined,
    },
    {
      label: 'Allocated Budget',
      value: formatCurrency(totalBudget),
      icon: IndianRupee,
      color: 'text-emerald-700 bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map(({ label, value, icon: Icon, color, onClick }) => (
        <div
          key={label}
          onClick={onClick}
          className={`group flex flex-col justify-between rounded-xl border p-3 shadow-xs transition-all hover:shadow-md min-h-[82px] ${color} ${
            onClick ? 'cursor-pointer' : ''
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold opacity-85 leading-tight">
              {label}
            </span>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/80 dark:bg-black/25 shadow-xs">
              <Icon className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-ink-900 leading-none">
              {value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
