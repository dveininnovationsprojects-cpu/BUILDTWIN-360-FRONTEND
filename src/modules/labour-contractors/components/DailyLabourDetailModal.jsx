import { Modal, Button } from '@/design-system';
import {
  Calendar,
  Building2,
  Hammer,
  Users,
  Clock,
  MapPin,
  CheckCircle2,
  FileText,
  Layers,
} from 'lucide-react';

export function DailyLabourDetailModal({ open, onClose, record, onEdit }) {
  if (!record) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Daily Labour Deployment Details"
      size="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              if (onEdit) onEdit(record);
            }}
          >
            Edit Record
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3.5 text-xs">
        {/* Header summary */}
        <div className="flex items-start justify-between border-b border-surface-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-ink-900">{record.contractor}</span>
              {record.contractorCode && (
                <span className="font-mono text-[11px] font-semibold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200">
                  {record.contractorCode}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-ink-500 mt-1 text-[11px]">
              <MapPin className="h-3.5 w-3.5 text-brand-600 shrink-0" />
              <span>{record.siteLocation || 'Tower A (Stilt + 18 Floors)'}</span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-status-success/30 bg-status-successBg px-2.5 py-0.5 text-[11px] font-semibold text-status-success">
            <CheckCircle2 className="h-3 w-3" />
            {record.status || 'VERIFIED'}
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl border border-surface-border bg-surface-subtle p-2.5">
            <span className="text-ink-400 block">Date of Deployment</span>
            <span className="font-bold text-ink-900 text-sm mt-0.5 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-brand-600" />
              {record.date || record.recordDate}
            </span>
          </div>

          <div className="rounded-xl border border-surface-border bg-surface-subtle p-2.5">
            <span className="text-ink-400 block">Trade Discipline</span>
            <span className="font-bold text-ink-900 text-sm mt-0.5 flex items-center gap-1.5">
              <Hammer className="h-3.5 w-3.5 text-brand-600" />
              {record.trade || record.tradeCategory || 'Masonry'}
            </span>
          </div>

          <div className="rounded-xl border border-surface-border bg-surface-subtle p-2.5">
            <span className="text-ink-400 block">Headcount Deployed</span>
            <span className="font-bold text-brand-600 text-base mt-0.5 flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {record.headcount} Workers
            </span>
          </div>

          <div className="rounded-xl border border-surface-border bg-surface-subtle p-2.5">
            <span className="text-ink-400 block">Hours Logged</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-semibold text-ink-900">
                {record.standardHours ?? 8}h Shift
              </span>
              {Number(record.overtimeHours) > 0 && (
                <span className="rounded bg-status-warningBg border border-status-warning/30 px-1.5 py-0.5 text-status-warning font-bold text-[11px]">
                  +{record.overtimeHours}h OT
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Task Allocation / Work Description if any */}
        {record.allocations && record.allocations.length > 0 && (
          <div className="rounded-xl border border-surface-border bg-surface-subtle p-3">
            <span className="font-semibold text-ink-800 flex items-center gap-1.5 mb-1.5">
              <Layers className="h-3.5 w-3.5 text-brand-600" />
              WBS Activity Task Allocation:
            </span>
            <div className="flex flex-col gap-1 text-ink-600">
              {record.allocations.map((alloc, i) => (
                <div key={i} className="flex items-center justify-between bg-surface-card rounded p-2 border border-surface-border">
                  <span>{alloc.activityDescription || 'Task assignment'}</span>
                  <span className="font-semibold text-ink-900">{alloc.hoursAllocated} hrs</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Supervisor Remarks */}
        {record.remarks && (
          <div className="rounded-xl border border-surface-border bg-surface-subtle p-3">
            <span className="font-semibold text-ink-800 flex items-center gap-1.5 mb-1">
              <FileText className="h-3.5 w-3.5 text-brand-600" />
              Supervisor Observations / Notes:
            </span>
            <p className="text-ink-600 leading-relaxed pl-5">{record.remarks}</p>
          </div>
        )}

        {/* Verification Footer Note */}
        <div className="rounded-lg bg-surface-subtle p-2 text-[11px] text-ink-400 text-center">
          Verified by Site Engineer • Linked with Daily Progress Report (DPR)
        </div>
      </div>
    </Modal>
  );
}
