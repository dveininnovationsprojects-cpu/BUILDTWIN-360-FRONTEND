import {
  Briefcase,
  PlayCircle,
  Layers,
  PauseCircle,
  CheckCircle2,
  IndianRupee,
  Sparkles,
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
      gradient: 'from-brand-500/10 via-brand-500/5 to-transparent',
      borderColor: 'border-brand-200 hover:border-brand-400 dark:border-brand-800/80 dark:hover:border-brand-700',
      textColor: 'text-brand-700 dark:text-brand-300',
      iconBg: 'bg-brand-50 text-brand-600 dark:bg-brand-950/70 dark:text-brand-300',
      hoverGlow: 'hover:shadow-[0_8px_25px_-5px_rgba(59,130,246,0.18)]',
      onClick: onSelectStatus ? () => onSelectStatus('ALL') : undefined,
    },
    {
      label: 'In Progress',
      value: inProgress,
      icon: PlayCircle,
      gradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
      borderColor: 'border-blue-200 hover:border-blue-400 dark:border-blue-800/80 dark:hover:border-blue-700',
      textColor: 'text-blue-700 dark:text-blue-300',
      iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-300',
      hoverGlow: 'hover:shadow-[0_8px_25px_-5px_rgba(37,99,235,0.18)]',
      hasLivePulse: inProgress > 0,
      pulseColor: 'bg-blue-500',
      onClick: onSelectStatus ? () => onSelectStatus('IN_PROGRESS') : undefined,
    },
    {
      label: 'Planned',
      value: planned,
      icon: Layers,
      gradient: 'from-sky-500/10 via-sky-500/5 to-transparent',
      borderColor: 'border-sky-200 hover:border-sky-400 dark:border-sky-800/80 dark:hover:border-sky-700',
      textColor: 'text-sky-700 dark:text-sky-300',
      iconBg: 'bg-sky-50 text-sky-600 dark:bg-sky-950/70 dark:text-sky-300',
      hoverGlow: 'hover:shadow-[0_8px_25px_-5px_rgba(14,165,233,0.18)]',
      onClick: onSelectStatus ? () => onSelectStatus('PLANNED') : undefined,
    },
    {
      label: 'On Hold',
      value: onHold,
      icon: PauseCircle,
      gradient: onHold > 0 ? 'from-amber-500/12 via-amber-500/5 to-transparent' : 'from-slate-500/5 to-transparent',
      borderColor:
        onHold > 0
          ? 'border-amber-200 hover:border-amber-400 dark:border-amber-800/80 dark:hover:border-amber-700'
          : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700',
      textColor: onHold > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-slate-600 dark:text-slate-400',
      iconBg: onHold > 0 ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/70 dark:text-amber-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
      hoverGlow: onHold > 0 ? 'hover:shadow-[0_8px_25px_-5px_rgba(245,158,11,0.18)]' : 'hover:shadow-md',
      onClick: onSelectStatus ? () => onSelectStatus('ON_HOLD') : undefined,
    },
    {
      label: 'Completed',
      value: completed,
      icon: CheckCircle2,
      gradient: 'from-emerald-500/12 via-emerald-500/5 to-transparent',
      borderColor: 'border-emerald-200 hover:border-emerald-400 dark:border-emerald-800/80 dark:hover:border-emerald-700',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-300',
      hoverGlow: 'hover:shadow-[0_8px_25px_-5px_rgba(16,185,129,0.18)]',
      hasCheckGlow: completed > 0,
      onClick: onSelectStatus ? () => onSelectStatus('COMPLETED') : undefined,
    },
    {
      label: 'Allocated Budget',
      value: formatCurrency(totalBudget),
      icon: IndianRupee,
      gradient: 'from-indigo-500/12 via-indigo-500/5 to-transparent',
      borderColor: 'border-indigo-200 hover:border-indigo-400 dark:border-indigo-800/80 dark:hover:border-indigo-700',
      textColor: 'text-indigo-700 dark:text-indigo-300',
      iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-300',
      hoverGlow: 'hover:shadow-[0_8px_25px_-5px_rgba(99,102,241,0.18)]',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map(
        ({
          label,
          value,
          icon: Icon,
          gradient,
          borderColor,
          textColor,
          iconBg,
          hoverGlow,
          hasLivePulse,
          pulseColor,
          hasCheckGlow,
          onClick,
        }) => (
          <div
            key={label}
            onClick={onClick}
            className={`group relative overflow-hidden rounded-2xl border bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3.5 shadow-xs transition-all duration-300 ease-out min-h-[90px] flex flex-col justify-between ${borderColor} ${hoverGlow} hover:-translate-y-1 active:scale-[0.98] ${
              onClick ? 'cursor-pointer' : ''
            }`}
          >
            {/* Ambient Background Gradient Tint */}
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient} opacity-80 transition-opacity duration-300 group-hover:opacity-100`}
            />

            {/* Top Row: Label & Micro-Action Icon */}
            <div className="relative z-10 flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5">
                {hasLivePulse && (
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        pulseColor || 'bg-blue-400'
                      }`}
                    />
                    <span
                      className={`relative inline-flex rounded-full h-2 w-2 shadow-xs ${
                        pulseColor || 'bg-blue-500'
                      }`}
                    />
                  </span>
                )}
                {hasCheckGlow && (
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-400 shrink-0" />
                )}
                <span className="text-[11px] font-bold tracking-wide uppercase text-ink-600 dark:text-ink-400 leading-tight truncate">
                  {label}
                </span>
              </div>

              {/* Icon Container with Micro-interaction Scale & Rotation */}
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl shadow-xs transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-6 ${iconBg}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Bottom Row: Metric Value */}
            <div className="relative z-10 mt-2 flex items-baseline justify-between">
              <span
                className={`text-xl sm:text-2xl font-extrabold tracking-tight transition-colors duration-200 leading-none ${textColor}`}
              >
                {value}
              </span>
            </div>
          </div>
        )
      )}
    </div>
  );
}
