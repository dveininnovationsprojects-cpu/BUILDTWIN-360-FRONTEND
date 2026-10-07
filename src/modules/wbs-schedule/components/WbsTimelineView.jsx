import { Calendar, Clock, HardHat, Building } from 'lucide-react';
import { StatusPill } from '@/design-system';
import { formatCurrency } from '@/modules/projects/constants';
import { DISCIPLINE_LABELS, DISCIPLINE_BADGES } from '../constants/wbsConstants';

export function WbsTimelineView({ workPackages = [], onEdit, onUpdateStatus }) {
  if (workPackages.length === 0) {
    return (
      <div className="surface-panel rounded-2xl p-12 text-center text-ink-500">
        <p className="text-sm font-medium">No work packages available for timeline display.</p>
      </div>
    );
  }

  // Sort by planned start date
  const sorted = [...workPackages].sort((a, b) => {
    if (!a.plannedStartDate) return 1;
    if (!b.plannedStartDate) return -1;
    return new Date(a.plannedStartDate) - new Date(b.plannedStartDate);
  });

  const now = new Date();

  return (
    <div className="flex flex-col gap-4">
      {sorted.map((wp) => {
        const start = wp.plannedStartDate ? new Date(wp.plannedStartDate) : null;
        const end = wp.plannedEndDate ? new Date(wp.plannedEndDate) : null;
        let progressPercent = 0;
        let daysTotal = null;

        if (start && end) {
          daysTotal = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
          if (wp.status === 'COMPLETED') {
            progressPercent = 100;
          } else if (wp.status === 'PLANNED') {
            progressPercent = 0;
          } else {
            const elapsed = Math.ceil((now - start) / (1000 * 60 * 60 * 24));
            progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / daysTotal) * 100)));
          }
        }

        const disciplineBadge = DISCIPLINE_BADGES[wp.discipline] || 'bg-gray-100 text-gray-700';

        return (
          <div
            key={wp.id}
            className="surface-panel rounded-xl p-4 border border-surface-border hover:border-brand-300 transition-all flex flex-col gap-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-brand-50 text-brand-700 px-2.5 py-1 rounded">
                  {wp.code}
                </span>
                <h3 className="font-semibold text-ink-900 text-sm sm:text-base">{wp.name}</h3>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${disciplineBadge}`}>
                  {DISCIPLINE_LABELS[wp.discipline] || wp.discipline}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status={wp.status} />
                <button
                  type="button"
                  onClick={() => onUpdateStatus?.(wp)}
                  className="text-xs text-brand-600 hover:text-brand-800 font-medium px-2 py-1 rounded hover:bg-brand-50"
                >
                  Quick Status
                </button>
              </div>
            </div>

            {/* Scope / Description */}
            {wp.description && (
              <p className="text-xs text-ink-600 line-clamp-2">{wp.description}</p>
            )}

            {/* Metadata pills */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-ink-600 pt-1">
              {wp.siteName && (
                <span className="flex items-center gap-1">
                  <Building className="h-3.5 w-3.5 text-brand-500" />
                  Site: <strong className="text-ink-800">{wp.siteName}</strong>
                </span>
              )}
              {wp.assignedContractor && (
                <span className="flex items-center gap-1">
                  <HardHat className="h-3.5 w-3.5 text-amber-500" />
                  Contractor: <strong className="text-ink-800">{wp.assignedContractor}</strong>
                </span>
              )}
              {wp.budgetAmount > 0 && (
                <span>
                  Budget: <strong className="text-emerald-700">{formatCurrency(wp.budgetAmount)}</strong>
                </span>
              )}
              {wp.plannedStartDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-sky-500" />
                  {wp.plannedStartDate} → {wp.plannedEndDate || 'TBD'}
                  {daysTotal != null && (
                    <span className="text-ink-400 font-normal">({daysTotal} days)</span>
                  )}
                </span>
              )}
            </div>

            {/* Visual Timeline Bar */}
            {daysTotal != null && (
              <div className="flex flex-col gap-1 pt-1">
                <div className="flex items-center justify-between text-[11px] text-ink-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Timeline Progress
                  </span>
                  <span className="font-semibold text-ink-700">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-subtle overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      wp.status === 'COMPLETED'
                        ? 'bg-blue-600'
                        : wp.status === 'ON_HOLD'
                        ? 'bg-amber-500'
                        : wp.status === 'CANCELLED'
                        ? 'bg-rose-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
