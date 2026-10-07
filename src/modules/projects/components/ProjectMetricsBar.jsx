import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  Layers,
  PlayCircle,
  PauseCircle,
  CheckCircle2,
  IndianRupee,
  MapPin,
} from 'lucide-react';
import { projectsApi } from '../api/projectsApi';
import { formatCurrency } from '../constants';

export function ProjectMetricsBar({ onSelectStatus }) {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['projects-metrics'],
    queryFn: projectsApi.getMetrics,
  });

  if (isLoading && !metrics) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 animate-pulse">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl border border-surface-border bg-surface-subtle" />
        ))}
      </div>
    );
  }

  const m = metrics || {
    totalProjects: 0,
    activeProjects: 0,
    plannedProjects: 0,
    onHoldProjects: 0,
    completedProjects: 0,
    totalEstimatedBudget: 0,
    totalSites: 0,
  };

  const cards = [
    {
      label: 'Total Projects',
      value: m.totalProjects,
      icon: Building2,
      color: 'text-brand-700 bg-brand-50/70 border-brand-200 dark:bg-brand-950/40 dark:border-brand-800 dark:text-brand-300',
      onClick: onSelectStatus ? () => onSelectStatus('ALL') : undefined,
    },
    {
      label: 'Active',
      value: m.activeProjects,
      icon: PlayCircle,
      color: 'text-status-success bg-status-successBg border-status-success/30',
      onClick: onSelectStatus ? () => onSelectStatus('ACTIVE') : undefined,
    },
    {
      label: 'Planned',
      value: m.plannedProjects,
      icon: Layers,
      color: 'text-sky-700 bg-sky-50/70 border-sky-200 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-300',
      onClick: onSelectStatus ? () => onSelectStatus('PLANNED') : undefined,
    },
    {
      label: 'On Hold',
      value: m.onHoldProjects,
      icon: PauseCircle,
      color:
        m.onHoldProjects > 0
          ? 'text-status-warning bg-status-warningBg border-status-warning/30'
          : 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/30 dark:border-slate-800',
      onClick: onSelectStatus ? () => onSelectStatus('ON_HOLD') : undefined,
    },
    {
      label: 'Completed',
      value: m.completedProjects,
      icon: CheckCircle2,
      color: 'text-indigo-700 bg-indigo-50/70 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300',
      onClick: onSelectStatus ? () => onSelectStatus('COMPLETED') : undefined,
    },
    {
      label: 'Total Budget',
      value: formatCurrency(m.totalEstimatedBudget),
      icon: IndianRupee,
      color: 'text-emerald-700 bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300',
    },
    {
      label: 'Project Sites',
      value: m.totalSites,
      icon: MapPin,
      color: 'text-purple-700 bg-purple-50/70 border-purple-200 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
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
