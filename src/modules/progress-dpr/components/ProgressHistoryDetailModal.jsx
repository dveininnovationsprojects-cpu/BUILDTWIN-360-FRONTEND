import {
  Calendar,
  Layers,
  Activity,
  HardHat,
  Truck,
  CloudSun,
  AlertTriangle,
  FileText,
  User,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Modal, Button } from '@/design-system';

export function ProgressHistoryDetailModal({ open, onClose, item, onOpenDpr }) {
  if (!item) return null;

  const isDpr = item.source === 'DPR';
  const progressPct = Number(item.cumulativeProgressPercentage ?? 0).toFixed(1);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-semibold text-ink-900">
            Progress Journal Entry #{item.id}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${
              isDpr
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {isDpr ? 'DPR Shift Cascade' : 'Direct Site Log'}
          </span>
          {item.isBlocker && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700 border border-rose-200">
              <AlertTriangle className="h-3 w-3" />
              Site Blocker
            </span>
          )}
        </div>
      }
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="text-xs text-ink-500">
            Recorded by <strong className="text-ink-700">{item.recordedBy || 'Site Engineer'}</strong> on{' '}
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : item.logDate}
          </div>
          <div className="flex items-center gap-2">
            {isDpr && item.dprId && onOpenDpr && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5 border-brand-500 text-brand-600 hover:bg-brand-50"
                onClick={() => {
                  onClose();
                  onOpenDpr(item.dprId, item.dprReportCode);
                }}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>View Linked DPR</span>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-5 py-1">
        {/* Top Header Card */}
        <div className="rounded-xl border border-surface-border bg-gradient-to-r from-surface-subtle via-surface-card to-surface-subtle p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-brand-100 px-2 py-0.5 font-mono text-xs font-bold text-brand-700">
                  {item.activityCode || 'ACT-WBS'}
                </span>
                <span className="rounded bg-surface-subtle px-2 py-0.5 text-xs font-medium text-ink-600 border border-surface-border">
                  {item.discipline || 'GENERAL'}
                </span>
              </div>
              <h3 className="mt-1.5 text-base font-bold text-ink-900">
                {item.activityName || 'Activity Execution'}
              </h3>
              <p className="text-xs text-ink-500">
                Work Package: <strong className="text-ink-700">{item.workPackageName || 'Main Package'}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                  Cumulative Progress
                </span>
                <span className="text-xl font-extrabold text-brand-700">
                  {progressPct}%
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
              <div
                className="h-full rounded-full bg-brand-600 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, Number(progressPct)))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Output Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-surface-border bg-surface-card p-3 shadow-2xs">
            <div className="flex items-center gap-1.5 text-ink-500">
              <Activity className="h-3.5 w-3.5 text-brand-600" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Output Today</span>
            </div>
            <div className="mt-1 text-base font-bold text-ink-900">
              {item.quantityCompletedToday ?? 0}{' '}
              <span className="text-xs font-normal text-ink-500">{item.uom || ''}</span>
            </div>
            {item.progressPercentageToday > 0 && (
              <span className="mt-0.5 inline-block text-[10px] font-medium text-emerald-600">
                +{Number(item.progressPercentageToday).toFixed(1)}% today
              </span>
            )}
          </div>

          <div className="rounded-xl border border-surface-border bg-surface-card p-3 shadow-2xs">
            <div className="flex items-center gap-1.5 text-ink-500">
              <Layers className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Cumulative Total</span>
            </div>
            <div className="mt-1 text-base font-bold text-ink-900">
              {item.cumulativeQuantityCompleted ?? 0}{' '}
              <span className="text-xs font-normal text-ink-500">{item.uom || ''}</span>
            </div>
            <span className="mt-0.5 inline-block text-[10px] text-ink-400">Total logged output</span>
          </div>

          <div className="rounded-xl border border-surface-border bg-surface-card p-3 shadow-2xs">
            <div className="flex items-center gap-1.5 text-ink-500">
              <HardHat className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Manpower</span>
            </div>
            <div className="mt-1 text-base font-bold text-ink-900">
              {item.manpowerCount ?? '—'}{' '}
              <span className="text-xs font-normal text-ink-500">workers</span>
            </div>
            <span className="mt-0.5 inline-block text-[10px] text-ink-400">Deployed shift gang</span>
          </div>

          <div className="rounded-xl border border-surface-border bg-surface-card p-3 shadow-2xs">
            <div className="flex items-center gap-1.5 text-ink-500">
              <CloudSun className="h-3.5 w-3.5 text-indigo-600" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Weather</span>
            </div>
            <div className="mt-1 text-sm font-bold text-ink-900">
              {item.weatherCondition || 'NORMAL'}
            </div>
            <span className="mt-0.5 inline-block text-[10px] text-ink-400">Site environmental</span>
          </div>
        </div>

        {/* Site Details Sections */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Equipment Deployed */}
          <div className="rounded-xl border border-surface-border p-3.5 bg-surface-card">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-500">
              <Truck className="h-4 w-4 text-ink-600" />
              <span>Equipment & Machinery</span>
            </div>
            <p className="mt-2 text-xs text-ink-800">
              {item.equipmentUsed || 'No heavy equipment or machinery specifically tagged to this activity.'}
            </p>
          </div>

          {/* Linked DPR Origin */}
          <div className="rounded-xl border border-surface-border p-3.5 bg-surface-card">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-500">
              <FileText className="h-4 w-4 text-ink-600" />
              <span>Log Source & Reference</span>
            </div>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-ink-500">Source:</span>
                <span className="font-semibold text-ink-800">{item.source || 'MANUAL_LOG'}</span>
              </div>
              {item.dprReportCode && (
                <div className="flex items-center justify-between">
                  <span className="text-ink-500">DPR Code:</span>
                  <span className="font-mono font-medium text-brand-600">{item.dprReportCode}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-ink-500">Log Date:</span>
                <span className="font-medium text-ink-800">{item.logDate || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Blocker Information (if present) */}
        {item.isBlocker && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-800">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              <span>Active Site Blocker Encountered</span>
            </div>
            <div className="mt-2 space-y-1.5 text-xs">
              {item.blockerCategory && (
                <div>
                  <span className="font-semibold text-rose-900">Category: </span>
                  <span className="rounded bg-rose-100 px-2 py-0.5 font-medium text-rose-800">
                    {item.blockerCategory}
                  </span>
                </div>
              )}
              {item.blockerReason && (
                <div>
                  <span className="font-semibold text-rose-900">Root Cause: </span>
                  <p className="mt-0.5 text-rose-800">{item.blockerReason}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Site Hindrance Notes (if present) */}
        {item.siteHindranceNotes && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Site Hindrance & Operational Delay Notes
            </span>
            <p className="mt-1 text-xs text-amber-900">{item.siteHindranceNotes}</p>
          </div>
        )}

        {/* General Remarks */}
        {item.remarks && (
          <div className="rounded-xl border border-surface-border p-3.5 bg-surface-subtle">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
              Site Remarks & Handover Notes
            </span>
            <p className="mt-1 text-xs text-ink-800 leading-relaxed">{item.remarks}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
