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
      value: `${m.totalProjects} Projects`,
      icon: Building2,
      color: 'text-brand-600 bg-brand-50 border-brand-200 dark:bg-brand-950/40 dark:border-brand-800',
      onClick: onSelectStatus ? () => onSelectStatus('ALL') : undefined,
    },
    {
      label: 'Active Execution',
      value: `${m.activeProjects} Active`,
      icon: PlayCircle,
      color: 'text-status-success bg-status-successBg border-status-success/30',
      onClick: onSelectStatus ? () => onSelectStatus('ACTIVE') : undefined,
    },
    {
      label: 'Planned',
      value: `${m.plannedProjects} Planned`,
      icon: Layers,
      color: 'text-sky-600 bg-sky-50 border-sky-200 dark:bg-sky-950/40 dark:border-sky-800',
      onClick: onSelectStatus ? () => onSelectStatus('PLANNED') : undefined,
    },
    {
      label: 'On Hold',
      value: `${m.onHoldProjects} On Hold`,
      icon: PauseCircle,
      color:
        m.onHoldProjects > 0
          ? 'text-status-warning bg-status-warningBg border-status-warning/30'
          : 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/30 dark:border-slate-800',
      onClick: onSelectStatus ? () => onSelectStatus('ON_HOLD') : undefined,
    },
    {
      label: 'Completed',
      value: `${m.completedProjects} Delivered`,
      icon: CheckCircle2,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800',
      onClick: onSelectStatus ? () => onSelectStatus('COMPLETED') : undefined,
    },
    {
      label: 'Total Budget',
      value: formatCurrency(m.totalEstimatedBudget),
      icon: IndianRupee,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800',
    },
    {
      label: 'Project Sites',
      value: `${m.totalSites} Sites`,
      icon: MapPin,
      color: 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-800',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
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
