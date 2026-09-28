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
      value: `${totalPackages} Packages`,
      icon: Briefcase,
      color: 'text-brand-600 bg-brand-50 border-brand-200 dark:bg-brand-950/40 dark:border-brand-800',
      onClick: onSelectStatus ? () => onSelectStatus('ALL') : undefined,
    },
    {
      label: 'In Progress',
      value: `${inProgress} Active`,
      icon: PlayCircle,
      color: 'text-status-success bg-status-successBg border-status-success/30',
      onClick: onSelectStatus ? () => onSelectStatus('IN_PROGRESS') : undefined,
    },
    {
      label: 'Planned',
      value: `${planned} Planned`,
      icon: Layers,
      color: 'text-sky-600 bg-sky-50 border-sky-200 dark:bg-sky-950/40 dark:border-sky-800',
      onClick: onSelectStatus ? () => onSelectStatus('PLANNED') : undefined,
    },
    {
      label: 'On Hold',
      value: `${onHold} On Hold`,
      icon: PauseCircle,
      color:
        onHold > 0
          ? 'text-status-warning bg-status-warningBg border-status-warning/30'
          : 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/30 dark:border-slate-800',
      onClick: onSelectStatus ? () => onSelectStatus('ON_HOLD') : undefined,
    },
    {
      label: 'Completed',
      value: `${completed} Delivered`,
      icon: CheckCircle2,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800',
      onClick: onSelectStatus ? () => onSelectStatus('COMPLETED') : undefined,
    },
    {
      label: 'Allocated Budget',
      value: formatCurrency(totalBudget),
      icon: IndianRupee,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map(({ label, value, icon: Icon, color, onClick }) => (
        <div
          key={label}
          onClick={onClick}
          className={`flex items-center gap-3 rounded-xl border p-3 shadow-xs transition-all hover:shadow-md ${color} ${
            onClick ? 'cursor-pointer' : ''
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/75 dark:bg-black/20 shadow-xs">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold leading-tight tracking-tight text-ink-900">{value}</p>
            <p className="text-xs font-semibold opacity-90 truncate mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
